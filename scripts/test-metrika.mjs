import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const read = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
function moduleUrl(source) {
	return (
		'data:text/javascript;base64,' +
		Buffer.from(
			ts.transpileModule(source, {
				compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
			}).outputText
		).toString('base64')
	);
}
const apiUrl = moduleUrl(read('src/lib/server/metrika-api.ts'));
const { MetrikaApi, MetrikaError, counterBelongsTo, remoteGoalState } = await import(apiUrl);
const definition = { name: 'Открытие формы', eventName: 'promo_1_form_open' };
const remote = {
	id: 42,
	name: definition.name,
	type: 'action',
	conditions: [{ type: 'exact', url: definition.eventName }]
};
const counter = {
	id: 123,
	name: 'Site',
	permission: 'own',
	site2: { site: 'https://example.test' },
	status: 'Active'
};
const ok = (data) => new Response(JSON.stringify(data), { status: 200 });
test('exact domain, mirrors and write permissions', () => {
	assert.equal(counterBelongsTo(counter, 'example.test'), true);
	for (const site of ['evil-example.test', 'example.test.evil', 'sub.example.test'])
		assert.equal(counterBelongsTo({ ...counter, site2: { site } }, 'example.test'), false);
	for (const change of [{ permission: 'view' }, { status: 'Deleted' }])
		assert.equal(counterBelongsTo({ ...counter, ...change }, 'example.test'), false);
	assert.equal(
		counterBelongsTo(
			{ ...counter, site2: { site: 'another.test' }, mirrors2: [{ site: 'example.test' }] },
			'example.test'
		),
		true
	);
});
test('exact action matching, deleted goals and conflicts', () => {
	assert.equal(remoteGoalState([remote], definition).state, 'created');
	assert.equal(remoteGoalState([{ ...remote, type: 'url' }], definition).state, 'conflict');
	assert.equal(
		remoteGoalState(
			[{ ...remote, conditions: [{ type: 'contain', url: definition.eventName }] }],
			definition
		).state,
		'conflict'
	);
	assert.equal(remoteGoalState([{ ...remote, status: 'deleted' }], definition).state, 'missing');
});
test('POST once, exact payload, duplicate avoidance and lost-response reconciliation', async () => {
	for (const loseResponse of [false, true]) {
		let saved = false;
		const calls = [];
		const api = new MetrikaApi('test-only-token', async (url, init) => {
			calls.push({ url, init });
			if (init.method === 'POST') {
				saved = true;
				if (loseResponse) throw new Error('lost');
				return ok({ goal: remote });
			}
			return ok({ goals: saved ? [remote] : [] });
		});
		assert.equal((await api.create('123', definition)).id, 42);
		assert.equal((await api.create('123', definition)).outcome, 'existing');
		const posts = calls.filter((c) => c.init.method === 'POST');
		assert.equal(posts.length, 1);
		assert.deepEqual(JSON.parse(posts[0].init.body), {
			goal: {
				name: `${definition.name} · ${definition.eventName}`,
				type: 'action',
				conditions: [{ type: 'exact', url: definition.eventName }]
			}
		});
		assert.equal(posts[0].init.headers.Authorization, 'OAuth test-only-token');
		assert.equal(posts[0].init.redirect, 'error');
	}
});
test('safe errors: conflict, quota, revoked token and missing configuration', async () => {
	let writes = 0;
	const api = new MetrikaApi('test', async (_url, init) => {
		if (init.method === 'POST') writes++;
		return ok({ goals: [{ ...remote, type: 'url' }] });
	});
	await assert.rejects(api.create('123', definition), (e) => e.status === 409);
	assert.equal(writes, 0);
	for (const status of [401, 403, 429, 500])
		await assert.rejects(
			new MetrikaApi(
				'secret-token',
				async () => new Response('secret-token upstream', { status })
			).goals('123'),
			(e) => e instanceof MetrikaError && !e.message.includes('secret-token')
		);
	await assert.rejects(new MetrikaApi('').goals('123'), (e) => e.status === 503);
});
const strip = (s) => s.replace(/^import .*from .*;\n/gm, '');
const access = await import(
	moduleUrl(`export const mocks={authStatus:200,licenses:[],requests:0};
function error(status,message){throw {status,body:{message}};}
async function adminAuthApi(){mocks.requests++;return new Response('{}',{status:mocks.authStatus});}
function createGraphQLClient(){return {request:async()=>({myLicenses:mocks.licenses})};}
function normalizeYandexCounterId(v){return typeof v==='string'?v:'';}
${strip(read('src/lib/server/goals-access.ts'))}`)
);
test('real ownership guard: missing/expired session, foreign license, own license', async () => {
	const cookies = { get: () => null, delete: () => {} };
	await assert.rejects(access.requireGoalsSite(cookies, 'example.test'), (e) => e.status === 401);
	assert.equal(access.mocks.requests, 0);
	cookies.get = () => 'owner-session';
	access.mocks.authStatus = 401;
	await assert.rejects(access.requireGoalsSite(cookies, 'example.test'), (e) => e.status === 401);
	access.mocks.authStatus = 200;
	access.mocks.licenses = [{ id: '2', domain: 'another.test' }];
	await assert.rejects(access.requireGoalsSite(cookies, 'example.test'), (e) => e.status === 403);
	access.mocks.licenses = [
		{ id: '1', domain: 'example.test', templateId: 1, headerData: { yandexMetrica: '123' } }
	];
	assert.equal((await access.requireGoalsSite(cookies, 'example.test')).site.id, '1');
});
const route = await import(
	moduleUrl(`import {MetrikaApi,MetrikaError,remoteGoalState,validCounterId} from '${apiUrl}';
export const mocks={authError:false,token:'test',saved:null,site:{id:'1',domain:'example.test',templateId:1,headerData:{yandexMetrica:'123',untouched:'keep'}}};
const env={get YANDEX_METRIKA_OAUTH_TOKEN(){return mocks.token;}};
function json(data,init){return new Response(JSON.stringify(data),{...init,headers:{...init?.headers,'Content-Type':'application/json'}});}
function isHttpError(e){return !!e?.body;}
async function requireGoalsSite(){if(mocks.authError)throw {status:401,body:{message:'Auth required'}};return {site:mocks.site,counterId:'123',client:{request:async(_query,v)=>{mocks.saved=v;return {updateLicense:{id:'1'}};}}};}
function siteTemplate(){return 'Promo-1';}
function goalsForTemplate(){return [{...${JSON.stringify(definition)},status:'implemented'}];}
${strip(read('src/routes/goals/metrika/+server.ts'))}`)
);
function event(input, origin = 'https://example.test') {
	return {
		url: new URL('https://example.test/goals/metrika'),
		cookies: {},
		getClientAddress: () => '127.0.0.1',
		request: new Request('https://example.test/goals/metrika', {
			method: 'POST',
			headers: { origin, 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		})
	};
}
const input = {
	operation: 'create',
	template: 'Promo-1',
	counterId: '123',
	eventName: definition.eventName
};
test('endpoint CSRF, auth, template/goal allowlist and stale counter guards', async () => {
	assert.equal((await route.POST(event(input, 'https://evil.test'))).status, 403);
	route.mocks.authError = true;
	assert.equal((await route.POST(event(input))).status, 401);
	route.mocks.authError = false;
	for (const change of [{ template: 'Promo-2' }, { eventName: 'arbitrary' }, { counterId: '456' }])
		assert.ok((await route.POST(event({ ...input, ...change }))).status >= 400);
	route.mocks.token = '';
	assert.equal((await route.POST(event(input))).status, 503);
	route.mocks.token = 'test';
});
test('connection preserves settings; status filters foreign counters', async () => {
	const original = globalThis.fetch;
	try {
		globalThis.fetch = async (url) =>
			url.includes('/counters?')
				? ok({ counters: [counter, { ...counter, id: 9, site2: { site: 'another.test' } }] })
				: url.endsWith('/goals')
					? ok({ goals: [remote] })
					: ok({ counter });
		assert.equal((await route.POST(event({ operation: 'connect', counterId: '123' }))).status, 200);
		assert.deepEqual(route.mocks.saved.headerData, { yandexMetrica: '123', untouched: 'keep' });
		const response = await route.POST(event({ operation: 'status' }));
		assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
		const data = await response.json();
		assert.deepEqual(data.counters, [{ id: '123', name: 'Site' }]);
		assert.equal(data.states[definition.eventName].state, 'created');
		globalThis.fetch = async () => ok({ counter: { ...counter, site2: { site: 'another.test' } } });
		assert.equal((await route.POST(event({ operation: 'connect', counterId: '123' }))).status, 403);
	} finally {
		globalThis.fetch = original;
	}
});
test('concurrent click is locked; subsequent retry finds the goal', async () => {
	const original = globalThis.fetch;
	let release;
	let started;
	const waiting = new Promise((resolve) => (started = resolve));
	let saved = false;
	let writes = 0;
	try {
		globalThis.fetch = async (url, init) => {
			if (url.includes('?field=mirrors')) return ok({ counter });
			if (init.method === 'POST') {
				writes++;
				started();
				await new Promise((resolve) => (release = resolve));
				saved = true;
				return ok({ goal: remote });
			}
			return ok({ goals: saved ? [remote] : [] });
		};
		const first = route.POST(event(input));
		await waiting;
		assert.equal((await route.POST(event(input))).status, 409);
		release();
		assert.equal((await first).status, 200);
		assert.equal((await route.POST(event(input))).status, 200);
		assert.equal(writes, 1);
	} finally {
		globalThis.fetch = original;
	}
});

test('all real template goals, including identically named buttons, can be published', async () => {
	const { goalsForTemplate } = await import(
		moduleUrl(
			`const buttons=${read('src/lib/yandex-direct/button-goals.json')};function templateGoalName(template,id){return template.toLowerCase().replaceAll('-','_')+'_'+id;}${strip(read('src/lib/yandex-direct/goals.ts'))}`
		)
	);
	for (const template of ['Promo-1', 'Promo-2', 'Promo-3', 'Test']) {
		const saved = [];
		const api = new MetrikaApi('test', async (_url, init) => {
			if (init.method === 'POST') {
				const goal = { ...JSON.parse(init.body).goal, id: saved.length + 1 };
				saved.push(goal);
				return ok({ goal });
			}
			return ok({ goals: saved });
		});
		const definitions = goalsForTemplate(template).filter((g) => g.status === 'implemented');
		for (const goal of definitions)
			assert.equal((await api.create('123', goal)).outcome, 'created');
		for (const goal of definitions)
			assert.equal((await api.create('123', goal)).outcome, 'existing');
		assert.equal(saved.length, definitions.length);
		assert.equal(new Set(saved.map((goal) => goal.name)).size, saved.length);
		assert.ok(saved.every((goal) => goal.name.length <= 255));
	}
});

test('endpoint limits repeated authenticated requests', async () => {
	let response;
	for (let i = 0; i < 125; i++) response = await route.POST(event({ operation: 'invalid' }));
	assert.equal(response.status, 429);
});
