import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'svelte/compiler';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const renderer = parse(readFileSync(join(root, 'src/lib/components/PageRenderer.svelte'), 'utf8'), {
	modern: true
});
const declarations = new Map();
function walk(node, visit) {
	if (!node || typeof node !== 'object') return;
	visit(node);
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) value.forEach((item) => walk(item, visit));
		else if (value && typeof value === 'object') walk(value, visit);
	}
}
walk(renderer.instance, (node) => {
	if (
		node.type === 'VariableDeclarator' &&
		node.init?.type === 'NewExpression' &&
		node.init.callee?.name === 'Set'
	) {
		declarations.set(
			node.id.name,
			new Set(node.init.arguments[0].elements.map((element) => element.value))
		);
	}
});
const expected = new Map([
	['VersionSwitcher', declarations.get('promo1ComponentsWithSwitcher')],
	['SingleVersionSettings', declarations.get('promo1ComponentsWithEmbeddedSingleVersionSettings')]
]);
const actual = new Map([...expected.keys()].map((name) => [name, new Set()]));
const promo2ActionsExpected = declarations.get('promo2ActionsComponentsWithSwitcher');
const promo2ActionsActual = new Set();
const promo2HomeExpected = declarations.get('promo2HomeComponentsWithSwitcher');
const promo2HomeActual = new Set();
const promo2FacadesExpected = declarations.get('promo2FacadesComponentsWithSwitcher');
const promo2FacadesActual = new Set();
const errors = [];
let files = 0;
let controls = 0;
function inspect(directory) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const file = join(directory, entry.name);
		if (entry.isDirectory()) {
			inspect(file);
			continue;
		}
		if (!entry.name.endsWith('.svelte')) continue;
		files++;
		const ast = parse(readFileSync(file, 'utf8'), { modern: true });
		const instances = [];
		walk(ast.fragment, (node) => {
			if (node.type === 'Component' && node.name === 'BlockThemeToggle')
				errors.push(
					`${relative(root, file)}: отдельный тумблер темы нужно перенести в общую панель`
				);
			if (node.type !== 'Component' || !expected.has(node.name)) return;
			instances.push(node);
			controls++;
			const attribute = node.attributes.find((item) => item.name === 'componentType');
			const type = attribute?.value?.[0]?.data;
			const path = relative(root, file);
			if (!type) {
				errors.push(`${path}: componentType должен быть явным для аудита панели`);
				return;
			}
			if (!path.includes('/Promo-1/')) {
				if (path.includes('/Promo-2/pages/home/') && node.name === 'VersionSwitcher') {
					promo2HomeActual.add(type);
					if (!promo2HomeExpected?.has(type))
						errors.push(`${path}: ${type} получит вторую панель из PageRenderer`);
					return;
				}
				if (path.includes('/Promo-2/pages/facades/') && node.name === 'VersionSwitcher') {
					promo2FacadesActual.add(type);
					if (!promo2FacadesExpected?.has(type))
						errors.push(`${path}: ${type} получит вторую панель из PageRenderer`);
					return;
				}
				if (path.includes('/Promo-2/pages/actions/') && node.name === 'VersionSwitcher') {
					promo2ActionsActual.add(type);
					if (!promo2ActionsExpected?.has(type))
						errors.push(`${path}: ${type} получит вторую панель из PageRenderer`);
					return;
				}
				errors.push(`${path}: встроенная панель нового шаблона не учтена PageRenderer`);
				return;
			}
			actual.get(node.name).add(type);
			if (!expected.get(node.name)?.has(type))
				errors.push(`${path}: ${type} получит вторую панель из PageRenderer`);
		});
		if (instances.length > 1)
			errors.push(`${relative(root, file)}: несколько панелей — проверьте их взаимоисключение`);
	}
}
const templates = join(root, 'src/lib/components/templates');
for (const entry of readdirSync(templates, { withFileTypes: true })) {
	if (!entry.isDirectory() || !/^(Promo-\d+|Test)$/.test(entry.name)) continue;
	const directory = join(templates, entry.name, 'pages');
	try {
		inspect(directory);
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
}
for (const [kind, types] of expected) {
	if (!types) {
		errors.push(`Не найден реестр ${kind}`);
		continue;
	}
	for (const type of types)
		if (!actual.get(kind).has(type))
			errors.push(`${type}: запись ${kind} не соответствует каталогу`);
}
if (!promo2ActionsExpected) errors.push('Не найден реестр панелей Promo-2 /actions');
if (!promo2HomeExpected) errors.push('Не найден реестр панелей Promo-2 /');
for (const type of promo2HomeExpected ?? []) {
	if (!promo2HomeActual.has(type)) errors.push(`Promo-2 / ${type}: нет встроенной панели`);
}
for (const type of promo2ActionsExpected ?? []) {
	if (!promo2ActionsActual.has(type))
		errors.push(`Promo-2 /actions ${type}: нет встроенной панели`);
}
if (!promo2FacadesExpected) errors.push('Не найден реестр панелей Promo-2 /facades');
for (const type of promo2FacadesExpected ?? []) {
	if (!promo2FacadesActual.has(type))
		errors.push(`Promo-2 /facades ${type}: нет встроенной панели`);
}
// Main actions must only be rendered inside the gear popover, never alongside it.
for (const name of ['VersionSwitcher.svelte', 'templates/Promo-1/layout/Footer/index.svelte']) {
	const source = join(root, 'src/lib/components', name);
	const ast = parse(readFileSync(source, 'utf8'), { modern: true });
	let popovers = 0;
	function visit(node, inside = false) {
		if (!node || typeof node !== 'object') return;
		if (node.type === 'Component' && node.name === 'ComponentControlsPopover') {
			inside = true;
			popovers++;
		}
		if (
			node.type === 'Component' &&
			['ComponentOrderControls', 'ThemeToggle', 'ComponentSettingsDrawer'].includes(node.name) &&
			!inside
		) {
			errors.push(`${name}: ${node.name} находится вне окна шестерёнки`);
		}
		for (const value of Object.values(node)) {
			if (Array.isArray(value)) value.forEach((child) => visit(child, inside));
			else if (value && typeof value === 'object') visit(value, inside);
		}
	}
	visit(ast.fragment);
	if (popovers !== 1) errors.push(`${name}: требуется одна общая шестерёнка`);
}
if (errors.length) {
	console.error(errors.join('\n'));
	process.exitCode = 1;
} else
	console.log(
		`Панели компонентов: ${files} файлов, ${controls} встроенных панелей; дубли с PageRenderer исключены.`
	);
