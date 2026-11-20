import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'svelte/compiler';
import { loadServerModule } from './test-server-module.mjs';
const { GRADIENT_SURFACES } = loadServerModule(
	new URL('../src/lib/design-systems/gradient-surfaces.ts', import.meta.url),
	{}
);
const root = new URL('../src/lib/components/templates/Promo-1/', import.meta.url).pathname;
const problems = [];
let files = 0,
	ramps = 0;
function strings(n) {
	if (!n) return [''];
	if (n.type === 'Literal' && typeof n.value === 'string') return [n.value];
	if (n.type === 'ConditionalExpression')
		return [...strings(n.consequent), ...strings(n.alternate)];
	if (n.type === 'LogicalExpression') return ['', ...strings(n.right)];
	return [''];
}
function checkLiteral(value, file) {
	const w = value.split(/\s+/);
	if (w.includes('bg-clip-text') || /pointer-events-none|\babsolute\b/.test(value)) return;
	const from = w.find((x) => /^from-[a-z\d-]+$/.test(x))?.slice(5),
		to = w.find((x) => /^to-[a-z\d-]+$/.test(x))?.slice(3),
		via = w.find((x) => /^via-[a-z\d-]+$/.test(x))?.slice(4);
	if (!from || !to || [from, to, via].includes('transparent')) return;
	const key = [from, via, to].filter(Boolean).join('--');
	ramps++;
	if (!GRADIENT_SURFACES[key]) problems.push(`${relative(root, file)}: data ramp ${key}`);
}
function literals(n, file) {
	if (!n || typeof n !== 'object') return;
	if (n.type === 'Literal' && typeof n.value === 'string') checkLiteral(n.value, file);
	for (const [k, v] of Object.entries(n))
		if (!['start', 'end', 'loc', 'parent'].includes(k)) {
			if (Array.isArray(v)) v.forEach((x) => literals(x, file));
			else if (v && typeof v === 'object') literals(v, file);
		}
}
function visit(n, file) {
	if (!n || typeof n !== 'object') return;
	if (n.type === 'Element' && !['button', 'a'].includes(n.name)) {
		const attr = n.attributes?.find((a) => a.type === 'Attribute' && a.name === 'class');
		if (attr) {
			let variants = [''];
			for (const chunk of attr.value ?? [])
				variants = variants.flatMap((s) =>
					(chunk.type === 'Text' ? [chunk.data] : strings(chunk.expression)).map((v) => s + v)
				);
			for (const c of variants) {
				const words = c.split(/\s+/);
				if (
					!words.some((w) => /^bg-(linear|gradient)-to-/.test(w)) ||
					words.includes('bg-clip-text') ||
					/pointer-events-none|\babsolute\b/.test(c)
				)
					continue;
				const from = words.find((w) => /^from-[a-z\d-]+$/.test(w))?.slice(5),
					to = words.find((w) => /^to-[a-z\d-]+$/.test(w))?.slice(3),
					via = words.find((w) => /^via-[a-z\d-]+$/.test(w))?.slice(4);
				if (!from || !to || [from, to, via].includes('transparent')) continue;
				const key = [from, via, to].filter(Boolean).join('--');
				ramps++;
				if (!GRADIENT_SURFACES[key])
					problems.push(`${relative(root, file)}: unregistered opaque ramp ${key}`);
			}
		}
	}
	for (const [k, v] of Object.entries(n))
		if (!['start', 'end', 'loc', 'parent', 'attributes'].includes(k)) {
			if (Array.isArray(v)) v.forEach((x) => visit(x, file));
			else if (v && typeof v === 'object') visit(v, file);
		}
}
function walk(dir) {
	for (const f of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, f.name);
		if (f.isDirectory()) walk(path);
		else if (f.name.endsWith('.svelte')) {
			files++;
			const ast = parse(readFileSync(path, 'utf8'));
			visit(ast.html, path);
			literals(ast.instance?.content, path);
			literals(ast.module?.content, path);
		} else if (f.name.endsWith('.ts')) {
			const ast = ts.createSourceFile(
				path,
				readFileSync(path, 'utf8'),
				ts.ScriptTarget.Latest,
				true
			);
			const visit = (n) => {
				if (ts.isStringLiteral(n)) checkLiteral(n.text, path);
				ts.forEachChild(n, visit);
			};
			visit(ast);
		}
	}
}
walk(root);
if (problems.length) {
	console.error(problems.join('\n'));
	process.exit(1);
}
console.log(`Gradient coverage: ${files} Promo-1 files, ${ramps} opaque canvas uses registered.`);
