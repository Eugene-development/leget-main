import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(
	new URL('../src/lib/utils/form-submission.ts', import.meta.url),
	'utf8'
).replace(
	"import { getAuthApiUrl } from '$lib/utils/config';",
	"const getAuthApiUrl = () => 'https://auth.example/api';"
);
const { outputText } = ts.transpileModule(source, {
	compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
});
const { createFormSender } = await import(
	`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
const send = createFormSender('test-form');
const calls = [];
let fail = true;
globalThis.fetch = async (url, options) => {
	calls.push({
		url,
		key: options.body.get('submission_key'),
		form: options.body.get('form_id'),
		type: options.body.get('service_type')
	});
	if (fail) throw new Error('network lost');
	return new Response(
		JSON.stringify({ success: true, id: 'test-id', status: 'new', mail_status: 'pending' }),
		{ status: 202 }
	);
};
const payload = { service_type: 'consultation', name: 'TEST', phone: '+79990000000' };
await assert.rejects(send(payload));
fail = false;
const results = await Promise.all([send(payload), send(payload)]);
assert.equal(calls.length, 2, 'double click must share a request');
assert.equal(calls[0].key, calls[1].key, 'retry must retain idempotency key');
assert.equal(results[0].mail_status, 'pending');
assert.equal(calls[1].form, 'test-form');
assert.equal(calls[1].url, 'https://auth.example/api/notify/service-request');
await send(payload);
assert.notEqual(calls[2].key, calls[1].key, 'new accepted submission gets a fresh key');
fail = true;
await assert.rejects(send(payload));
await assert.rejects(send({ ...payload, phone: '+79990000001' }));
assert.notEqual(calls[3].key, calls[4].key);
globalThis.fetch = async () => new Response(JSON.stringify({ success: true }), { status: 200 });
await assert.rejects(send(payload), 'success without database id is not acceptance');
console.log(
	'PASS: single request, double click, network retry, changed data, accepted-pending response, required database receipt.'
);
