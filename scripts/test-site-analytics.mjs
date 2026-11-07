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
const lifecycle = loadServerModule(
	new URL('../src/lib/growth/analytics-lifecycle.ts', import.meta.url),
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
	path = '/',
	data = { yandexMetrica: '12345678', googleAnalytics: 'G-ONE12345' },
	target = {}
} = {}) {
	const mounts = [],
		effects = [],
		navigations = [],
		scripts = [],
		clicks = new Set();
	const site = { templateId };
	const page = {
		data: directSite ? { site } : { pageData: { site } },
		url: new URL(path, `https://${hostname}`)
	};
	const context = vm.createContext({
		window: target,
		Element: Button,
		document: {
			getElementById: (id) => scripts.find((script) => script.id === id),
			createElement: () => ({}),
			head: { appendChild: (script) => scripts.push(script) },
			addEventListener: (_, fn) => clicks.add(fn),
			removeEventListener: (_, fn) => clicks.delete(fn)
		},
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
		svelte: { onMount: (fn) => mounts.push(fn), onDestroy() {} },
		'$app/environment': { browser: true },
		'$app/state': { page },
		'$app/navigation': { afterNavigate: (fn) => navigations.push(fn), beforeNavigate() {} },
		'$lib/site-settings/analytics': analytics,
		'$lib/growth/analytics-lifecycle': lifecycle,
		'$lib/yandex-direct/tracking': evaluate(tracking, { './button-goals.json': goals })
	});
	mounts.forEach((fn) => fn());
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
		click: (id) => clicks.forEach((fn) => fn({ target: new Button(id) }))
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
