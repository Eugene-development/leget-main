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
assert.equal(calls[1].url, '/forms/service-request');
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

// A tenant's edited heading must be captured at submit time, not frozen on component mount.
const { formHeading } = await import(
	`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
class HeadingElement {
	constructor(text = '', parent = null) {
		this.text = text;
		this.parentElement = parent;
	}
	querySelector() {
		return this.text ? { textContent: this.text } : null;
	}
}
globalThis.HTMLElement = HeadingElement;
globalThis.document = { body: new HeadingElement() };
const section = new HeadingElement('  Закажите\n кухню мечты  ', document.body);
const form = new HeadingElement('', section);
assert.equal(formHeading({ currentTarget: form }), 'Закажите кухню мечты');
section.text = 'Обновлённый заголовок';
assert.equal(formHeading({ currentTarget: form }), 'Обновлённый заголовок');
assert.equal(formHeading(), undefined);
let capturedTitle;
globalThis.fetch = async (_url, options) => {
	capturedTitle = options.body.get('form_title');
	return new Response(
		JSON.stringify({ success: true, id: 'title-test', status: 'new', mail_status: 'sent' })
	);
};
await createFormSender('heading-test')({ service_type: 'contact' }, 'service-request', {
	currentTarget: form
});
assert.equal(capturedTitle, 'Обновлённый заголовок');
console.log('PASS: current visible form heading is included in the submission.');

// Only bounded advertising fields are captured. The snapshot must stay stable
// when a tracking cookie appears between a lost response and its HTTP retry.
const { formAttribution } = await import(
	`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
globalThis.window = {
	location: {
		href: 'https://tenant.example/calculator?utm_source=last&yclid=123',
		pathname: '/calculator'
	}
};
document.cookie = `leget_attr=${encodeURIComponent(JSON.stringify({ first: { utm_source: 'first', utm_medium: 'cpc', utm_campaign: 'x'.repeat(150), yclid: '123', phone: 'private' } }))}; _ym_uid=456`;
assert.deepEqual(formAttribution(), {
	utm_source: 'first',
	utm_medium: 'cpc',
	utm_campaign: 'x'.repeat(120),
	yclid: '123',
	metrika_client_id: '456'
});
const attributionCalls = [];
let attributionLost = true;
globalThis.fetch = async (_url, options) => {
	attributionCalls.push({
		key: options.body.get('submission_key'),
		attribution: options.body.get('attribution')
	});
	if (attributionLost) throw new Error('response lost');
	return new Response(
		JSON.stringify({ success: true, id: 'attribution-test', status: 'new', mail_status: 'sent' })
	);
};
const sendAttributed = createFormSender('attribution-test');
await assert.rejects(sendAttributed(payload));
document.cookie = '_ym_uid=789';
attributionLost = false;
await sendAttributed(payload);
assert.equal(attributionCalls[0].key, attributionCalls[1].key);
assert.equal(attributionCalls[0].attribution, attributionCalls[1].attribution);
window.location = {
	href: 'https://tenant.example/reset-password?token=secret&email=private',
	pathname: '/reset-password'
};
assert.deepEqual(formAttribution(), {});
console.log(
	'PASS: bounded attribution, no private fields, stable retry snapshot, recovery exclusion.'
);

const estimateCalls = [];
const staleSender = createFormSender('kitchen-estimate');
globalThis.fetch = async (_url, options) => {
	estimateCalls.push(options.body.get('submission_key'));
	return new Response(
		JSON.stringify({ success: false, errors: { estimate_version: ['Server-only diagnostic'] } }),
		{ status: 422 }
	);
};
await assert.rejects(
	staleSender({ service_type: 'kitchen-estimate', estimate_version: 'old' }),
	(error) => {
		assert.equal(error.code, 'estimate_stale');
		assert.equal(error.message, 'Правила расчёта изменились. Рассчитайте стоимость ещё раз.');
		assert.equal('errors' in error, false);
		return true;
	}
);
globalThis.fetch = async (_url, options) => {
	estimateCalls.push(options.body.get('submission_key'));
	return new Response(
		JSON.stringify({ success: true, id: 'fresh-estimate', status: 'new', mail_status: 'pending' }),
		{ status: 202 }
	);
};
await staleSender({ service_type: 'kitchen-estimate', estimate_version: 'fresh' });
assert.notEqual(estimateCalls[0], estimateCalls[1], 'recalculated version gets a fresh key');
console.log('PASS: safe stale-estimate code, recalculated retry uses new version/key.');
