import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { parse } from 'svelte/compiler';

const root = resolve(import.meta.dirname, '../src/lib/components/templates/Promo-2');
export function svelteFiles(directory = root) {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = resolve(directory, entry.name);
		return entry.isDirectory() ? svelteFiles(path) : entry.name.endsWith('.svelte') ? [path] : [];
	});
}
const failures = [];
let files = 0;
let fields = 0;
for (const path of svelteFiles()) {
	const file = relative(root, path);
	// These components are the editor itself; their labels are product UI.
	if (
		/^(?:ContentText\.svelte|pages\/_shared\/|layout\/HeaderSettings\.svelte|layout\/TopBar\/)/.test(
			file
		)
	)
		continue;
	const source = readFileSync(path, 'utf8');
	const ast = parse(source, { modern: true });
	files++;
	function walk(node, parents = []) {
		if (!node || typeof node !== 'object') return;
		if (
			node.type === 'Component' &&
			/^(?:EditableField|ContentText|HeroField|HeroLink|FacadeField)$/.test(node.name)
		) {
			fields++;
			return;
		}
		if (
			parents.some((p) => p.type === 'SnippetBlock' && /settings/i.test(p.expression?.name ?? ''))
		)
			return;
		if (
			parents.some(
				(p) =>
					p.name === 'svg' ||
					p.attributes?.some((a) => a.name === 'aria-hidden' && a.value?.[0]?.data === 'true')
			)
		)
			return;
		if (['Text', 'ExpressionTag'].includes(node.type)) {
			const text =
				node.type === 'Text'
					? node.data.trim()
					: source.slice(node.expression.start, node.expression.end);
			if (!text || (node.type === 'Text' && !/[\p{L}\p{N}]/u.test(text))) return;
			// Gallery content is edited in the product catalog; favourites display the visitor's saved products.
			if (/Gallery\.svelte$/.test(file)) {
				if (parents.some((p) => p.name === 'dialog')) return; // Photo viewer controls.
				if (
					node.type === 'ExpressionTag' &&
					/^(?:project\.|item\.|items\.filter|isEditable \?)/.test(text)
				)
					return;
				if (node.type === 'Text' && /^Управлять (?:кухнями|шкафами)$/.test(text)) return;
			}
			// Shared top bar contacts/links already have a dedicated Header drawer.
			if (
				file === 'layout/Header.svelte' &&
				(['phone', 'email', 'link.label'].includes(text) || text.includes('$auth.isAuthenticated'))
			)
				return;
			if (file === 'layout/Footer.svelte' && text.includes('$auth.isAuthenticated')) return;
			// Errors, computed counters and map selector labels derive from editable content or runtime state.
			if (
				node.type === 'ExpressionTag' &&
				(/^(?:error|phoneError|formError|errorMessage|count|pad\(unit\.v\)|filteredVacancies\.length|group\.city)/.test(
					text
				) ||
					text.startsWith('requestText(') ||
					(file === 'forms/RequestModal.svelte' &&
						(text.includes('requestText(') || text === 'request.subject')))
			)
				return;
			failures.push(
				`${file}:${source.slice(0, node.start).split('\n').length}: ${text.replace(/\s+/g, ' ')}`
			);
			return;
		}
		for (const [key, value] of Object.entries(node)) {
			if (
				[
					'instance',
					'module',
					'css',
					'attributes',
					'expression',
					'metadata',
					'context',
					'index'
				].includes(key)
			)
				continue;
			if (Array.isArray(value)) value.forEach((child) => walk(child, [...parents, node]));
			else if (value && typeof value === 'object') walk(value, [...parents, node]);
		}
	}
	walk(ast.fragment);
}
assert.deepEqual(failures, [], 'Promo-2 content without an editor:\n' + failures.join('\n'));
console.log(
	`PASS: Promo-2 text coverage — ${files} components, ${fields} editable text locations; catalog and shared layout editors accounted for.`
);
