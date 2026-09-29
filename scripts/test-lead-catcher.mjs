import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/utils/lead-catcher.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
	compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
});
const { createLeadCatcherGate, isTopExit, leadCatcherPolicy } = await import(
	`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
let clock = 100_000;
const entries = new Map();
const storage = {
	getItem: (key) => entries.get(key) ?? null,
	setItem: (key, value) => entries.set(key, value)
};
const gate = createLeadCatcherGate('tenant.test', storage, () => clock);
assert.equal(gate.claim(), false);
clock += 14_999;
assert.equal(gate.claim(), false);
clock++;
assert.equal(gate.claim(), true);
assert.equal(
	createLeadCatcherGate('tenant.test', storage, () => clock).claim(),
	false,
	'route remount keeps cooldown'
);
clock += 86_400_000;
assert.equal(gate.claim(), true);
const elsewhere = createLeadCatcherGate('other.test', storage, () => clock);
clock += 15_000;
assert.equal(elsewhere.claim(), true, 'tenant isolation');
const tab = createLeadCatcherGate('new-tab.test', storage, () => clock);
clock += 15_000;
storage.setItem('leget:lead-catcher:new-tab.test:shown-at', String(clock));
assert.equal(tab.claim(), false, 'reread timestamp written in another tab');
const unavailable = {
	getItem() {
		throw Error('blocked');
	},
	setItem() {
		throw Error('blocked');
	}
};
const fallback = createLeadCatcherGate('private.test', unavailable, () => clock);
clock += 15_000;
assert.equal(fallback.claim(), true);
clock += 86_400_000;
assert.equal(
	createLeadCatcherGate('private.test', unavailable, () => clock).claim(),
	false,
	'storage failure allows only one per app session'
);
assert.equal(isTopExit({ relatedTarget: null, clientY: 0 }, 100), true);
assert.equal(isTopExit({ relatedTarget: null, clientY: 300 }, 100), false);
assert.equal(isTopExit({ relatedTarget: {}, clientY: 0 }, 100), false);
assert.equal(isTopExit({ relatedTarget: null, clientY: 0 }, null), false);
assert.equal(leadCatcherPolicy('/privacy'), '/privacy');
for (const url of ['javascript:alert(1)', '//other.test', '/\\other.test', '', undefined])
	assert.equal(leadCatcherPolicy(url), '');
console.log(
	'PASS: delay, top exit, cooldown, remounts, tenants, other tabs, blocked storage, policy paths.'
);
