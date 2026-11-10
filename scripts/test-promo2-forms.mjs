import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { parse } from 'svelte/compiler';

const root = resolve(import.meta.dirname, '../src/lib/components/templates/Promo-2');
const kinds = new Set();
let triggers = 0;
function walk(node, visit) {
	if (!node || typeof node !== 'object') return;
	if (Array.isArray(node)) return node.forEach((child) => walk(child, visit));
	visit(node);
	for (const value of Object.values(node)) walk(value, visit);
}
function inspect(directory) {
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = resolve(directory, entry.name);
		if (entry.isDirectory()) {
			inspect(path);
			continue;
		}
		if (!entry.name.endsWith('.svelte')) continue;
		const source = readFileSync(path, 'utf8');
		const ast = parse(source, { modern: true });
		walk(ast.fragment, (node) => {
			if (node.type !== 'RegularElement') return;
			const attribute = (name) => node.attributes.find((item) => item.name === name);
			const click = attribute('onclick');
			const code = click ? source.slice(click.start, click.end) : '';
			if (code.includes('openPromo2Form(')) {
				assert.equal(node.name, 'button', relative(root, path));
				assert.equal(attribute('type')?.value[0].data, 'button');
				assert.ok(attribute('data-metrika-goal'));
				assert.equal(attribute('data-goal-action')?.value[0].data, 'open');
				assert.match(code, /!isEditable/, 'Do not open visitor forms during editing');
				kinds.add(code.match(/openPromo2Form\(\s*'([^']+)'/)[1]);
				triggers++;
			}
			const href = attribute('href');
			if (node.name === 'a' && href && !path.endsWith('/layout/Footer.svelte')) {
				assert.doesNotMatch(
					source.slice(href.start, href.end),
					/\/contact/,
					`CTA still navigates to contact: ${path}`
				);
			}
		});
	}
}
inspect(root);
assert.equal(triggers, 27, 'Audit new CTA locations when this changes');
assert.equal(kinds.size, 10, 'Every target form must have a trigger');
console.log(
	'PASS: 27 Promo-2 CTA locations open 10 target forms; no contact redirects; goals and editor guards present.'
);
