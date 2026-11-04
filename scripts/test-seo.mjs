import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canonicalUrl } from '../src/lib/seo.js';

test('removes tracking, preserves content and leaves the actual visit URL unchanged', () => {
	const url = new URL('https://tenant-one.example/catalog?page=2&sort=price&utm_campaign_id=713060179&ybaip=1&ysclid=abc&utm_custom=x#products');
	const original = url.href;
	assert.equal(canonicalUrl(url), 'https://tenant-one.example/catalog?page=2&sort=price');
	assert.equal(url.href, original);
});

test('keeps separate canonical origins for unknown tenant domains and Unicode domains', () => {
	for (const origin of ['https://tenant-one.example', 'https://new-tenant.example', 'https://пример.рф']) {
		const url = new URL('/about?utm_campaign_id=713060179&ybaip=1', origin);
		assert.equal(canonicalUrl(url), new URL('/about', origin).href);
	}
});

test('removes repeated tracking parameters and preserves repeated content parameters', () => {
	assert.equal(canonicalUrl(new URL('https://tenant.example/?tag=a&utm_source=x&tag=b&utm_source=y&yclid=1')), 'https://tenant.example/?tag=a&tag=b');
});
