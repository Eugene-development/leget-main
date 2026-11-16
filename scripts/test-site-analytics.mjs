import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import { parse } from 'svelte/compiler';
import ts from 'typescript';
import { loadServerModule } from './test-server-module.mjs';

const component = readFileSync(
	new URL('../src/lib/components/SiteAnalytics.svelte', import.meta.url),
	'utf8'
);
const script = parse(component).instance.content;
const tracking = readFileSync(
	new URL('../src/lib/yandex-direct/tracking.ts', import.meta.url),
	'utf8'
);
const goals = JSON.parse(
	readFileSync(new URL('../src/lib/yandex-direct/button-goals.json', import.meta.url), 'utf8')
);
const analytics = loadServerModule(
	new URL('../src/lib/site-settings/analytics.ts', import.meta.url),
	{}
);

test('settings summary distinguishes persisted counters from unsaved changes', () => {
	const status = analytics.analyticsSettingsStatus;
	assert.equal(status('12345678', '12345678', 'yandex'), 'Подключена');
	assert.equal(status('', '', 'yandex'), 'Отключена');
	assert.equal(status('12345678', '', 'yandex'), 'Будет подключена после сохранения');
	assert.equal(status('87654321', '12345678', 'yandex'), 'Будет подключена после сохранения');
	assert.equal(status('', '12345678', 'yandex'), 'Будет отключена после сохранения');
	assert.equal(status(' 12345678 ', '12345678', 'yandex'), 'Подключена');
	assert.equal(status('invalid', '12345678', 'yandex'), 'Некорректный ID');
	assert.equal(status('g-test1234', 'G-TEST1234', 'google'), 'Подключён');
	assert.equal(status('', '', 'google'), 'Отключён');
	assert.equal(status('G-TEST1234', '', 'google'), 'Будет подключён после сохранения');
	assert.equal(status('', 'G-TEST1234', 'google'), 'Будет отключён после сохранения');
	assert.equal(status('invalid', '', 'google'), 'Некорректный ID');
	// Failed saves retain the persisted baseline; successful saves return the new baseline from load.
	assert.equal(status('87654321', '12345678', 'yandex'), 'Будет подключена после сохранения');
	assert.equal(status('87654321', '87654321', 'yandex'), 'Подключена');
});
const lifecycle = loadServerModule(
	new URL('../src/lib/growth/analytics-lifecycle.ts', import.meta.url),
	{}
);
const visits = loadServerModule(new URL('../src/lib/antibot/visit-gate.ts', import.meta.url), {});
const engagement = loadServerModule(
	new URL('../src/lib/antibot/engagement.ts', import.meta.url),
	{}
);

class Button {
	constructor(id) {
		this.dataset = { metrikaGoal: id };
	}
	closest(selector) {
		return selector === '[data-metrika-goal]' ? this : null;
	}
	matches() {
		return false;
	}
}

