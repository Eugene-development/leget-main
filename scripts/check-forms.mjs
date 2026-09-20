import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { parse } from 'svelte/compiler';
const root = resolve(import.meta.dirname, '..');
const components = resolve(root, 'src/lib/components');
const exceptions = new Map([
	['LoginModal.svelte', 'Owner authentication'],
	['ClientAuthModal.svelte', 'Client authentication'],
	['ImagePickerDialog.svelte', 'Content editor'],
	['templates/Promo-1/pages/mebel/MebelTagModal.svelte', 'Content editor'],
	[
		'templates/Promo-1/pages/bytovaya-tehnika/BrandModal.svelte',
		'Owner-only brand CRUD, not a service request'
	],
	['templates/Promo-1/pages/mebel/MebelProjectDeleteDialog.svelte', 'Content editor'],
	['templates/Promo-1/pages/mebel/MebelProjectEditModal.svelte', 'Content editor'],
	['templates/Promo-1/pages/mebel/MebelProjectModal.svelte', 'Content editor']
]);
function files(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory() ? files(resolve(dir, entry.name)) : [resolve(dir, entry.name)]
	);
}
function walk(node, visitor) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) {
		for (const child of node) walk(child, visitor);
		return;
	}
	visitor(node);
	for (const value of Object.values(node)) walk(value, visitor);
}
const errors = [];
let count = 0;
for (const file of files(components).filter((file) => file.endsWith('.svelte'))) {
	const source = readFileSync(file, 'utf8');
	const path = relative(components, file);
	const ast = parse(source, { modern: true });
	const forms = [];
	walk(ast.fragment, (node) => {
		if (node.type === 'RegularElement' && node.name === 'form') forms.push(node);
		// A decorative CTA without onclick never reaches the form checks below.
		if (
			!exceptions.has(path) &&
			/^templates\/Promo-1\/pages\/(services|mebel|stoleshnica|bytovaya-tehnika|santehnika|furnitura|plitka)\//.test(
				path
			) &&
			node.type === 'RegularElement' &&
			node.name === 'button'
		) {
			const attr = (name) => node.attributes.find((a) => a.name === name);
			const type = attr('type')?.value?.[0]?.data;
			if (!attr('onclick') && !attr('data-goal-ignore') && type !== 'submit' && type !== 'reset')
				errors.push(
					`${path}: button without an action; connect the form or document data-goal-ignore`
				);
		}
	});
	if (!forms.length || exceptions.has(path)) continue;
	const senders = new Set();
	const factories = new Set();
	const functions = new Map();
	walk(ast.instance, (node) => {
		if (
			node.type === 'ImportDeclaration' &&
			/\/utils\/(form-submission|service-request)$/.test(node.source.value)
		) {
			for (const specifier of node.specifiers) {
				if (specifier.imported?.name === 'createFormSender') factories.add(specifier.local.name);
				if (specifier.imported?.name === 'submitServiceRequest') senders.add(specifier.local.name);
			}
		}
		if (node.type === 'FunctionDeclaration' && node.id) functions.set(node.id.name, node);
		if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
			if (factories.has(node.init?.callee?.name)) senders.add(node.id.name);
			if (['ArrowFunctionExpression', 'FunctionExpression'].includes(node.init?.type))
				functions.set(node.id.name, node.init);
		}
	});
	function reachesSender(node, visited = new Set()) {
		if (node?.type === 'Identifier') {
			if (visited.has(node.name)) return false;
			visited.add(node.name);
			node = functions.get(node.name);
		}
		let found = false;
		walk(node, (child) => {
			if (child.type !== 'CallExpression' || child.callee?.type !== 'Identifier') return;
			found ||= senders.has(child.callee.name) || reachesSender(child.callee, new Set(visited));
		});
		return found;
	}
	for (const form of forms) {
		const value = form.attributes.find((attribute) => attribute.name === 'onsubmit')?.value;
		const handler = (Array.isArray(value) ? value[0] : value)?.expression;
		if (!reachesSender(handler))
			errors.push(`${path}: submit handler does not call the durable sender`);
	}
	count++;
	// New public forms must use the durable sender; direct fetch is not a second intake path.
	if (
		!/import\s+\{[^}]*\b(createFormSender|submitServiceRequest)\b[^}]*\}\s+from\s+['"]\$lib\/utils\/(form-submission|service-request)['"]/.test(
			source
		)
	)
		errors.push(`${path}: public form must use the common submission sender`);
	if (/\bfetch\s*\(/.test(source))
		errors.push(`${path}: direct fetch in a public form bypasses the common sender`);
}
const mainHelper = readFileSync(resolve(root, 'src/lib/utils/form-submission.ts'), 'utf8');
const frontHelperPath = resolve(root, '../leget-front/src/lib/utils/form-submission.ts');
const frontHelper = existsSync(frontHelperPath)
	? readFileSync(frontHelperPath, 'utf8')
	: mainHelper;
if (mainHelper !== frontHelper)
	errors.push('Frontend submission helpers differ; update both deployment units.');
for (const path of ['src/routes/contact/+page.svelte', 'src/lib/components/Footer.svelte']) {
	if (!existsSync(resolve(root, '../leget-front', path))) continue;
	const source = readFileSync(resolve(root, '../leget-front', path), 'utf8');
	if (!source.includes('createFormSender') || /\bfetch\s*\(/.test(source))
		errors.push(`leget-front/${path}: common sender required`);
}
if (errors.length) {
	console.error(errors.join('\n'));
	process.exit(1);
}
console.log(
	`PASS: ${count} public form components + platform contact/subscription use the common sender.`
);
