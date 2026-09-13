import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../src/lib/utils/rich-text.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
	compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
}).outputText;
const module = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, module, module.exports);
const {
	RICH_TEXT_PREFIX: prefix,
	editorContent,
	serializeRichText,
	renderRichText,
	richTextToPlainText
} = module.exports;
const sample =
	'<p><strong>Мебель</strong> <em>на заказ</em> <u>с гарантией</u> <s>старая цена</s></p><ul><li><p>Замер</p></li><li><p>Проект</p><ol start="3"><li><p>Детали</p></li></ol></li></ul><blockquote><p>Цитата</p></blockquote>';
assert.equal(editorContent(serializeRichText(sample)), sample, 'formatting survives reopening');
const result = renderRichText(serializeRichText(sample));
for (const tag of ['strong', 'em', 'u', 's']) assert.ok(result.includes(`<${tag}>`));
assert.match(result, /role="list"/);
assert.match(result, /role="listitem"/);
assert.match(result, /counter-reset:\s*rt-item 2/);
assert.doesNotMatch(result, /<(?:p|ul|ol|li|blockquote)[\s>]/);
assert.equal(
	renderRichText('Цена < 100 & <strong>не HTML</strong>'),
	'Цена &lt; 100 &amp; &lt;strong&gt;не HTML&lt;/strong&gt;'
);
assert.equal(editorContent('строка 1\nстрока 2'), '<p>строка 1<br>строка 2</p>');
for (const html of ['<p></p>', '<p><br></p>', '<p>&nbsp;</p>'])
	assert.equal(serializeRichText(html), '');
assert.equal(richTextToPlainText(serializeRichText('<p>А &amp; Б &lt; 5</p>')), 'А & Б < 5');
assert.equal(
	richTextToPlainText(`Проект «${serializeRichText('<p><strong>Кухня</strong></p>')}»`),
	'Проект «Кухня\n»'
);
for (const payload of [
	'<p onclick="alert(1)" style="color:red">Текст<img src=x onerror=alert(1)></p><script>alert(1)</script>',
	'<svg><a xlink:href="javascript:alert(1)">bad</a></svg><iframe srcdoc="<script>alert(1)</script>"></iframe>',
	'<a href="javascript:alert(1)">link</a><span class="bad" style="background:url(x)">text</span>',
	'<math><mtext><table><mglyph><style><!--</style><img title="--><img src=1 onerror=alert(1)>">',
	'<ol start="1; background:url(javascript:alert(1))"><li>test</li></ol>'
]) {
	assert.doesNotMatch(
		renderRichText(prefix + payload),
		/<script|<svg|<math|<img|<iframe|javascript:|onclick|onerror|background:|srcdoc|class="bad"/i
	);
	assert.doesNotMatch(serializeRichText(payload), /<script|<img|onclick|onerror|javascript:/i);
}
assert.match(renderRichText('<p>Старый <b>HTML</b></p>', true), /<strong>HTML<\/strong>/);
const { parse } = require('svelte/compiler');
const graph = JSON.parse(readFileSync(resolve('../../graphify-out/graph.json'), 'utf8'));
const files = [
	...new Set(
		graph.nodes
			.map((n) => n.source_file)
			.filter((f) => f?.startsWith('leget-main/') && f.endsWith('.svelte'))
	)
];
function walk(node, cb, parents = []) {
	if (!node || typeof node !== 'object') return;
	if (node.type) cb(node, parents);
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) value.forEach((v) => walk(v, cb, [...parents, node]));
		else if (value && typeof value === 'object') walk(value, cb, [...parents, node]);
	}
}
let fields = 0;
for (const file of files) {
	if (!existsSync(resolve('../', file))) continue;
	const s = readFileSync(resolve('../', file), 'utf8');
	const ast = parse(s, { modern: true });
	walk(ast, (n) => {
		if (n.type !== 'Component' || n.name !== 'EditableField') return;
		const attrs = n.attributes.map((a) => s.slice(a.start, a.end)).join(' ');
		if (attrs.includes('kind="image"') || attrs.includes('richText={false}')) return;
		const snippet = n.fragment.nodes.find(
			(x) => x.type === 'SnippetBlock' && x.expression.name === 'children'
		);
		if (!snippet) return;
		const param = snippet.parameters[0]?.name;
		walk(snippet.body, (x, parents) => {
			if (!['ExpressionTag', 'HtmlTag'].includes(x.type) || parents.at(-1)?.type !== 'Fragment')
				return;
			const expr = s.slice(x.expression.start, x.expression.end);
			assert.ok(!new RegExp(`\\b${param}\\b`).test(expr), `${file}: raw editable text ${expr}`);
		});
		fields++;
	});
}
console.log(
	`Rich text: security, legacy compatibility, serialization and ${fields} editable fields passed.`
);
