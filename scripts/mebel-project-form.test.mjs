import test from 'node:test';
import assert from 'node:assert/strict';
import {
	projectInput,
	validateProject
} from '../src/lib/components/templates/Promo-1/pages/mebel/project-form.ts';

const form = (values = {}) => ({
	category_id: 'kitchens',
	value: ' Кухня ',
	short_description: ' ',
	description: '',
	price: undefined,
	old_price: undefined,
	is_active: true,
	is_new: false,
	is_featured: false,
	...values
});

test('zero price remains zero, blank optional fields become null, choices survive', () => {
	const tags = ['brand', 'material'];
	const result = projectInput(form({ price: 0, old_price: 12.25 }), tags, ['photo']);
	assert.equal(result.price, 0);
	assert.equal(result.old_price, 12.25);
	assert.equal(result.value, 'Кухня');
	assert.equal(result.short_description, null);
	assert.deepEqual(result.tag_ids, tags);
	assert.notEqual(result.tag_ids, tags);
	assert.deepEqual(result.image_urls, ['photo']);
});
test('optional prices, valid decimal prices and eight photos are accepted', () => {
	assert.deepEqual(validateProject(form(), 1), {});
	assert.deepEqual(validateProject(form({ price: 0, old_price: 9999999999.99 }), 8), {});
	assert.equal(projectInput(form(), [], []).price, null);
});
test('blank names and categories are rejected', () => {
	const errors = validateProject(form({ value: '   ', category_id: '' }), 1);
	assert.ok(errors.value);
	assert.ok(errors.category_id);
});
test('negative, non-finite, overflowing and sub-kopeck prices are rejected', () => {
	for (const price of [-1, NaN, Infinity, 10000000000, 1.001])
		assert.ok(validateProject(form({ price }), 1).price);
	assert.ok(validateProject(form({ old_price: -1 }), 1).old_price);
});
test('photo and text limits are enforced', () => {
	assert.ok(validateProject(form(), 0).image_urls);
	assert.ok(validateProject(form(), 9).image_urls);
	const errors = validateProject(
		form({
			value: 'a'.repeat(256),
			short_description: 'a'.repeat(1001),
			description: 'a'.repeat(20001)
		}),
		1
	);
	assert.ok(errors.value);
	assert.ok(errors.short_description);
	assert.ok(errors.description);
});

const { loadProjectEditForm, projectUpdateInput, validateProjectUpdate, parseProjectBrands } =
	await import('../src/lib/components/templates/Promo-1/pages/mebel/project-form.ts');

test('edit loads current values, zero prices, passport and flags', () => {
	const result = loadProjectEditForm(
		{
			id: 'project-1',
			value: 'Кухня',
			price: '0.00',
			old_price: '1500.25',
			is_active: false,
			is_new: true,
			completed_at: '2026-09-14',
			meta: { maker: 'Фабрика', hardware_brands: ['Blum', 'Hettich'], appliance_brands: ['Bosch'] }
		},
		'kitchens'
	);
	assert.equal(result.id, 'project-1');
	assert.equal(result.category_id, 'kitchens');
	assert.equal(result.price, 0);
	assert.equal(result.old_price, 1500.25);
	assert.equal(result.is_active, false);
	assert.equal(result.hardware_brands, 'Blum, Hettich');
	assert.equal(result.completed_at, '2026-09-14');
	assert.deepEqual(validateProjectUpdate(result), {});
});
test('edit sends explicit clearing values and never sends image_urls', () => {
	const source = loadProjectEditForm({
		id: 'project-1',
		value: ' Кухня ',
		category_id: 'kitchens',
		price: 0
	});
	const input = projectUpdateInput(source, []);
	assert.equal(input.id, 'project-1');
	assert.equal(input.price, 0);
	assert.equal(input.old_price, null);
	assert.equal(input.completed_at, null);
	assert.equal(input.object_address, null);
	assert.equal(input.maker, null);
	assert.deepEqual(input.tag_ids, []);
	assert.deepEqual(input.hardware_brands, []);
	assert.equal(Object.hasOwn(input, 'image_urls'), false);
});
test('edit rejects absent id, whitespace name, invalid dates and long brands', () => {
	const base = loadProjectEditForm({ id: 'project-1', category_id: 'kitchens', value: 'Кухня' });
	assert.ok(validateProjectUpdate({ ...base, id: '' }).id);
	assert.ok(validateProjectUpdate({ ...base, value: '   ' }).value);
	for (const date of ['2026-02-30', '2025-02-29', '0001-01-01', 'not-a-date'])
		assert.ok(validateProjectUpdate({ ...base, completed_at: date }).completed_at);
	assert.equal(
		validateProjectUpdate({ ...base, completed_at: '2024-02-29' }).completed_at,
		undefined
	);
	assert.ok(validateProjectUpdate({ ...base, hardware_brands: 'a'.repeat(121) }).hardware_brands);
	assert.deepEqual(parseProjectBrands(' Blum, Hettich, , Blum '), ['Blum', 'Hettich']);
});
test('old cached pages do not clear unknown tags on an unrelated edit', () => {
	const base = loadProjectEditForm({ id: 'project-1', category_id: 'kitchens', value: 'Кухня' });
	assert.equal(Object.hasOwn(projectUpdateInput(base, [], false), 'tag_ids'), false);
	assert.deepEqual(projectUpdateInput(base, ['tag'], false).tag_ids, ['tag']);
});

test('clearing a Svelte numeric input produces nullable prices in both forms', () => {
	const input = form({ price: null, old_price: null });
	assert.deepEqual(validateProject(input, 1), {});
	assert.equal(projectInput(input, [], ['photo']).price, null);
	const edit = {
		...loadProjectEditForm({ id: 'project-1', category_id: 'kitchens', value: 'Кухня' }),
		price: 0,
		old_price: null
	};
	assert.deepEqual(validateProjectUpdate(edit), {});
	assert.equal(projectUpdateInput(edit, []).old_price, null);
	assert.equal(projectUpdateInput(edit, []).price, 0);
});
