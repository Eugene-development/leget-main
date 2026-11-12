import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createServer } from 'vite';

const root = process.cwd();
const componentsRoot = join(root, 'src/lib/components');
const defaults = JSON.parse(readFileSync(join(root, 'src/lib/ds/defaults.json'), 'utf8'));

function componentFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return componentFiles(path);
		return entry.isFile() && entry.name.endsWith('.svelte') ? [path] : [];
	});
}

// These require structural props and are exercised by their page wrappers.
const sharedParts = new Set([
	'templates/Promo-1/pages/_shared/CatalogSidebar.svelte',
	'templates/Promo-1/pages/_shared/PageHero.svelte'
]);
const files = [
	...componentFiles(join(componentsRoot, 'templates')),
	join(componentsRoot, 'legal/PrivacyPolicy.svelte')
].filter((file) => !sharedParts.has(relative(componentsRoot, file)));

let fields = [];
let writes = [];
globalThis.__captureEditableText = (field) => {
	fields.push(field);
	return '';
};
globalThis.__saveEditableText = (type, data) => {
	writes.push({ type, data: structuredClone(data) });
	return 'saved-component';
};

// Exercise the real components, callbacks, text renderer and EditableField.
// Only persistence and SvelteKit's request-bound page state are substituted.
const server = await createServer({
	appType: 'custom',
	logLevel: 'error',
	server: { middlewareMode: true, hmr: false, ws: false },
	optimizeDeps: { noDiscovery: true, include: [] },
	plugins: [
		{
			name: 'editable-text-round-trip',
			enforce: 'pre',
			load(id) {
				if (id.includes('/runtime/app/state/server.js')) {
					return `export const page = {data:{},url:new URL('https://test.local/test'),params:{},state:{}};
						export const navigating = {}; export const updated = {current:false};`;
				}
				if (id.includes('/runtime/app/stores.js')) {
					return `const value={data:{},url:new URL('https://test.local/test'),params:{}};
						export const page={subscribe:fn=>{fn(value);return ()=>{};}};
						export const navigating={subscribe:fn=>{fn(null);return ()=>{};}};
						export const updated={subscribe:fn=>{fn(false);return ()=>{};}};`;
				}
				if (id.endsWith('/src/lib/components/EditableField.svelte')) {
					return readFileSync(id, 'utf8').replace(
						'</script>',
						'</script>\n{@html globalThis.__captureEditableText({fieldKey,value:displayValue,onSave,kind,isEditable})}'
					);
				}
				if (id.endsWith('/src/lib/utils/page-edit.ts')) {
					return `export const COMPONENT_ARTICLES_CONTEXT = Symbol();
						export const LAYOUT_SECTION_CODES = {};
						export const saveComponentData = async (context,type,data) => globalThis.__saveEditableText(type,data);
						export const saveLayoutData = saveComponentData;
						export const getLayoutComponentArticle = () => null;
						export const deleteComponentData = async () => {};
						export const listBucketFiles = async () => [];
						export const toggleCategory = async () => {};
						export const savePageSeo = async () => {};`;
				}
			}
		}
	]
});

function initialData(file, templateId) {
	const type = file.split('/').at(-1).replace('.svelte', '');
	const pages = defaults[templateId]?.pages ?? {};
	const pagePath = file.split('/pages/')[1] ?? '';
	const slug = Object.keys(pages)
		.filter((slug) => pagePath.startsWith(`${slug.replace(/^\//, '')}/`))
		.sort((a, b) => b.length - a.length)[0];
	return (
		pages[slug]?.[type] ??
		Object.values(pages).find((page) => Object.hasOwn(page, type))?.[type] ??
		{}
	);
}

const failures = [];
let testedComponents = 0;
let testedFields = 0;
try {
	const { render } = await server.ssrLoadModule('svelte/server');
	const { editableText } = await server.ssrLoadModule('/src/lib/utils/editable-text.ts');
	assert.equal(editableText(undefined, 'Стартовый текст'), 'Стартовый текст');
	for (const value of ['', null]) assert.equal(editableText(value, 'Стартовый текст'), '');
	for (const value of ['Свой текст', '  текст  ', '<!--leget-rich-text:v1--><p>Текст</p>']) {
		assert.equal(editableText(value, 'Стартовый текст'), value);
	}
	assert.equal(editableText(0, 'Стартовый текст'), '0');

	for (const file of files) {
		if (!readFileSync(file, 'utf8').includes('<EditableField')) continue;
		const modulePath = `/${relative(root, file)}`;
		const templateId = Number(file.match(/Promo-(\d)/)?.[1] ?? 0);
		const { default: Component } = await server.ssrLoadModule(modulePath);
		const props = {
			isEditable: true,
			editContext: { pageId: '1', licenseId: 'test', templateId, slug: '/test' }
		};
		function capture(data) {
			fields = [];
			// Svelte evaluates SSR lazily; read body to run the component.
			render(Component, { props: { ...props, data: structuredClone(data) } }).body;
			return fields.filter((field) => field.kind !== 'image' && field.isEditable);
		}
		testedComponents++;
		for (const initial of [{}, initialData(file, templateId)]) {
			const baseline = capture(initial);
			for (let index = 0; index < baseline.length; index++) {
				const field = capture(initial)[index];
				if (typeof field.onSave !== 'function') continue;
				testedFields++;
				writes = [];
				await field.onSave('');
				assert.ok(writes.length, `${modulePath}: ${field.fieldKey} must save cleared content`);
				// The HTTP middleware can convert any cleared string to null.
				const saved = writes.at(-1).data;
				for (const mode of ['empty', 'null']) {
					const reloaded = JSON.parse(JSON.stringify(saved), (_key, value) =>
						mode === 'null' && value === '' ? null : value
					);
					try {
						const after = capture(reloaded).find((next) => next.fieldKey === field.fieldKey);
						// A cleared field may intentionally disappear from the markup.
						if (after) assert.equal(after.value, '');
					} catch (error) {
						failures.push(`${modulePath}: ${field.fieldKey} (${mode}): ${error.message}`);
					}
				}
			}
		}
	}
	assert.ok(testedComponents > 250 && testedFields > 2000, 'All template fields must be exercised');
	assert.deepEqual(failures, [], failures.slice(0, 10).join('\n'));
	console.log(
		`Editable text: ${testedComponents} components, ${testedFields} field saves; empty strings and null survive reloading.`
	);
} finally {
	await server.close();
	delete globalThis.__captureEditableText;
	delete globalThis.__saveEditableText;
}
