import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const widgetSource = ts.transpileModule(read('src/lib/antibot/captcha-widget.ts'), {
	compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
}).outputText;
const { createCaptchaWidget } = await import(
	'data:text/javascript;base64,' + Buffer.from(widgetSource).toString('base64')
);
const loaderSource = read('src/lib/antibot/smartcaptcha.js')
	.replace('export const SITE_KEY = import.meta.env.VITE_SMARTCAPTCHA_SITE_KEY;', '')
	.replace('export function loadCaptchaScript', 'function loadCaptchaScript');

function sdk() {
	const widgets = [];
	const api = {
		render(container, options) {
			widgets.push({ options, events: new Map(), destroyed: false, resets: 0 });
			return widgets.length - 1;
		},
		subscribe(id, event, handler) {
			widgets[id].events.set(event, handler);
			return () => widgets[id].events.delete(event);
		},
		destroy(id) {
			widgets[id].destroyed = true;
		},
		reset(id) {
			widgets[id].resets++;
		}
	};
	return { api, widgets };
}

function loaderHarness(existing = false) {
	const scripts = [];
	const timers = new Map();
	let nextTimer = 0;
	class Script extends EventTarget {
		src = '';
		remove() {
			const index = scripts.indexOf(this);
			if (index >= 0) scripts.splice(index, 1);
		}
	}
	if (existing) {
		const script = new Script();
		script.src = 'https://smartcaptcha.cloud.yandex.ru/captcha.js';
		scripts.push(script);
	}
	const window = {};
	const context = {
		window,
		document: {
			querySelector: () => scripts[0] ?? null,
			createElement: () => new Script(),
			head: { appendChild: (script) => scripts.push(script) }
		},
		setTimeout: (fn, delay) => {
			timers.set(++nextTimer, { fn, delay });
			return nextTimer;
		},
		clearTimeout: (id) => timers.delete(id)
	};
	vm.runInNewContext(loaderSource, context);
	return { ...context, scripts, timers, load: context.loadCaptchaScript };
}

function widgetHarness(loadOverride) {
	const fake = sdk();
	const tokens = [];
	const states = [];
	const errors = [];
	const widget = createCaptchaWidget({
		container: { replaceChildren() {} },
		sitekey: 'test-sitekey',
		load: loadOverride ?? (async () => fake.api),
		onverify: (token) => tokens.push(token),
		onstate: (state) => states.push(state),
		onerror: (error) => errors.push(error)
	});
	return { ...fake, widget, tokens, states, errors };
}

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}

test('SDK requests are shared by simultaneous forms; callback requires a usable API', async () => {
	const h = loaderHarness();
	const first = h.load();
	assert.equal(h.load(), first);
	assert.equal(h.scripts.length, 1);
	const name = new URL(h.scripts[0].src).searchParams.get('onload');
	h.window[name]();
	assert.equal(h.timers.size, 1);
	h.window.smartCaptcha = sdk().api;
	h.window[name]();
	assert.equal(await first, h.window.smartCaptcha);
	assert.equal(h.timers.size, 0);
	assert.equal(h.window[name], undefined);
	assert.equal(await h.load(), h.window.smartCaptcha);
	assert.equal(h.scripts.length, 1);
});

for (const failure of ['error', 'timeout', 'load-without-api']) {
	test(`SDK ${failure} rejects, clears pending state and permits retry`, async () => {
		const h = loaderHarness();
		const first = h.load();
		const rejection = assert.rejects(first, /SmartCaptcha/);
		const script = h.scripts[0];
		const oldName = new URL(script.src).searchParams.get('onload');
		const lateCallback = h.window[oldName];
		if (failure === 'timeout') {
			const timer = [...h.timers.values()][0];
			assert.equal(timer.delay, 15000);
			timer.fn();
		} else script.dispatchEvent(new Event(failure === 'error' ? 'error' : 'load'));
		await rejection;
		assert.equal(h.scripts.length, 0);
		assert.equal(h.timers.size, 0);
		assert.equal(h.window[oldName], undefined);
		const retry = h.load();
		assert.notEqual(retry, first);
		assert.equal(h.load(), retry);
		const name = new URL(h.scripts[0].src).searchParams.get('onload');
		assert.notEqual(name, oldName);
		lateCallback();
		assert.equal(h.timers.size, 1);
		h.window.smartCaptcha = sdk().api;
		h.window[name]();
		assert.equal(await retry, h.window.smartCaptcha);
	});
}