// Execute the actual component script; only Svelte lifecycle and browser surfaces
// are replaced. Each mount models a separate document/domain, with no network hits.
function mount({
	hostname = 'one.example',
	templateId = 1,
	directSite = false,
	enabled = true,
	antibot = false,
	path = '/',
	data = { yandexMetrica: '12345678', googleAnalytics: 'G-ONE12345' },
	target = {}
} = {}) {
	const mounts = [],
		effects = [],
		navigations = [],
		scripts = [],
		clicks = new Set(),
		listeners = new Map(),
		destroys = [],
		before = [];
	let time = 0;
	const timers = new Map();
	let timerId = 0;
	const doc = {
		visibilityState: 'visible',
		referrer: 'https://search.example/',
		getElementById: (id) => scripts.find((script) => script.id === id),
		createElement: () => ({}),
		head: { appendChild: (script) => scripts.push(script) },
		addEventListener: (type, fn) => {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type).add(fn);
			if (type === 'click') clicks.add(fn);
		},
		removeEventListener: (type, fn) => {
			listeners.get(type)?.delete(fn);
			clicks.delete(fn);
		}
	};
	const gate = visits.createVisitGate(doc, {
		now: () => time,
		set: (fn, ms) => {
			timers.set(++timerId, { fn, at: time + ms });
			return timerId;
		},
		clear: (id) => timers.delete(id)
	});
	const site = { templateId };
	const page = {
		data: directSite ? { site } : { pageData: { site } },
		url: new URL(path, `https://${hostname}`)
	};
	const context = vm.createContext({
		window: target,
		AbortController,
		URL,
		Element: Button,
		document: doc,
		$props: () => ({ data, enabled }),
		$derived: (value) => value,
		$effect: (fn) => effects.push(fn)
	});
	function evaluate(source, dependencies) {
		const { outputText } = ts.transpileModule(source, {
			compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS }
		});
		const module = { exports: {} };
		vm.runInContext(`(function(require, module, exports) { ${outputText}\n})`, context)(
			(name) => {
				assert.ok(Object.hasOwn(dependencies, name), name);
				return dependencies[name];
			},
			module,
			module.exports
		);
		return module.exports;
	}
	evaluate(component.slice(script.start, script.end), {
		svelte: { onMount: (fn) => mounts.push(fn), onDestroy: (fn) => destroys.push(fn) },
		'$env/dynamic/public': { env: { PUBLIC_ANTIBOT_ENABLED: String(antibot) } },
		'$lib/antibot/visit-gate': { documentVisitGate: () => gate },
		'$lib/antibot/engagement': {
			...engagement,
			checkEngagement: (_template, _goal, signal) =>
				target.checkEngagement?.(signal) ?? Promise.resolve(true)
		},
		'$app/environment': { browser: true },
		'$app/state': { page },
		'$app/navigation': {
			afterNavigate: (fn) => navigations.push(fn),
			beforeNavigate: (fn) => before.push(fn)
		},
		'$lib/site-settings/analytics': analytics,
		'$lib/growth/analytics-lifecycle': lifecycle,
		'$lib/yandex-direct/tracking': evaluate(tracking, { './button-goals.json': goals })
	});
	mounts.forEach((fn) => {
		const cleanup = fn();
		if (cleanup) destroys.push(cleanup);
	});
	const sync = () => {
		effects.forEach((fn) => fn());
		navigations.forEach((fn) => fn());
	};
	sync();
	return {
		target,
		scripts,
		page,
		sync,
		doc,
		gate,
		advance(ms) {
			time += ms;
			for (const [id, timer] of timers)
				if (timer.at <= time) {
					timers.delete(id);
					timer.fn();
				}
		},
		event: (type, isTrusted = true) =>
			listeners.get(type)?.forEach((fn) => fn({ type, isTrusted })),
		visibility(state) {
			doc.visibilityState = state;
			listeners.get('visibilitychange')?.forEach((fn) => fn({}));
		},
		leave(path) {
			before.forEach((fn) => fn({ to: { url: new URL(path, page.url) }, willUnload: true }));
		},
		destroy() {
			destroys.forEach((fn) => fn());
		},
		click: (id, isTrusted = true) =>
			clicks.forEach((fn) => fn({ target: new Button(id), isTrusted }))
	};
}

test('each domain queues Google commands in the Arguments format accepted by gtag.js', () => {
	for (const [hostname, googleAnalytics, yandexMetrica] of [
		['one.example', 'G-ONE12345', '12345678'],
		['two.example', 'G-TWO12345', '87654321']
	]) {
		const app = mount({ hostname, data: { googleAnalytics, yandexMetrica } });
		const queue = app.target.dataLayer;
		assert.equal(queue.length, 2, 'effect and afterNavigate must not duplicate initial hits');
		for (const command of queue) {
			assert.equal(Object.prototype.toString.call(command), '[object Arguments]');
			assert.equal(Array.isArray(command), false);
		}
		assert.equal(queue[0][0], 'js');
		assert.equal(queue[1][0], 'config');
		assert.equal(queue[1][1], googleAnalytics);
		assert.equal(queue[1][2].page_location, `https://${hostname}/`);
		assert.ok(
			app.scripts.some(
				(script) => script.src === `https://www.googletagmanager.com/gtag/js?id=${googleAnalytics}`
			)
		);
		assert.equal(app.target.ym.a[1][0], Number(yandexMetrica));
		app.page.url = new URL(`https://${hostname}/about`);
		app.sync();
		assert.equal(queue.length, 3);
		assert.equal(queue[2][1], googleAnalytics);
		assert.equal(queue[2][2].page_location, app.page.url.href);
	}
});

for (const templateId of [1, 2, 3]) {
	test(`Promo-${templateId} goals use the template from the renderPage response`, () => {
		const counterId = String(10000000 + templateId);
		const app = mount({ templateId, data: { yandexMetrica: counterId } });
		const goal = goals.find(
			(goal) => !goal.baseId && goal.templates.includes(`Promo-${templateId}`)
		);
		app.click(goal.id);
		const sent = app.target.ym.a.filter((args) => args[1] === 'reachGoal');
		assert.equal(sent.length, 1);
		assert.deepEqual(Array.from(sent[0]), [
			Number(counterId),
			'reachGoal',
			`promo_${templateId}_${goal.id}`
		]);
	});
}

