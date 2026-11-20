import assert from 'node:assert/strict';
import { error, redirect } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';

let profile = null;
let unavailable = false;
const dependencies = {
	'@sveltejs/kit': { error, redirect, json: (data, init) => new Response(JSON.stringify(data), init) },
	'$app/environment': { dev: true },
	'$env/dynamic/private': { env: {} },
	'$lib/server/client-session': {
		CLIENT_COOKIE: 'leget_client_jwt',
		CRM_COOKIE: 'leget_crm_jwt',
		readSessionProfile: async () => {
			if (unavailable) throw new Error('offline');
			return profile;
		}
	},
	'$lib/server/admin-api': {},
	'$lib/server/session-persistence': { validatedTokenPersistence: () => ({}) },
	'$lib/server/crm': { CRM_COOKIE: 'leget_crm_jwt' }
};
const endpoint = loadServerModule(new URL('../src/routes/crm-access/session/+server.ts', import.meta.url), dependencies);
const crm = loadServerModule(new URL('../src/lib/server/crm.ts', import.meta.url), dependencies);
const changes = [];
const event = (origin = 'https://tenant.test', token = 'Bearer valid') => ({
	url: new URL('https://tenant.test/crm-access/session'),
	request: new Request('https://tenant.test/crm-access/session', {
		method: 'POST', headers: { origin, authorization: token }
	}),
	cookies: { set: (...args) => changes.push(args), delete: (...args) => changes.push(args) }
});
for (const role of ['admin', 'superadmin', 'manager']) {
	profile = { role };
	changes.length = 0;
	assert.equal((await endpoint.POST(event())).status, 200);
	assert.deepEqual(changes, [['leget_crm_jwt', 'valid', {
		path: '/crm', httpOnly: true, secure: false, sameSite: 'strict'
	}]]);
}
for (const role of ['client', 'student', 'partner', 'curator']) {
	profile = { role };
	changes.length = 0;
	assert.equal((await endpoint.POST(event())).status, 403);
	assert.deepEqual(changes, []);
}
profile = null;
assert.equal((await endpoint.POST(event())).status, 401);
assert.equal((await endpoint.POST(event(undefined, ''))).status, 401);
assert.equal((await endpoint.POST(event('https://other.test'))).status, 403);
assert.equal((await endpoint.DELETE(event('https://other.test'))).status, 403);
unavailable = true;
assert.equal((await endpoint.POST(event())).status, 503);
changes.length = 0;
await endpoint.DELETE(event());
assert.deepEqual(changes, [['leget_crm_jwt', { path: '/crm' }]]);
const context = (values, path = '/crm') => ({
	url: new URL(`https://tenant.test${path}`), cookies: { get: (name) => values[name] }
});
assert.equal(crm.crmToken(context({ leget_client_jwt: 'cabinet' })), 'cabinet');
assert.equal(crm.crmToken(context({ leget_crm_jwt: 'editor', leget_client_jwt: 'cabinet' })), 'editor');
assert.equal(crm.crmToken(context({ leget_admin_jwt: 'platform' }, '/admin/crm')), 'platform');
assert.throws(() => crm.crmToken(context({})), (e) => e.status === 303);
console.log('PASS: CRM editor bridge roles, CSRF, cookie isolation, logout, unavailable auth and CRM token selection.');
