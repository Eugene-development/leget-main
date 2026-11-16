import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import { loadServerModule } from './test-server-module.mjs';

const { createEngagementBudget, checkEngagement } = loadServerModule(
	new URL('../src/lib/antibot/engagement.ts', import.meta.url),
	{}
);
const { createVisitGate } = loadServerModule(
	new URL('../src/lib/antibot/visit-gate.ts', import.meta.url),
	{}
);
const signing = loadServerModule(new URL('../src/lib/server/engagement.ts', import.meta.url), {
	'node:crypto': crypto
});
const goals = JSON.parse(
	readFileSync(new URL('../src/lib/yandex-direct/button-goals.json', import.meta.url))
);
const secret = 'test-only-engagement-secret-32-characters';

test('sliding client budget, per-goal cooldown, site isolation and unavailable storage', () => {
	for (const storage of [
		() => undefined,
		() => {
			throw Error('private');
		},
		() => ({
			getItem() {
				return '{bad';
			},
			setItem() {}
		})
	]) {
		let now = 10000;
		const take = createEngagementBudget(storage, () => now);
		assert.equal(take('one', 'first'), true);
		assert.equal(take('one', 'first'), false);
		now += 999;
		assert.equal(take('one', 'first'), false);
		now++;
		assert.equal(take('one', 'first'), true);
		for (let i = 0; i < 18; i++) assert.equal(take('one', `goal_${i}`), true);
		assert.equal(take('one', 'overflow'), false);
		assert.equal(take('two', 'overflow'), true);
		now += 60000;
		assert.equal(take('one', 'overflow'), true);
	}
});

test('a second instance uses the sessionStorage budget', () => {
	const data = new Map();
	const storage = { getItem: (k) => data.get(k), setItem: (k, v) => data.set(k, v) };
	assert.equal(createEngagementBudget(() => storage)('site', 'goal'), true);
	assert.equal(createEngagementBudget(() => storage)('site', 'goal'), false);
});

test('server decisions, network/5xx fallback, malformed responses and cancellation', async () => {
	for (const [status, body, expected] of [
		[200, { allowed: true }, true],
		[200, { allowed: false }, false],
		[200, {}, false],
		[403, {}, false],
		[422, {}, false],
		[429, {}, false],
		[503, {}, true]
	]) {
		const controller = new AbortController();
		assert.equal(
			await checkEngagement('Promo-1', 'goal', controller.signal, async (_url, options) => {
				assert.deepEqual(JSON.parse(options.body), { template: 'Promo-1', goal: 'goal' });
				return new Response(JSON.stringify(body), { status });
			}),
			expected
		);
	}
	assert.equal(
		await checkEngagement('Promo-1', 'goal', new AbortController().signal, async () => {
			throw new TypeError('offline');
		}),
		true
	);
	assert.equal(
		await checkEngagement(
			'Promo-1',
			'goal',
			new AbortController().signal,
			async () => new Response('broken', { status: 200 })
		),
		false
	);
	const cancelled = new AbortController();
	cancelled.abort();
	assert.equal(
		await checkEngagement('Promo-1', 'goal', cancelled.signal, async () => {
			throw new DOMException('cancelled', 'AbortError');
		}),
		false
	);
	const start = Date.now();
	const keepAlive = setTimeout(() => {}, 2500);
	assert.equal(
		await checkEngagement(
			'Promo-1',
			'goal',
			new AbortController().signal,
			(_url, { signal }) =>
				new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason)))
		),
		true
	);
	clearTimeout(keepAlive);
	assert.ok(Date.now() - start < 2200);
});

test('document gate keeps readiness and landing across public remounts; reset forgets them', () => {
	const listeners = new Map();
	const doc = {
		visibilityState: 'visible',
		addEventListener: (name, fn) => listeners.set(name, fn),
		removeEventListener: (name) => listeners.delete(name)
	};
	const gate = createVisitGate(doc, { now: () => 0, set: () => 1, clear() {} });
	const unmount = gate.subscribe(() => {});
	gate.remember('site:123', 'https://site/?yclid=1', 'https://search/');
	gate.activate({ isTrusted: true });
	gate.sent('https://site/');
	unmount();
	assert.equal(listeners.size, 0);
	const remove = gate.subscribe(() => {});
	assert.equal(gate.ready, true);
	assert.equal(gate.remember('site:123', 'https://site/about', '').url, 'https://site/?yclid=1');
	gate.reset();
	assert.equal(gate.ready, false);
	assert.equal(gate.lastHit, '');
	assert.equal(gate.remember('site:456', 'https://site/new', '').url, 'https://site/new');
	remove();
});

