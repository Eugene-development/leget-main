import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'svelte/compiler';
import { format, resolveConfig } from 'prettier';
import { goalLocations } from './goal-locations.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = join(root, 'src/lib/components');
const output = join(root, 'src/lib/yandex-direct/button-goals.json');
const write = process.argv.includes('--write');
const records = [];
const reviewedPath = join(root, 'scripts/goals-reviewed-controls.json');
const reviewed = JSON.parse(readFileSync(reviewedPath, 'utf8'));
const errors = [];
const shared = ['ServiceOrderIsland', 'ClientAuthModal', 'ClientAuthButtons', 'LoginModal'];
const ownerOnly = /Mebel(ProjectModal|ProjectEditModal|ProjectDeleteDialog|TagModal)/;
function walk(node, visit) {
	if (!node || typeof node !== 'object') return;
	if (node.type) visit(node);
	for (const [key, value] of Object.entries(node)) {
		if (key === 'parent' || key === 'attributes') continue;
		if (Array.isArray(value)) value.forEach((n) => walk(n, visit));
		else if (value && typeof value === 'object') walk(value, visit);
	}
}
function files(dir) {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory()
			? files(join(dir, e.name))
			: e.name.endsWith('.svelte')
				? [join(dir, e.name)]
				: []
	);
}
for (const file of [
	...files(join(base, 'templates')),
	...shared.map((n) => join(base, n + '.svelte'))
].sort()) {
	const source = readFileSync(file, 'utf8');
	const path = relative(base, file);
	if (ownerOnly.test(path)) continue;
	const ast = parse(source, { modern: true });
	const formFile = /<form\b/.test(source);
	walk(ast.fragment, (node) => {
		if (node.type !== 'RegularElement' || !['button', 'a', 'input', 'form'].includes(node.name))
			return;
		const attr = (name) => node.attributes.find((a) => a.name === name);
		const value = (name) => attr(name)?.value?.[0]?.data;
		const handler = attr('onclick');
		const code = handler ? source.slice(handler.start, handler.end) : '';
		let action = '';
		if (node.name === 'form') return;
		if (value('type') === 'submit') action = 'submit_click';
		else if (
			/serviceOrderStore\.open|clientAuthModal\.open|account\.open(Login|Register)|handleAuthClick|openCta|openApplication|partnershipOpen\s*=\s*true/.test(
				code
			)
		)
			action = 'open';
		else if (
			formFile &&
			/handleClose|onClose|closeApplication|onclick=\{close\}|open\s*=\s*false/.test(code)
		)
			action = 'close';
		else if (formFile && /resetForm|sent\s*=\s*false|formState\s*=\s*'idle'/.test(code))
			action = 'reset';
		if (!action && !value('data-metrika-goal')) {
			if (handler) {
				const signature = { source: path, handler: code.replace(/\s+/g, ' ').trim() };
				if (
					!value('data-goal-ignore') &&
					!reviewed.some((r) => r.source === path && r.handler === signature.handler)
				)
					errors.push(
						`${path}: новый/изменённый обработчик без цели: ${signature.handler}. Добавьте data-metrika-goal и data-goal-action либо data-goal-ignore с причиной.`
					);
			}
			return;
		}
		action ||= value('data-goal-action');
		const id = value('data-metrika-goal');
		if (!id || !/^[a-z0-9_]+$/.test(id)) {
			errors.push(
				`${path}:${source.slice(0, node.start).split('\n').length}: нужен статический data-metrika-goal (a-z, 0-9, _)`
			);
			return;
		}
		if (
			!['open', 'submit_click', 'close', 'reset'].includes(value('data-goal-action')) ||
			value('data-goal-action') !== action
		) {
			errors.push(`${path}: проверьте data-goal-action для ${id}`);
			return;
		}
		const text = [];
		walk(node.fragment, (n) => {
			if (n.type === 'Text' && n.data.trim()) text.push(n.data.trim());
			if (n.type === 'ExpressionTag') {
				const expression = n.expression;
				const fallback =
					expression.type === 'ConditionalExpression'
						? expression.alternate
						: expression.type === 'LogicalExpression'
							? expression.right
							: expression;
				if (fallback.type === 'Literal' && typeof fallback.value === 'string')
					text.push(fallback.value);
			}
		});
		const label =
			value('data-goal-label') ||
			value('aria-label') ||
			text.join(' ').replace(/\s+/g, ' ').slice(0, 140) ||
			path.split('/').at(-1).replace('.svelte', '');
		const template = path.match(/^templates\/([^/]+)/)?.[1];
		const templates = template
			? [template]
			: path.startsWith('LoginModal')
				? ['Promo-1', 'Promo-2', 'Promo-3', 'Test']
				: ['Promo-1'];
		const slug = path.match(/\/pages\/([^/]+)/)?.[1];
		const route =
			!slug || slug === '_shared' || path.includes('/services/_shared/')
				? null
				: slug === 'home'
					? '/'
					: `/${slug}`;
		const mock =
			['submit_click', 'reset'].includes(action) &&
			(/ContactForm.svelte$/.test(path) ||
				/Promo-3\/pages\/(contacts|vacancies)\/Form/.test(path) ||
				/Footer\/v1\/Footer/.test(path));
		records.push({ id, action, label, templates, source: path, route, mock });
	});
}
// SideDrawer has a caller-supplied goal: its settings drawers must not emit partnership events.
records.push(
	...['close', 'backdrop_close'].map((action) => ({
		id: `partnership_drawer_${action}`,
		action: 'close',
		label: action === 'close' ? 'Закрыть панель партнёрства' : 'Закрыть партнёрство по фону',
		templates: ['Promo-1'],
		source: 'SideDrawer.svelte',
		route: '/partnership',
		mock: false
	}))
);
records.push(
	...['close', 'backdrop_close'].map((action) => ({
		id: `guarantees_warranty_drawer_${action}`,
		action: 'close',
		label:
			action === 'close'
				? 'Закрыть гарантийное обращение'
				: 'Закрыть гарантийное обращение по фону',
		templates: ['Promo-1'],
		source: 'SideDrawer.svelte',
		route: '/guarantees',
		mock: false
	}))
);
const locate = goalLocations(root, write);
for (const record of records) record.locations = locate(record);
const unique = new Set();
for (const r of records)
	for (const t of r.templates) {
		const key = t + ':' + r.id;
		if (unique.has(key)) errors.push(`Повтор цели ${key}`);
		unique.add(key);
	}
const result = await format(JSON.stringify(records), {
	...(await resolveConfig(output)),
	plugins: [],
	filepath: output
});
if (write && !errors.length) writeFileSync(output, result);
else if (!write && readFileSync(output, 'utf8') !== result)
	errors.push('Карта устарела: npm run goals:generate');
if (errors.length) {
	console.error(errors.join('\n'));
	process.exitCode = 1;
} else
	console.log(
		`Цели: ${records.length} кнопок, ${unique.size} привязок к шаблонам. Карта проверена.`
	);
