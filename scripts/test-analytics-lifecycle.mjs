import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadServerModule } from './test-server-module.mjs';

const { isPrivateAnalyticsUrl, stopSiteAnalytics } = loadServerModule(
	new URL('../src/lib/growth/analytics-lifecycle.ts', import.meta.url),
	{}
);

test('private SPA destinations and query capabilities are never eligible for collection', () => {
	for (const path of [
		'/orders',
		'/orders/invitation/secret',
		'/crm/deals/1',
		'/admin',
		'/cabinet',
		'/selection/secret',
		'/site-settings',
		'/goals',
		'/test?draft=secret',
		'/test?preview=1',
		'/test?access_token=secret',
		'/test?session=secret'
	])
		assert.equal(isPrivateAnalyticsUrl(new URL(path, 'https://site.test')), true, path);
	for (const path of [
		'/',
		'/about',
		'/projects',
		'/mebel/kuhni/project',
		'/?utm_campaign=kitchens'
	]) {
		assert.equal(isPrivateAnalyticsUrl(new URL(path, 'https://site.test')), false, path);
	}
});

test('teardown deinitializes counters, drops queued hits and disables all owned Google tags', () => {
	const calls = [];
	const ym = (...args) => calls.push(args);
	ym.a = [
		[123, 'init', {}],
		[123, 'hit', 'https://site.test/'],
		[777, 'hit', 'unrelated-counter']
	];
	const target = {
		ym,
		__legetYandexCounters: { 123: true, 456: true },
		__legetGoogleTags: { 'G-ONE': true, 'G-TWO': true },
		'ga-disable-G-ONE': false
	};
	stopSiteAnalytics(target);
	assert.deepEqual(calls, [
		[123, 'destruct'],
		[456, 'destruct']
	]);
	assert.deepEqual(target.__legetYandexCounters, {});
	assert.deepEqual(target.ym.a, [[777, 'hit', 'unrelated-counter']]);
	assert.equal(target['ga-disable-G-ONE'], true);
	assert.equal(target['ga-disable-G-TWO'], true);
	stopSiteAnalytics(target);
	assert.equal(calls.length, 2);
});

test('teardown is safe before any script or counter exists', () => {
	assert.doesNotThrow(() => stopSiteAnalytics({}));
});
