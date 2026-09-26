import assert from 'node:assert/strict';
import test from 'node:test';
import {
	emptyCaption,
	captionInput,
	validateCaption
} from '../src/lib/components/templates/Promo-1/pages/mebel/project-caption.ts';

test('disabled caption does not change the project payload or block saving', () => {
	assert.deepEqual(captionInput(false, emptyCaption()), {});
	assert.deepEqual(validateCaption(false, emptyCaption()), {});
});
test('enabled caption normalizes whitespace and preserves selected settings', () => {
	const caption = {
		...emptyCaption(),
		text: '  Мебель   на заказ ',
		position: 'center',
		opacity: 0
	};
	assert.deepEqual(validateCaption(true, caption), {});
	assert.equal(captionInput(true, caption).image_caption.text, 'Мебель на заказ');
	assert.equal(captionInput(true, caption).image_caption.opacity, 0);
	assert.equal(caption.text, '  Мебель   на заказ ');
});
test('rejects empty captions and out of range settings', () => {
	for (const invalid of [
		{ text: '' },
		{ text: 'а'.repeat(121) },
		{ opacity: 101 },
		{ font_size: 0 },
		{ padding: -1 },
		{ position: 'top' },
		{ color: 'red' }
	]) {
		assert.ok(
			validateCaption(true, { ...emptyCaption(), text: 'Мебель', ...invalid }).image_caption
		);
	}
});
