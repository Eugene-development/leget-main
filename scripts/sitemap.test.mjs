import assert from 'node:assert/strict';
import test from 'node:test';
import { sitemapXml } from '../src/lib/utils/sitemap.ts';

test('XML encodes URLs, escapes entities and deduplicates', () => {
	const xml = sitemapXml('https://tenant.example', ['/', '/мебель', '/brand&a', '/']);
	assert.equal((xml.match(/<url>/g) ?? []).length, 3);
	assert.match(xml, /https:\/\/tenant.example\/%D0%BC/);
	assert.match(xml, /brand&amp;a/);
	assert.match(xml, /xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/);
});
test('rejects external addresses and unresolved route templates', () => {
	for (const path of [
		'//evil.example',
		'/\\evil.example',
		'/{brand}',
		'/path?draft=1',
		'/a#fragment'
	]) {
		assert.throws(() => sitemapXml('https://tenant.example', [path]));
	}
});
test('never silently truncates an oversized sitemap', () => {
	assert.throws(() =>
		sitemapXml(
			'https://tenant.example',
			Array.from({ length: 50001 }, (_, i) => `/project-${i}`)
		)
	);
});