test('calculator and university retain the direct site data contract', () => {
	const app = mount({ templateId: 2, directSite: true });
	const goal = goals.find((goal) => !goal.baseId && goal.templates.includes('Promo-2'));
	app.click(goal.id);
	assert.equal(app.target.ym.a.at(-1)[2], `promo_2_${goal.id}`);
});

test('disabled, private and unconfigured sites do not load analytics scripts', () => {
	for (const options of [
		{ enabled: false },
		{ path: '/crm' },
		{ path: '/?draft=secret' },
		{ data: {} }
	]) {
		const app = mount(options);
		assert.equal(app.scripts.length, 0);
		assert.equal(app.target.dataLayer, undefined);
		assert.equal(app.target.ym, undefined);
	}
});

test('an existing Google tag function and queued commands are preserved', () => {
	const calls = [],
		queued = { event: 'existing' };
	const gtag = (...args) => calls.push(args);
	const app = mount({ target: { gtag, dataLayer: [queued] } });
	assert.equal(app.target.gtag, gtag);
	assert.equal(app.target.dataLayer[0], queued);
	assert.equal(calls[1][1], 'G-ONE12345');
});

test('protected visits wait for activity or eight visible seconds, while Google starts immediately', () => {
	const app = mount({ antibot: true });
	assert.equal(app.target.ym, undefined);
	assert.equal(
		app.scripts.some((s) => s.id === 'leget-yandex-metrica'),
		false
	);
	assert.ok(app.target.dataLayer);
	app.advance(3000);
	app.visibility('hidden');
	app.advance(60000);
	assert.equal(app.target.ym, undefined);
	app.visibility('visible');
	app.advance(4999);
	assert.equal(app.target.ym, undefined);
	app.advance(1);
	assert.equal(app.target.ym.a.filter((a) => a[1] === 'hit').length, 1);
	app.sync();
	assert.equal(app.target.ym.a.filter((a) => a[1] === 'hit').length, 1);
	app.destroy();
});

for (const type of [
	'pointerdown',
	'touchstart',
	'keydown',
	'scroll',
	'pointermove',
	'mousemove',
	'wheel',
	'click'
]) {
	test(`${type} activates a visit only for trusted input`, () => {
		const app = mount({ antibot: true });
		app.event(type, false);
		assert.equal(app.target.ym, undefined);
		app.event(type);
		assert.equal(app.target.ym.a[0][1], 'init');
		app.destroy();
	});
}

test('first real CTA is counted once; synthetic clicks never send a protected goal', async () => {
	const app = mount({ antibot: true, path: '/?yclid=123&utm_source=direct' });
	const goal = goals.find((g) => !g.baseId && g.templates.includes('Promo-1'));
	app.click(goal.id, false);
	assert.equal(app.target.ym, undefined);
	app.click(goal.id);
	await new Promise(setImmediate);
	assert.deepEqual(Array.from(app.target.ym.a.map((a) => a[1])), ['init', 'hit', 'reachGoal']);
	assert.equal(app.target.ym.a[1][2], 'https://one.example/?yclid=123&utm_source=direct');
	assert.equal(app.target.ym.a[1][3].referer, 'https://search.example/');
	app.click(goal.id);
	await new Promise(setImmediate);
	assert.equal(app.target.ym.a.filter((a) => a[1] === 'reachGoal').length, 1);
	app.destroy();
});

test('delayed activation sends the original landing before the current SPA page', () => {
	const app = mount({ antibot: true, path: '/?yclid=42' });
	app.page.url = new URL('https://one.example/about');
	app.sync();
	app.advance(8000);
	assert.deepEqual(Array.from(app.target.ym.a.filter((a) => a[1] === 'hit').map((a) => a[2])), [
		'https://one.example/?yclid=42',
		'https://one.example/about'
	]);
	app.sync();
	assert.equal(app.target.ym.a.filter((a) => a[1] === 'hit').length, 2);
	app.destroy();
});

test('leaving for a private page cancels delayed goals and the activation timer', async () => {
	let finish;
	const app = mount({
		antibot: true,
		target: {
			checkEngagement: () =>
				new Promise((resolve) => {
					finish = resolve;
				})
		}
	});
	app.click(goals.find((g) => !g.baseId && g.templates.includes('Promo-1')).id);
	app.leave('/crm');
	finish(true);
	await new Promise(setImmediate);
	assert.equal(
		app.target.ym.a.some((a) => a[1] === 'reachGoal'),
		false
	);
	app.destroy();
	const passive = mount({ antibot: true });
	passive.leave('/crm');
	passive.advance(8000);
	assert.equal(passive.target.ym, undefined);
	passive.destroy();
});
