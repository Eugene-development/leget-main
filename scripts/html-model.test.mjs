import test from 'node:test';
import assert from 'node:assert/strict';
import { isolatedModelDocument, readHtmlModel, HTML_MODEL_LIMIT } from '../src/lib/components/templates/Promo-1/pages/mebel/html-model-document.ts';

test('the restrictive CSP is inserted before any supplied HTML and preserves the viewer', () => {
	const source = '<html><head><meta http-equiv="Content-Security-Policy" content="default-src *"></head><script>renderKitchen()</script></html>';
	const doc = isolatedModelDocument(source);
	assert.ok(doc.indexOf("default-src 'none'") < doc.indexOf(source));
	assert.ok(doc.includes("connect-src 'none'"));
	assert.ok(doc.includes("frame-src 'none'"));
	assert.ok(doc.endsWith(source));
});
test('reader rejects HTTP failures, non-HTML and oversized streams without Content-Length', async () => {
	await assert.rejects(readHtmlModel(new Response('not found', {status:404})));
	await assert.rejects(readHtmlModel(new Response('not a document')));
	await assert.rejects(readHtmlModel(new Response('<html>' + 'x'.repeat(HTML_MODEL_LIMIT))));
	const source = '<!doctype html><html lang="ru">Кухня</html>';
	assert.equal(await readHtmlModel(new Response(source)),source);
});