function cookieJar() {
	const values = new Map();
	return {
		values,
		writes: [],
		get: (key) => values.get(key),
		set(key, value, options) {
			values.set(key, value);
			this.writes.push(options);
		}
	};
}
test('signed sessions expire and cannot be forged or reused on another host', () => {
	const cookies = cookieJar();
	const id = signing.engagementSession(cookies, 'one.test', secret, true, 1000);
	assert.equal(signing.engagementSession(cookies, 'one.test', secret, true, 1001), id);
	assert.deepEqual(cookies.writes[0], {
		path: '/antibot',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: 1800
	});
	assert.notEqual(signing.engagementSession(cookies, 'two.test', secret, true, 1001), id);
	const other = cookies.values.get(signing.ENGAGEMENT_COOKIE);
	cookies.values.set(
		signing.ENGAGEMENT_COOKIE,
		other.replace(/.$/, other.endsWith('0') ? '1' : '0')
	);
	const replaced = signing.engagementSession(cookies, 'two.test', secret, true, 1002);
	assert.notEqual(signing.engagementSession(cookies, 'two.test', secret, true, 2802), replaced);
});

test('gateway enforces origin/catalog/body bounds and signs only server-owned context', async () => {
	const env = { FORM_CONTEXT_SECRET: secret };
	const sent = [];
	let backendStatus = 200;
	const { POST } = loadServerModule(
		new URL('../src/routes/antibot/engagement/+server.ts', import.meta.url),
		{
			'$env/dynamic/private': { env },
			'$app/environment': { dev: false },
			'@sveltejs/kit': { json: (data, init) => new Response(JSON.stringify(data), init) },
			'$lib/yandex-direct/button-goals.json': goals,
			'$lib/yandex-direct/tracking': {
				templateGoalName: (template, id) => `${template.toLowerCase().replaceAll('-', '_')}_${id}`
			},
			'node:crypto': crypto,
			'$lib/server/admin-api': {
				authApi: async (path, init) => {
					sent.push({ path, ...init });
					return new Response(JSON.stringify({ allowed: true }), { status: backendStatus });
				}
			}
		}
	);
	const goal = goals.find((g) => g.templates.includes('Promo-1'));
	const body = { template: 'Promo-1', goal: `promo_1_${goal.id}` };
	const cookies = cookieJar();
	function event(payload = body, origin = 'https://one.test') {
		return {
			url: new URL('https://one.test/antibot/engagement'),
			cookies,
			getClientAddress: () => '192.0.2.1',
			request: new Request('https://one.test/antibot/engagement', {
				method: 'POST',
				headers: {
					Origin: origin,
					'Content-Type': 'application/json',
					'X-Real-IP': '203.0.113.99',
					'X-Leget-Engagement-Context': 'fake'
				},
				body: JSON.stringify(payload)
			})
		};
	}
	assert.equal((await POST(event(body, 'https://evil.test'))).status, 403);
	assert.equal((await POST(event({ ...body, goal: 'unregistered' }))).status, 422);
	assert.equal((await POST(event({ ...body, template: 'Promo-2' }))).status, 422);
	assert.equal((await POST(event({ padding: 'a'.repeat(2048) }))).status, 413);
	assert.equal(sent.length, 0);
	const ok = await POST(
		event({ ...body, ip: '203.0.113.99', domain: 'evil.test', phone: 'secret' })
	);
	assert.equal(ok.status, 200);
	assert.equal(ok.headers.get('cache-control'), 'no-store');
	const [payload, signature] = sent[0].headers['X-Leget-Engagement-Context'].split('.');
	assert.equal(signature, signing.signEngagement(payload, secret));
	const context = JSON.parse(Buffer.from(payload, 'base64url'));
	assert.equal(context.domain, 'one.test');
	assert.equal(context.ip, '192.0.2.1');
	assert.equal(context.phone, undefined);
	assert.equal(sent[0].path, '/track/engagement');
	for (const [status, expected] of [
		[429, 429],
		[403, 403],
		[500, 503]
	]) {
		backendStatus = status;
		assert.equal((await POST(event())).status, expected);
	}
	delete env.FORM_CONTEXT_SECRET;
	assert.equal((await POST(event())).status, 503);
});
