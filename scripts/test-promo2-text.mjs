import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import ts from 'typescript';
import { createServer } from 'vite';
import { svelteFiles } from './check-promo2-text.mjs';

const root = resolve(import.meta.dirname, '..');
const template = resolve(root, 'src/lib/components/templates/Promo-2');
const textModule = { exports: {} };
new Function(
	'module',
	'exports',
	ts.transpileModule(readFileSync(resolve(template, 'content-text.ts'), 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS }
	}).outputText
)(textModule, textModule.exports);
const { readTextPath, updateTextPath } = textModule.exports;
const defaults = [
	{ title: 'Первая', image: '/first.webp', tags: ['А', 'Б'] },
	{ title: 'Вторая', image: '/second.webp', tags: ['В', 'Г'] }
];
const initial = { heading: 'Сохранённый заголовок', _fieldVisibility: { heading: false } };
const updated = updateTextPath(initial, ['cards', 1, 'tags', 1], 'Правка', { cards: defaults });
assert.equal(updated.cards[1].tags[1], 'Правка');
assert.equal(updated.cards[0].title, 'Первая');
assert.equal(updated.cards[1].image, '/second.webp');
assert.equal(updated.heading, initial.heading);
assert.deepEqual(updated._fieldVisibility, initial._fieldVisibility);
assert.equal(defaults[1].tags[1], 'Г', 'Default content is immutable');
assert.equal(initial.cards, undefined, 'No mutation before the server accepts a save');
assert.equal(readTextPath(JSON.parse(JSON.stringify(updated)), ['cards', 1, 'tags', 1]), 'Правка');
for (const empty of ['', null])
	assert.equal(readTextPath({ copy: { label: empty } }, ['copy', 'label']), empty);
for (const path of [
	['__proto__', 'polluted'],
	['constructor', 'prototype'],
	['cards', -1],
	['cards', 0.5]
]) {
	assert.throws(() => updateTextPath({}, path, 'bad'));
}
assert.equal({}.polluted, undefined);

