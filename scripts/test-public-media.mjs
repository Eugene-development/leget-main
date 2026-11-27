import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadServerModule } from './test-server-module.mjs';

const dependencies = {
	'@sveltejs/kit': {
		error(status, message) {
			throw Object.assign(new Error(message), { status });
		}
	}
};
const { publicMediaUrl } = loadServerModule(
	new URL('../src/lib/utils/public-media.ts', import.meta.url),
	dependencies
);
const { GET } = loadServerModule(
	new URL('../src/routes/media/[...object]/+server.ts', import.meta.url),
	dependencies
);
const origin = 'https://example.test';
const source = 'https://storage.yandexcloud.net/zovtop/kitchens/%D0%AD%D1%82%D0%BD%D0%B0.webp';
const path = '/media/zovtop/kitchens/%D0%AD%D1%82%D0%BD%D0%B0.webp';

test('rewrites public raster URLs and preserves external, signed and SVG URLs', () => {
	assert.equal(publicMediaUrl(source), path);
	for (const value of [
		'https://external.test/kitchen.webp',
		`${source}?X-Amz-Signature=value`,
		'https://storage.yandexcloud.net/zovtop/logo.svg',
		'/existing.png'
	]) {
		assert.equal(publicMediaUrl(value), value);
	}
});

test('retrieves the original from storage on an anonymous inline request', async () => {
	const response = await GET({
		url: new URL(path, origin),
		fetch: async (address, options) => {
			assert.equal(address, source);
			assert.equal(options.credentials, 'omit');
			assert.equal(options.redirect, 'error');
			return new Response('fixture', { headers: { 'Content-Type': 'image/webp' } });
		}
	});
	assert.equal(response.status, 200);
	assert.equal(response.headers.get('content-type'), 'image/webp');
	assert.equal(response.headers.get('content-disposition'), null);
	assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
	assert.equal(await response.text(), 'fixture');
});

test('rejects a forbidden bucket, query string or file extension before fetching', async () => {
	for (const address of ['/media/private/image.webp', `${path}?token=value`, '/media/zovtop/a.svg']) {
		await assert.rejects(
			GET({
				url: new URL(address, origin),
				fetch: async () => assert.fail('unexpected upstream request')
			}),
			{ status: 404 }
		);
	}
});

test('rejects invalid media responses and objects over the per-file limit', async () => {
	for (const [headers, status] of [
		[{ 'Content-Type': 'text/html' }, 502],
		[{ 'Content-Type': 'image/webp', 'Content-Length': '20971521' }, 413]
	]) {
		await assert.rejects(
			GET({
				url: new URL(path, origin),
				fetch: async () => new Response('fixture', { headers })
			}),
			{ status }
		);
	}
});
