import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'svelte/compiler';

const root = process.cwd();
const promoRoot = join(root, 'src/lib/components/templates/Promo-1');
const allowedIndependentPhones = new Set([
	// Баннер — канонический источник общего номера сайта.
	'src/lib/components/templates/Promo-1/layout/Banner/v1/Banner.svelte',
	'src/lib/components/templates/Promo-1/layout/Banner/v2/Banner.svelte',
	// Телефоны отдельных магазинов — контент списка, а не общий номер сайта.
	'src/lib/components/templates/Promo-1/pages/furnitura/FurnituraShops.svelte'
]);

function svelteFiles(directory) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return svelteFiles(path);
		return entry.isFile() && entry.name.endsWith('.svelte') ? [path] : [];
	});
}

function visit(value, callback, seen = new WeakSet()) {
	if (!value || typeof value !== 'object' || seen.has(value)) return;
	seen.add(value);
	callback(value);
	for (const child of Object.values(value)) {
		if (Array.isArray(child)) child.forEach((item) => visit(item, callback, seen));
		else visit(child, callback, seen);
	}
}

const errors = [];
let sharedPhoneLinks = 0;

for (const absolutePath of svelteFiles(promoRoot)) {
	const file = relative(root, absolutePath);
	const source = readFileSync(absolutePath, 'utf8');
	const ast = parse(source, { modern: true });

	visit(ast, (node) => {
		if (node.type !== 'Attribute' || node.name !== 'href') return;
		const attribute = source.slice(node.start, node.end).replace(/\s+/g, '');
		if (!/tel:|phone/i.test(attribute) || allowedIndependentPhones.has(file)) return;

		if (attribute !== 'href={phoneHref}') {
			const line = source.slice(0, node.start).split('\n').length;
			errors.push(`${file}:${line} — телефонная ссылка должна использовать href={phoneHref}`);
			return;
		}

		sharedPhoneLinks += 1;
	});

	if (source.includes('href={phoneHref}') && !/sitePhoneHref\s*\(\s*sitePhone\s*\)/.test(source)) {
		errors.push(`${file} — phoneHref должен вычисляться из sitePhone`);
	}
}

const pageRendererPath = join(root, 'src/lib/components/PageRenderer.svelte');
const pageRenderer = readFileSync(pageRendererPath, 'utf8');
if (!pageRenderer.includes('<Banner bind:data={headerDataState}')) {
	errors.push('PageRenderer.svelte — Banner должен обновлять headerDataState через bind:data');
}
if (!pageRenderer.includes('sitePhone={typeof headerDataState.phone')) {
	errors.push('PageRenderer.svelte — общий телефон должен передаваться page-компонентам и Footer');
}

for (const wrapper of [
	'src/lib/components/templates/Promo-1/layout/Footer/index.svelte',
	'src/lib/components/templates/Promo-1/pages/actions/ActionsCTA/index.svelte',
	'src/lib/components/templates/Promo-1/pages/contacts/ContactCTA/index.svelte'
]) {
	const source = readFileSync(join(root, wrapper), 'utf8');
	if (!source.includes('{sitePhone}')) {
		errors.push(`${wrapper} — обёртка вариантов должна передавать sitePhone`);
	}
}

if (sharedPhoneLinks === 0) {
	errors.push('Не найдено ни одной телефонной ссылки, подключённой к общему номеру');
}

if (errors.length > 0) {
	console.error(`Нарушен единый телефон сайта:\n${errors.map((error) => `- ${error}`).join('\n')}`);
	process.exit(1);
}

console.log(`Единый телефон сайта: проверено ${sharedPhoneLinks} телефонных ссылок.`);
