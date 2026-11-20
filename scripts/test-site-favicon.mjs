import assert from 'node:assert/strict';
import { test } from 'node:test';
import { error, fail, redirect } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';

test('site settings publish a favicon only if its public URL is available', async (t) => {
	const uploadUrl = 'https://bucket.example/presigned';
	const objectUrl = 'https://bucket.example/favicons/new.png';
	const license = { id: 'license-id', domain: 'tenant.test', faviconUrl: '/previous.png' };
	const calls = [];
	const { actions } = loadServerModule(
		new URL('../src/routes/site-settings/+page.server.ts', import.meta.url),
		{
			'@sveltejs/kit': { error, fail, redirect },
			'$lib/server/admin-api': { adminAuthApi: async () => new Response(null, { status: 200 }) },
			'$lib/utils/graphql-client': {
				createGraphQLClient: () => ({
					async request(query, variables) {
						if (query.includes('query SiteSettingsLicenses')) return { myLicenses: [license] };
						if (query.includes('mutation SiteSettingsUploadUrl')) {
							return { generateUploadUrl: { uploadUrl, objectUrl } };
						}
						assert.match(query, /mutation SaveSiteFavicon/);
						calls.push(['save', variables]);
						license.faviconUrl = variables.faviconUrl;
					}
				})
			}
		}
	);
	let publicStatus = 404;
	t.mock.method(globalThis, 'fetch', async (url, { method }) => {
		calls.push([method, url]);
		return new Response(null, { status: method === 'PUT' ? 200 : publicStatus });
	});
	const upload = () => {
		const form = new FormData();
		const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
		form.set('favicon', new File([signature], 'favicon.png', { type: 'image/png' }));
		const url = new URL('https://tenant.test/site-settings');
		return actions.uploadFavicon({
			cookies: { get: () => 'owner-token' },
			url,
			request: new Request(url, { method: 'POST', body: form })
		});
	};

	const unavailable = await upload();
	assert.equal(unavailable.status, 502);
	assert.equal(unavailable.data.success, false);
	assert.equal(license.faviconUrl, '/previous.png');
	assert.deepEqual(calls, [['PUT', uploadUrl], ['HEAD', objectUrl]]);

	publicStatus = 200;
	calls.length = 0;
	const published = await upload();
	assert.equal(published.success, true);
	assert.equal(published.faviconUrl, objectUrl);
	assert.deepEqual(calls, [
		['PUT', uploadUrl],
		['HEAD', objectUrl],
		['save', { id: license.id, faviconUrl: objectUrl }]
	]);
});