test('an existing pending script is reused and checked on load', async () => {
	const h = loaderHarness(true);
	const pending = h.load();
	assert.equal(h.scripts.length, 1);
	h.window.smartCaptcha = sdk().api;
	h.scripts[0].dispatchEvent(new Event('load'));
	assert.equal(await pending, h.window.smartCaptcha);
	assert.equal(h.timers.size, 0);
});

test('server rendering never needs window/document', async () => {
	const context = {};
	vm.runInNewContext(loaderSource, context);
	assert.equal(await context.loadCaptchaScript(), undefined);
});

test('success, expiry and reset update the parent token immediately', async () => {
	const h = widgetHarness();
	await h.widget.retry();
	assert.equal(h.states.at(-1), 'ready');
	h.widgets[0].options.callback('valid-token');
	assert.equal(h.tokens.at(-1), 'valid-token');
	assert.equal(h.states.at(-1), 'verified');
	h.widgets[0].events.get('token-expired')();
	assert.equal(h.tokens.at(-1), '');
	assert.equal(h.states.at(-1), 'expired');
	h.widgets[0].options.callback('renewed-token');
	h.widget.reset();
	assert.equal(h.tokens.at(-1), '');
	assert.equal(h.widgets[0].resets, 1);
	assert.equal(h.states.at(-1), 'ready');
});

for (const event of ['network-error', 'javascript-error']) {
	test(`${event} invalidates the token, cleans up, and ignores old callbacks after retry`, async () => {
		const h = widgetHarness();
		await h.widget.retry();
		const old = h.widgets[0];
		old.options.callback('old-token');
		const oldExpiry = old.events.get('token-expired');
		old.events.get(event)(new Error(event));
		assert.equal(h.tokens.at(-1), '');
		assert.equal(h.states.at(-1), 'error');
		assert.equal(h.errors.length, 1);
		assert.equal(old.destroyed, true);
		assert.equal(old.events.size, 0);
		await h.widget.retry();
		h.widgets[1].options.callback('new-token');
		old.options.callback('late-token');
		oldExpiry();
		assert.equal(h.tokens.at(-1), 'new-token');
		assert.equal(h.states.at(-1), 'verified');
		h.widget.destroy();
		assert.equal(h.tokens.at(-1), '');
		assert.equal(h.widgets[1].events.size, 0);
	});
}

test('load failure can recover without remounting the form', async () => {
	const fake = sdk();
	let attempt = 0;
	const h = widgetHarness(async () => {
		if (++attempt === 1) throw new Error('offline');
		return fake.api;
	});
	await h.widget.retry();
	assert.equal(h.states.at(-1), 'error');
	await h.widget.retry();
	fake.widgets[0].options.callback('token');
	assert.equal(h.tokens.at(-1), 'token');
});

test('closing while loading prevents render and late error callbacks', async () => {
	for (const failure of [false, true]) {
		const pending = deferred();
		const h = widgetHarness(() => pending.promise);
		const starting = h.widget.retry();
		h.widget.destroy();
		if (failure) pending.reject(new Error('late failure'));
		else pending.resolve(h.api);
		await starting;
		assert.equal(h.widgets.length, 0);
		assert.equal(h.errors.length, 0);
		assert.equal(h.tokens.at(-1), '');
	}
});

test('overlapping retries only mount the newest attempt', async () => {
	const first = deferred();
	const second = deferred();
	let attempt = 0;
	const h = widgetHarness(() => (++attempt === 1 ? first.promise : second.promise));
	const old = h.widget.retry();
	const latest = h.widget.retry();
	second.resolve(h.api);
	await latest;
	first.resolve(h.api);
	await old;
	assert.equal(h.widgets.length, 1);
});

test('render and subscription failures do not leave a usable token or live widget', async () => {
	for (const method of ['render', 'subscribe', 'reset']) {
		const h = widgetHarness();
		if (method === 'reset') {
			await h.widget.retry();
			h.widgets[0].options.callback('token');
			h.api.reset = () => {
				throw new Error('reset failed');
			};
			h.widget.reset();
		} else {
			h.api[method] = () => {
				throw new Error(method + ' failed');
			};
			await h.widget.retry();
		}
		assert.equal(h.states.at(-1), 'error');
		assert.equal(h.tokens.at(-1), '');
		assert.equal(h.errors.length, 1);
		if (h.widgets.length) assert.equal(h.widgets[0].destroyed, true);
	}
});
