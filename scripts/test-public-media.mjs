import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadServerModule } from './test-server-module.mjs';

const dependencies = {
	'./template-media-aliases': loadServerModule(
		new URL('../src/lib/utils/template-media-aliases.ts', import.meta.url)
	),
	'@sveltejs/kit': {
		error(status, message) {
			throw Object.assign(new Error(message), { status });
		}
	}
};
const { galleryImageDownloadUrl, publicMediaUrl } = loadServerModule(
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
const wardrobeKey = 'leget-main/mebel/license-hash/wardrobe.webp';
const thumbnailId = 'ada48033e9cfa95f38d69fc9ae7b5bcc25b72f13-5037427-images-thumbs';
const thumbnailUrl = `https://avatars.mds.yandex.net/i?id=${thumbnailId}&n=13`;

test('rewrites configured public images and preserves local, unknown and signed URLs', () => {
	assert.equal(publicMediaUrl(source), path);
	assert.equal(publicMediaUrl(thumbnailUrl), `/media/yandex-thumbs/${thumbnailId}`);
	assert.equal(
		publicMediaUrl('https://storage.yandexcloud.net/novostroy/brands/logo.svg'),
		'/media/novostroy/brands/logo.svg'
	);
	assert.equal(
		publicMediaUrl('https://storage.yandexcloud.net/zovrus/gallery/image.WEBP'),
		'/media/zovrus/gallery/image.WEBP'
	);
	assert.equal(
		publicMediaUrl('https://www.aristo.ru/include/logo_header.png'),
		'/media/leget-main/templates/promo-1/brands/aristo.png'
	);
	for (const value of [
		'https://external.test/kitchen.webp',
		`${source}?X-Amz-Signature=value`,
		'https://storage.yandexcloud.net/unconfigured/image.webp',
		`${thumbnailUrl}&extra=ignored`,
		'blob:https://example.test/preview',
		'/existing.png'
	]) {
		assert.equal(publicMediaUrl(value), value);
	}
});

test('previously saved Promo-2 starter image uses the same cache key as its bucket copy', async () => {
	const oldKey = 'zovtop/foto/facade-wood-20261106.webp';
	const newKey = 'leget-main/templates/promo-2/legacy/zovtop/foto/facade-wood-20261106.webp';
	const newSource = `https://storage.yandexcloud.net/${newKey}`;
	assert.equal(publicMediaUrl(`https://storage.yandexcloud.net/${oldKey}`), `/media/${newKey}`);
	assert.equal(publicMediaUrl(newSource), `/media/${newKey}`);
	const response = await GET({
		url: new URL(`/media/${oldKey}`, origin),
		fetch: async (address) => {
			assert.equal(address, newSource);
			return new Response('fixture', { headers: { 'Content-Type': 'image/webp' } });
		}
	});
	assert.equal(response.status, 200);
});

test('retrieves the original from storage on an anonymous inline request', async () => {
	const response = await GET({
		url: new URL(path, origin),
		fetch: async (address, options) => {
			assert.equal(address, source);
			assert.equal(options.credentials, 'omit');
			assert.equal(options.redirect, 'error');
			return new Response('fixture', {
				headers: { 'Content-Type': 'image/webp', 'Last-Modified': 'Fri, 27 Nov 2026 00:00:00 GMT' }
			});
		}
	});
	assert.equal(response.status, 200);
	assert.equal(response.headers.get('content-type'), 'image/webp');
	assert.equal(response.headers.get('content-disposition'), null);
	assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
	assert.equal(response.headers.get('last-modified'), 'Fri, 27 Nov 2026 00:00:00 GMT');
	assert.equal(await response.text(), 'fixture');
});

test('serves SVG in a sandbox and resolves partner URLs from the fixed registry', async () => {
	const response = await GET({
		url: new URL('/media/novostroy/brands/logo.svg', origin),
		fetch: async (address) => {
			assert.equal(address, 'https://storage.yandexcloud.net/novostroy/brands/logo.svg');
			return new Response('<svg />', { headers: { 'Content-Type': 'image/svg+xml' } });
		}
	});
	assert.match(response.headers.get('content-security-policy') ?? '', /sandbox/);
	assert.equal(response.headers.get('content-type'), 'image/svg+xml');

	const partner = await GET({
		url: new URL('/media/partners/aristo.png', origin),
		fetch: async (address) => {
			assert.equal(
				address,
				'https://storage.yandexcloud.net/leget-main/templates/promo-1/brands/aristo.png'
			);
			return new Response('fixture', { headers: { 'Content-Type': 'image/png' } });
		}
	});
	assert.equal(partner.status, 200);

	const thumbnail = await GET({
		url: new URL(`/media/yandex-thumbs/${thumbnailId}`, origin),
		fetch: async (address) => {
			assert.equal(address, thumbnailUrl);
			return new Response('fixture', { headers: { 'Content-Type': 'image/jpeg' } });
		}
	});
	assert.equal(thumbnail.status, 200);
});

test('download reuses the same-origin media URL for an uploaded gallery photo', () => {
	const image = `https://storage.yandexcloud.net/${wardrobeKey}`;
	const display = `${origin}/media/${wardrobeKey}`;
	assert.equal(publicMediaUrl(image), `/media/${wardrobeKey}`);
	assert.equal(galleryImageDownloadUrl(display, origin), display);
	assert.equal(
		galleryImageDownloadUrl(image, origin),
		`/api/gallery-image?url=${encodeURIComponent(image)}`
	);
});

test('rejects a forbidden bucket, query string or file extension before fetching', async () => {
	for (const address of [
		'/media/private/image.webp',
		`${path}?token=value`,
		'/media/zovtop/a.mp4',
		'/media/partners/unlisted.png',
		'/media/yandex-thumbs/unlisted'
	]) {
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
