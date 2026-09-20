import assert from 'node:assert/strict';
import test from 'node:test';
import { collectComponentImages } from '../src/lib/utils/component-images.ts';

test('deduplicates empty image slots registered by multiple sources', () => {
	const images = collectComponentImages({}, [
		{ path: ['bgImage'], label: 'Фон из реестра' },
		{ path: ['bgImage'], label: 'Фон из компонента' }
	]);

	assert.deepEqual(images, [
		{
			path: ['bgImage'],
			pathKey: 'bgImage',
			label: 'Фон из реестра',
			value: ''
		}
	]);
});

test('does not add a registered slot when data already contains the image', () => {
	const images = collectComponentImages(
		{ bgImage: 'https://storage.yandexcloud.net/leget-main/example.webp' },
		[{ path: ['bgImage'], label: 'Фон из реестра' }]
	);

	assert.equal(images.length, 1);
	assert.equal(images[0].pathKey, 'bgImage');
	assert.equal(images[0].value, 'https://storage.yandexcloud.net/leget-main/example.webp');
});
