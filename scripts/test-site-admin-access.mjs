import assert from 'node:assert/strict';
import { error, fail, redirect } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';

let status = 200;
let licenses = [{ id: '1', domain: 'tenant.test', templateId: 2, headerData: {} }];
const seen = [];
const dependencies = {
	'@sveltejs/kit': { error, fail, redirect },
	'$lib/server/admin-api': { adminAuthApi: async (_path, options) => {
		seen.push(options.headers.Authorization);
		return new Response(null, { status });
	} },
	'$lib/utils/graphql-client': { createGraphQLClient: () => ({ request: async (query) =>
		query.includes('DesignSystems') ? { designSystems: [] } : { myLicenses: licenses }
	}) }
};
const load = (path) => loadServerModule(new URL(`../src/${path}`, import.meta.url), dependencies);
const goals = load('lib/server/goals-access.ts');
const settings = load('routes/site-settings/+page.server.ts');
const cookies = (values) => ({ get: (name) => values[name], delete: () => {} });
for (const tokenName of ['leget_client_jwt', 'leget_goals_jwt']) {
	seen.length = 0;
	const result = await goals.requireGoalsSite(cookies({ [tokenName]: 'valid' }), 'tenant.test');
	assert.equal(result.site.id, '1');
	assert.deepEqual(seen, ['Bearer valid']);
}
for (const tokenName of ['leget_client_jwt', 'leget_site_settings_jwt']) {
	seen.length = 0;
	const result = await settings.load({ cookies: cookies({ [tokenName]: 'valid' }), url: new URL('https://tenant.test') });
	assert.equal(result.site.id, '1');
	assert.deepEqual(seen, ['Bearer valid']);
}
licenses = [];
await assert.rejects(goals.requireGoalsSite(cookies({ leget_client_jwt: 'valid' }), 'tenant.test'), (e) => e.status === 403);
await assert.rejects(settings.load({ cookies: cookies({ leget_client_jwt: 'valid' }), url: new URL('https://tenant.test') }), (e) => e.status === 403);
status = 503;
await assert.rejects(settings.load({ cookies: cookies({ leget_client_jwt: 'valid' }), url: new URL('https://tenant.test') }), (e) => e.status === 502);
console.log('PASS: cabinet and editor sessions, site ownership and authorization service failure.');
