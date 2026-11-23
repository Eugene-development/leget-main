import assert from 'node:assert/strict';
import test from 'node:test';
import {
	graphQLError,
	isCancelled,
	requestError,
	storageUploadError,
	userErrorMessage
} from '../src/lib/utils/user-error.js';

test('technical exception and GraphQL messages stay out of notifications', () => {
	const hidden = 'RAW_TRACE: database host, request headers and signed upload URL';
	assert.doesNotMatch(userErrorMessage(new Error(hidden)), /RAW_TRACE/);
	const permission = graphQLError(200, [
		{ message: hidden, extensions: { category: 'authorization' } }
	]);
	assert.match(userErrorMessage(permission), /дополнительные права/);
	assert.doesNotMatch(userErrorMessage(permission), /RAW_TRACE/);
});

test('different failure statuses suggest different recovery actions', () => {
	for (const [status, recovery] of [
		[401, /Войдите снова/],
		[409, /Обновите страницу/],
		[413, /файл меньшего размера/],
		[429, /Подождите минуту/],
		[503, /Попробуйте чуть позже/]
	]) {
		assert.match(userErrorMessage(requestError(status)), recovery);
	}
	assert.equal(isCancelled(new DOMException('Cancelled', 'AbortError')), true);
	assert.equal(isCancelled(new DOMException('Timed out', 'TimeoutError')), false);
});

test('the upload VPN hint is conditional and limited to a storage connection failure', () => {
	assert.match(userErrorMessage(storageUploadError('network')), /Если включён VPN/);
	for (const failure of [403, 413, 415, 503, 'timeout']) {
		assert.doesNotMatch(userErrorMessage(storageUploadError(failure)), /VPN/);
	}
	assert.doesNotMatch(userErrorMessage(new TypeError('Failed to fetch')), /VPN/);

	const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
	try {
		Object.defineProperty(globalThis, 'navigator', {
			value: { onLine: false },
			configurable: true
		});
		const message = userErrorMessage(storageUploadError('network'));
		assert.match(message, /Подключитесь к интернету/);
		assert.doesNotMatch(message, /VPN/);
	} finally {
		if (original) Object.defineProperty(globalThis, 'navigator', original);
		else delete globalThis.navigator;
	}
});
