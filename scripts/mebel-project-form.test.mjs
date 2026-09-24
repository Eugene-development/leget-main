import test from 'node:test';
import assert from 'node:assert/strict';
import {
	projectInput,
	validateProject
} from '../src/lib/components/templates/Promo-1/pages/mebel/project-form.ts';
import { projectTitle } from '../src/lib/components/templates/Promo-1/pages/projects/ProjectsFeed/data.ts';

const form = (values = {}) => ({
	category_id: 'kitchens',
	value: ' 124 ',
	short_description: ' ',
	description: '',
	price: undefined,
	old_price: undefined,
	is_active: true,
	is_new: false,
	is_featured: false,
	completed_at: '',
	object_address: '',
	maker: '',
	...values
});

test('project cards add the static label to the stored number', () => {
	assert.equal(projectTitle('124'), 'Проект 124');
});

test('zero price remains zero, blank optional fields become null, choices survive', () => {
	const tags = ['brand', 'material'];
	const result = projectInput(form({ price: 0, old_price: 12.25 }), tags, ['photo']);
	assert.equal(result.price, 0);
	assert.equal(result.old_price, 12.25);
	assert.equal(result.value, '124');
	assert.equal(result.short_description, null);
	assert.deepEqual(result.tag_ids, tags);
	assert.notEqual(result.tag_ids, tags);
	assert.deepEqual(result.image_urls, ['photo']);
	assert.equal(result.completed_at, null);
	assert.equal(result.object_address, null);
	assert.equal(result.maker, null);
});
test('new projects send the work passport alongside tags and photos', () => {
	const input = projectInput(
		form({
			completed_at: '2026-09-14',
			object_address: '  Москва, улица Ленина, 1  ',
			maker: '  Собственное производство  '
		}),
		['brand-tag'],
		['photo']
	);
	assert.equal(input.completed_at, '2026-09-14');
	assert.equal(input.object_address, 'Москва, улица Ленина, 1');
	assert.equal(input.maker, 'Собственное производство');
	assert.deepEqual(input.tag_ids, ['brand-tag']);
});
test('optional prices, valid decimal prices and eight photos are accepted', () => {
	assert.deepEqual(validateProject(form(), 1), {});
	assert.deepEqual(validateProject(form({ price: 0, old_price: 9999999999.99 }), 8), {});
	assert.equal(projectInput(form(), [], []).price, null);
});
test('blank project numbers and categories are rejected', () => {
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

const { loadProjectEditForm, projectUpdateInput, validateProjectUpdate } =
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
	assert.equal(result.maker, 'Фабрика');
	assert.equal(result.completed_at, '2026-09-14');
	assert.deepEqual(validateProjectUpdate(result), {});
});
test('edit sends explicit clearing values and preserves images when the gallery is untouched', () => {
	const source = loadProjectEditForm({
		id: 'project-1',
		value: ' Кухня ',
		category_id: 'kitchens',
		price: 0,
		meta: { hardware_brands: ['Blum'], appliance_brands: ['Bosch'] }
	});
	const input = projectUpdateInput(source, []);
	assert.equal(input.id, 'project-1');
	assert.equal(input.price, 0);
	assert.equal(input.old_price, null);
	assert.equal(input.completed_at, null);
	assert.equal(input.object_address, null);
	assert.equal(input.maker, null);
	assert.deepEqual(input.tag_ids, []);
	assert.equal(Object.hasOwn(input, 'hardware_brands'), false);
	assert.equal(Object.hasOwn(input, 'appliance_brands'), false);
	assert.equal(Object.hasOwn(input, 'image_urls'), false);
});
test('edit sends a replacement image list only after the gallery changes', () => {
	const source = loadProjectEditForm({
		id: 'project-1',
		value: 'Кухня',
		category_id: 'kitchens'
	});
	const urls = ['https://storage.example/old.webp', 'https://storage.example/new.webp'];
	const input = projectUpdateInput(source, [], true, urls);
	assert.deepEqual(input.image_urls, urls);
	assert.notEqual(input.image_urls, urls);
});
test('both forms reject invalid passport dates and oversized passport fields', () => {
	const base = loadProjectEditForm({ id: 'project-1', category_id: 'kitchens', value: 'Кухня' });
	assert.ok(validateProjectUpdate({ ...base, id: '' }).id);
	assert.ok(validateProjectUpdate({ ...base, value: '   ' }).value);
	for (const date of ['2026-02-30', '2025-02-29', '0001-01-01', 'not-a-date'])
		assert.ok(validateProject({ ...base, completed_at: date }, 1).completed_at);
	assert.equal(validateProject({ ...base, completed_at: '2024-02-29' }, 1).completed_at, undefined);
	assert.ok(validateProject({ ...base, maker: 'a'.repeat(256) }, 1).maker);
	assert.ok(validateProject({ ...base, object_address: 'a'.repeat(256) }, 1).object_address);
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
