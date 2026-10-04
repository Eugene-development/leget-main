import assert from 'node:assert/strict';
import { json } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';

// Exercise the actual SvelteKit handler with an isolated backend and cookie jar.
const cookies = [];
let calls = 0;
let backend = {
	success: true,
	token: 'server-only-jwt',
	role: 'client',
	user: { role: 'client' },
	expires_in: 900,
	remember: true
};
let status = 200;
const { POST } = loadServerModule(
	new URL('../src/routes/sms/[action]/+server.ts', import.meta.url),
	{
		'$app/environment': { dev: false },
		'@sveltejs/kit': { json },
		'$lib/server/admin-api': {
			authApi: async () => {
				calls++;
				return new Response(JSON.stringify(backend), { status });
			},
			readApiJson: (response) => response.json()
		},
		'$lib/server/attribution': { claimAttribution: async () => {} }
	}
);
const request = (context = 'client', action = 'verify', origin = 'https://tenant.test') =>
	POST({
		request: new Request('https://tenant.test/sms/' + action, {
			method: 'POST',
			headers: { origin, 'Content-Type': 'application/json' },
			body: JSON.stringify({ context, phone: '+79991234567', code: '123456', challenge_id: 'id' })
		}),
		cookies: { set: (...args) => cookies.push(args) },
		url: new URL('https://tenant.test/sms/' + action),
		params: { action },
		getClientAddress: () => '127.0.0.1'
	});
assert.equal((await request('client', 'verify', 'https://attacker.test')).status, 403);
assert.equal(calls, 0);
assert.equal((await request('owner')).status, 422);
assert.equal(calls, 0);
let response = await request();
assert.equal(response.status, 200);
assert.equal(response.headers.get('Cache-Control'), 'no-store');
assert.equal((await response.json()).token, undefined);
assert.equal(cookies[0][0], 'leget_client_jwt');
assert.equal(cookies[0][2].httpOnly, true);
backend = { ...backend, role: 'superadmin', user: { role: 'superadmin' } };
await request('admin');
assert.equal(cookies[1][0], 'leget_admin_jwt');
assert.deepEqual(cookies[1][2], {
	path: '/admin',
	httpOnly: true,
	secure: true,
	sameSite: 'strict',
	maxAge: 900
});
await request('university');
assert.equal(cookies[2][0], 'leget_client_jwt', 'university never overwrites admin cookie');
backend = { ...backend, role: 'client' };
assert.equal((await request('admin')).status, 403);
assert.equal(cookies.length, 3);
backend = {
	success: true,
	test_mode: true,
	test_code: '123456',
	challenge_id: 'id',
	expires_in: 300,
	retry_after: 60
};
response = await request('client', 'request');
assert.equal((await response.json()).test_code, '123456');
assert.equal(cookies.length, 3, 'requesting a code never creates a session');
status = 422;
backend = { message: 'Invalid code', token: 'must-not-leak' };
response = await request();
assert.equal(response.status, 422);
assert.equal((await response.json()).token, undefined);
assert.equal(cookies.length, 3);
console.log(
	'PASS: origin, contexts, cookie boundaries, no JWT disclosure, no session before verification.'
);
