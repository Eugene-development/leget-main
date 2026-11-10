import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadServerModule } from './test-server-module.mjs';

function setup(
	fetcher = async () =>
		new Response(new Uint8Array([1, 2, 3]), {
			headers: { 'content-type': 'image/webp' }
		})
) {
	const { GET } = loadServerModule(
		new URL('../src/routes/api/gallery-image/+server.ts', import.meta.url),
		{
			'@sveltejs/kit': {
				error(status, message) {
					throw Object.assign(new Error(message), { status });
				}
			}
		}
	);
	return (source = 'https://storage.yandexcloud.net/zovtop/kitchens/photo.webp') =>
		GET({
			url: new URL(`http://localhost/api/gallery-image?url=${encodeURIComponent(source)}`),
			fetch: fetcher,
			getClientAddress: () => '127.0.0.1'
		});
}

test('downloads a public image as an attachment without upstream credentials or redirects', async () => {
	const get = setup(async (url, options) => {
		assert.equal(url, 'https://storage.yandexcloud.net/leget-main/photo.webp');
		assert.equal(options.redirect, 'error');
		assert.equal(options.credentials, 'omit');
		assert.ok(options.signal instanceof AbortSignal);
		return new Response(new Uint8Array([1, 2, 3]), { headers: { 'content-type': 'image/webp' } });
	});
	const response = await get('https://storage.yandexcloud.net/leget-main/photo.webp');
	assert.equal(response.headers.get('content-disposition'), 'attachment; filename="kitchen.webp"');
	assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
	assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2, 3]);
});

test('rejects untrusted hosts, protocols, buckets and signed URLs before fetching', async () => {
	const get = setup(() => assert.fail('Unexpected upstream request'));
	for (const source of [
		'bad',
		'http://storage.yandexcloud.net/zovtop/photo.webp',
		'https://127.0.0.1/photo.webp',
		'https://storage.yandexcloud.net.evil.test/zovtop/a',
		'https://storage.yandexcloud.net/private/a',
		'https://user@storage.yandexcloud.net/zovtop/a',
		'https://storage.yandexcloud.net:444/zovtop/a',
		'https://storage.yandexcloud.net/zovtop/a?token=secret',
		'https://storage.yandexcloud.net/zovtop/a#fragment'
	])
		await assert.rejects(get(source), { status: 400 });
});

test('rejects unavailable or non-raster upstream content', async () => {
	for (const response of [
		new Response('not found', { status: 404 }),
		new Response('<html/>', { headers: { 'content-type': 'text/html' } }),
		new Response('<svg/>', { headers: { 'content-type': 'image/svg+xml' } })
	])
		await assert.rejects(setup(async () => response)(), { status: 502 });
	await assert.rejects(
		setup(async () => {
			throw new Error('redirect or timeout');
		})(),
		{ status: 502 }
	);
});

test('enforces image size with and without a Content-Length header', async () => {
	await assert.rejects(
		setup(
			async () =>
				new Response('x', {
					headers: { 'content-type': 'image/png', 'content-length': String(21 * 1024 * 1024) }
				})
		)(),
		{ status: 413 }
	);
	await assert.rejects(
		setup(
			async () =>
				new Response(new Uint8Array(21 * 1024 * 1024), {
					headers: { 'content-type': 'image/png' }
				})
		)(),
		{ status: 413 }
	);
});

test('limits repeated downloads per client', async () => {
	const get = setup();
	for (let i = 0; i < 30; i++) await get();
	await assert.rejects(get(), { status: 429 });
});
