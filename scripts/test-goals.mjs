import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const registry = JSON.parse(
	readFileSync(new URL('../src/lib/yandex-direct/button-goals.json', import.meta.url))
);
const source = readFileSync(
	new URL('../src/lib/yandex-direct/tracking.ts', import.meta.url),
	'utf8'
).replace(
	"import buttonGoals from './button-goals.json';",
	`const buttonGoals = ${JSON.stringify(registry)};`
);
const { outputText } = ts.transpileModule(source, {
	compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
});
const { installGoalTracking, templateGoalName } = await import(
	`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
);
class TestElement {
	constructor(goal, parent = null) {
		this.dataset = goal ? { metrikaGoal: goal } : {};
		this.parent = parent;
	}
	closest(selector) {
		if (selector === '[inert]') return this.inert || this.parent?.closest(selector);
		return this.dataset.metrikaGoal ? this : this.parent?.closest(selector);
	}
	matches() {
		return this.disabled ?? false;
	}
}
globalThis.Element = TestElement;
const listeners = new Set();
const doc = {
	addEventListener: (type, fn, capture) => {
		assert.equal(type, 'click');
		assert.equal(capture, true);
		listeners.add(fn);
	},
	removeEventListener: (_type, fn) => listeners.delete(fn)
};
let config = { counterId: '123', template: 'Promo-1', enabled: true };
const calls = [];
const remove = installGoalTracking(
	doc,
	() => config,
	(...args) => calls.push(args)
);
const shared = registry.find(
	(goal) => goal.templates.includes('Promo-2') && goal.templates.includes('Promo-1')
);
const button = new TestElement(shared.id);
const svg = new TestElement(null, button);
const click = (target = svg) => [...listeners].forEach((listener) => listener({ target }));
click();
assert.deepEqual(calls.pop(), [123, 'reachGoal', templateGoalName('Promo-1', shared.id)]);
config = { ...config, counterId: '456', template: 'Promo-2' };
click();
assert.deepEqual(calls.pop(), [456, 'reachGoal', templateGoalName('Promo-2', shared.id)]);
button.disabled = true;
click();
button.disabled = false;
button.inert = true;
click();
button.inert = false;
config.enabled = false;
click();
config.enabled = true;
config.counterId = null;
click();
config.counterId = '123';
click(new TestElement('unregistered'));
click(
	new TestElement(
		registry.find((goal) => goal.templates.length === 1 && goal.templates[0] === 'Promo-1').id
	)
);
click(null);
assert.equal(calls.length, 0);
remove();
click();
assert.equal(calls.length, 0);
assert.equal(listeners.size, 0);
const removeThrowing = installGoalTracking(
	doc,
	() => config,
	() => {
		throw new Error('blocked analytics');
	}
);
assert.doesNotThrow(() => click());
removeThrowing();
const ids = registry.flatMap((goal) =>
	goal.templates.map((template) => templateGoalName(template, goal.id))
);
assert.equal(new Set(ids).size, ids.length);
assert.ok(ids.every((id) => /^[a-z0-9_]+$/.test(id) && id.length < 255));
console.log(
	'PASS: nested targets, template/counter switching, disabled/inert/editor/no-counter, unknown/wrong-template goals, cleanup, exception isolation, unique IDs.'
);