// Exercise the real Svelte component with only its persistence and field UI replaced.
// This checks API routing and the failed-save boundary without a live tenant.
const capture = (globalThis.__promo2TextTest = { field: null, calls: [], fail: false });
const server = await createServer({
	root,
	server: { middlewareMode: true, hmr: false, ws: false },
	appType: 'custom',
	plugins: [
		{
			name: 'promo2-text-test-adapters',
			enforce: 'pre',
			resolveId(source, importer) {
				if (!importer?.includes('/Promo-2/ContentText.svelte')) return;
				if (
					source === '$lib/components/EditableField.svelte' ||
					source.endsWith('/components/EditableField.svelte')
				)
					return '\0promo2-test-field';
				if (source === '$lib/utils/page-edit' || /\/utils\/page-edit(?:\.ts)?$/.test(source))
					return '\0promo2-test-save';
			},
			load(id) {
				if (id === '\0promo2-test-field')
					return `export default function(payload, props) { globalThis.__promo2TextTest.field = props; props.children(payload, props.value); }`;
				if (id === '\0promo2-test-save')
					return `
    export async function saveComponentData(context, type, data) {
     const state = globalThis.__promo2TextTest;
     if (state.fail) throw new Error('API rejected save');
     state.calls.push({ scope: 'page', context, type, data: JSON.parse(JSON.stringify(data)) });
     data._componentId = 'saved-id';
     return 'saved-id';
    }
    export async function saveLayoutData(context, scope, data) {
     const state = globalThis.__promo2TextTest;
     if (state.fail) throw new Error('API rejected save');
     state.calls.push({ scope, context, data: JSON.parse(JSON.stringify(data)) });
    }`;
			}
		}
	]
});
try {
	const { render } = await server.ssrLoadModule('svelte/server');
	const { default: ContentText } = await server.ssrLoadModule(
		'/src/lib/components/templates/Promo-2/ContentText.svelte'
	);
	let data = { ...initial };
	const props = {
		get data() {
			return data;
		},
		set data(value) {
			data = value;
		},
		editContext: { pageId: 'page-a', licenseId: 'site-a' },
		isEditable: true,
		componentType: 'ActionsCards',
		path: ['cards', 1, 'title'],
		fallback: 'Вторая',
		defaults: { cards: defaults }
	};
	assert.match(render(ContentText, { props }).body, /Вторая/);
	assert.equal(capture.field.isEditable, true);
	await capture.field.onSave('Новая вторая карточка');
	data = capture.calls.at(-1).data;
	assert.equal(data.cards[1].title, 'Новая вторая карточка');
	assert.equal(data.cards[0].image, '/first.webp');
	assert.equal(capture.calls.at(-1).context.licenseId, 'site-a');
	const persisted = JSON.parse(JSON.stringify(data));
	props.fallback = 'Другой стартовый текст';
	assert.match(
		render(ContentText, { props: { ...props, data: persisted } }).body,
		/Новая вторая карточка/
	);
	const accepted = JSON.stringify(capture.calls);
	capture.fail = true;
	render(ContentText, { props }).body;
	await assert.rejects(capture.field.onSave('Ошибка'), /API rejected/);
	assert.equal(JSON.stringify(capture.calls), accepted, 'Rejected saves cannot publish new data');
	capture.fail = false;
	for (const scope of ['Header', 'Footer']) {
		render(ContentText, { props: { ...props, scope } }).body;
		await capture.field.onSave('Общий текст');
		assert.equal(capture.calls.at(-1).scope, scope);
	}
	render(ContentText, {
		props: { ...props, data: {}, editContext: { pageId: 'page-b', licenseId: 'site-b' } }
	}).body;
	await capture.field.onSave('Текст второго сайта');
	assert.equal(capture.calls.at(-1).context.licenseId, 'site-b');
	assert.equal(
		data.cards[1].title,
		'Новая вторая карточка',
		'The second tenant cannot modify the first tenant data'
	);
	for (const empty of ['', null]) {
		render(ContentText, {
			props: { ...props, path: ['heading'], data: { heading: empty }, fallback: 'Не возвращать' }
		}).body;
		assert.equal(capture.field.value, '');
	}
	render(ContentText, { props: { ...props, editContext: null } }).body;
	assert.equal(capture.field.isEditable, false);

	let rendered = 0;
	for (const file of svelteFiles()) {
		const name = relative(template, file);
		if (
			!(name.startsWith('pages/') && !name.startsWith('pages/_shared/')) &&
			!['layout/Header.svelte', 'layout/Footer.svelte'].includes(name)
		)
			continue;
		// Field adapters and version wrappers require their own dedicated child props.
		if (/\/(?:HeroField|HeroLink|HeroStats|FacadeField|CatalogLayout)\.svelte$/.test(name))
			continue;
		const component = await server.ssrLoadModule('/' + relative(root, file));
		render(component.default, { props: { data: {}, isEditable: false } }).body;
		render(component.default, {
			props: {
				data: {},
				isEditable: true,
				editContext: { pageId: 'preview', licenseId: 'preview' }
			}
		}).body;
		rendered++;
	}
	const { requestText, requestCopyFields } = await server.ssrLoadModule(
		'/src/lib/components/templates/Promo-2/forms/copy.ts'
	);
	assert.equal(requestText({ requestCopy: { nameLabel: null } }, 'nameLabel', 'Имя'), '');
	const { default: RequestModal } = await server.ssrLoadModule(
		'/src/lib/components/templates/Promo-2/forms/RequestModal.svelte'
	);
	const { formDefinitions } = await server.ssrLoadModule(
		'/src/lib/components/templates/Promo-2/forms/request.ts'
	);
	for (const kind of Object.keys(formDefinitions)) {
		const html = render(RequestModal, {
			props: {
				request: { kind, subject: '' },
				data: {
					requestCopy: { [`title.${kind}`]: 'Свой заголовок', nameLabel: 'Как к вам обращаться' }
				}
			}
		}).body;
		assert.match(html, /Свой заголовок/);
		assert.match(html, /Как к вам обращаться/);
	}
	assert.equal(new Set(requestCopyFields.map((field) => field.key)).size, requestCopyFields.length);
	console.log(
		`PASS: nested text saves, defaults/media preservation, reload, cleared values, API failure, layout storage, tenant isolation; ${rendered} components rendered in visitor/editor modes and all 10 forms customized.`
	);
} finally {
	await server.close();
	delete globalThis.__promo2TextTest;
}
