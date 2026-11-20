import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { loadServerModule } from './test-server-module.mjs';
const engine = loadServerModule(
	new URL('../src/lib/design-systems/contrast.ts', import.meta.url),
	{}
);
const appearance = loadServerModule(
	new URL('../src/lib/site-settings/appearance.ts', import.meta.url),
	{}
);
function assertPalette(background, seed) {
	const p = engine.surfacePalette(background, seed);
	assert.equal(p.on, p['on-hover']);
	assert.equal(p.on, p['on-active']);
	assert.ok(engine.contrast(p.text, background) >= 4.5, `label ${p.text} on ${background}`);
	for (const state of ['fill', 'hover', 'active']) {
		const foreground = state === 'fill' ? p.on : p[`on-${state}`];
		assert.ok(
			engine.contrast(p[state], background) >= 3,
			`${state} ${p[state]} against ${background}`
		);
		assert.ok(engine.contrast(foreground, p[state]) >= 4.5, `text on ${state}`);
	}
	return p;
}
test('text and filled controls have separate contrast targets on arbitrary surfaces', () => {
	for (const background of [
		'#ffffff',
		'#faf9f7',
		'#000000',
		'#2c2c2c',
		'#777777',
		'#823513',
		'#e9ebee'
	]) {
		for (const seed of [
			'#ffffcc',
			'#595579',
			'#432dd7',
			'#000000',
			'#ffffff',
			'#8b3f35',
			background
		])
			assertPalette(background, seed);
	}
	assert.notEqual(assertPalette('#ffffff', '#ffffcc').fill, '#ffffcc');
	assert.equal(assertPalette('#2c2c2c', '#ffffcc').fill, '#ffffcc');
});
test('every built-in surface and category seed has an accessible generated palette', () => {
	for (const slug of ['base', 'apple', 'graphite', 'iris', 'ochre']) {
		const css = readFileSync(
			new URL(`../src/lib/design-systems/${slug}.css`, import.meta.url),
			'utf8'
		);
		const source = css.split('/* GENERATED CONTRAST PALETTES:')[0].replace(/\/\*[\s\S]*?\*\//g, '');
		const tokens = Object.fromEntries(
			[...source.matchAll(/(--ds-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
		);
		for (const [surface, name] of Object.entries(engine.SURFACES)) {
			const backdrop = engine.resolveColor(
				surface.startsWith('dark') ? '--ds-dark-surface' : '--ds-color-surface',
				tokens
			);
			const background = engine.resolveColor(name, tokens, backdrop);
			for (const seed of Object.values(engine.SEEDS))
				assertPalette(background, engine.resolveColor(seed, tokens));
		}
	}
});
test('light owner accents produce independent light, dark and nested-card variants in SSR', () => {
	const style = appearance.siteAppearanceStyle({
		accentColor: '#ffffcc',
		primaryColor: '#2c2c2c',
		surfaceColor: '#faf9f7',
		textColor: '#1a1a1a'
	});
	const tokens = Object.fromEntries(style.split('; ').map((v) => v.split(': ')));
	assert.equal(tokens['--ds-color-accent'], '#ffffcc');
	assert.notEqual(
		tokens['--ds-contrast-light-accent-fill'],
		tokens['--ds-contrast-dark-accent-fill']
	);
	assert.equal(
		tokens['--ds-contrast-light-card-accent-fill'],
		tokens['--ds-contrast-light-accent-fill']
	);
	assert.notEqual(
		tokens['--ds-contrast-dark-card-accent-fill'],
		tokens['--ds-contrast-light-card-accent-fill']
	);
	assert.notEqual(appearance.siteAppearanceStyle({ accentColor: '#595579' }), style);
	assert.equal(appearance.siteAppearanceStyle(null), '');
});
test('theme changes update immediately, persist, and roll back on failed saves', async () => {
	let data = { theme: 'light' },
		fail = false;
	const writes = [];
	const { createThemeToggle } = loadServerModule(
		new URL('../src/lib/utils/block-theme.ts', import.meta.url),
		{
			'$lib/utils/page-edit': {
				saveComponentData: async (_ctx, _type, next) => {
					writes.push(next.theme);
					if (fail) throw new Error('save failed');
				}
			}
		}
	);
	const toggle = createThemeToggle({
		type: 'Example',
		getData: () => data,
		setData: (next) => {
			data = next;
		},
		getContext: () => ({ licenseId: 'one' })
	});
	const pending = toggle();
	assert.equal(data.theme, 'dark');
	await pending;
	assert.deepEqual(writes, ['dark']);
	fail = true;
	const previous = console.error;
	console.error = () => {};
	try {
		const pending = toggle();
		assert.equal(data.theme, 'light');
		await pending;
		assert.equal(data.theme, 'dark');
	} finally {
		console.error = previous;
	}
});

test('category colors retain the selected system identity and unknown systems fall back safely', () => {
	const value = { accentColor: '#ffffcc' };
	const base = appearance.siteAppearanceStyle(value, 'base');
	const iris = appearance.siteAppearanceStyle(value, 'iris');
	assert.doesNotMatch(base, /--ds-cat-1-500:/);
	assert.notEqual(base, iris);
	assert.equal(appearance.siteAppearanceStyle(value, '__proto__'), base);
});

test('raised, overlay and field surfaces remain distinct from the page canvas', () => {
	const style = appearance.siteAppearanceStyle({
		primaryColor: '#222222',
		surfaceColor: '#faf9f7',
		textColor: '#1a1a1a',
		accentColor: '#eedd99'
	});
	const values = Object.fromEntries(style.split('; ').map((v) => v.split(': ')));
	assert.equal(values['--ds-contrast-raised-copy'], '#000000');
	assert.equal(values['--ds-contrast-dark-overlay-copy'], '#ffffff');
	assert.equal(values['--ds-contrast-dark-field-copy'], '#ffffff');
	for (const slot of ['dark-overlay', 'dark-field', 'raised', 'ink-100', 'ink-900']) {
		assert.match(values[`--ds-contrast-${slot}-accent-surface-on`], /^#[0-9a-f]{6}$/);
	}
});

test('gradient copy and controls contrast across every stop and interpolated point', () => {
	const { GRADIENT_SURFACES } = loadServerModule(
		new URL('../src/lib/design-systems/gradient-surfaces.ts', import.meta.url),
		{}
	);
	for (const slug of ['base', 'apple', 'ochre', 'graphite', 'iris']) {
		const source = readFileSync(
			new URL(`../src/lib/design-systems/${slug}.css`, import.meta.url),
			'utf8'
		)
			.split('/* GENERATED')[0]
			.replace(/\/\*[\s\S]*?\*\//g, '');
		const tokens = Object.fromEntries(
			[...source.matchAll(/(--ds-[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])
		);
		for (const recipe of Object.values(GRADIENT_SURFACES)) {
			const colors = recipe.map((name) => engine.resolveColor(engine.gradientToken(name), tokens));
			for (const dark of [false, true]) {
				const p = engine.gradientPalette(colors, dark);
				if (dark) assert.equal(p.copy, '#ffffff');
				for (const [a, b] of [
					[p.start, p.via],
					[p.via, p.end]
				])
					for (let step = 0; step <= 100; step++) {
						const background = engine.blend(a, b, step / 100);
						assert.ok(engine.contrast(p.copy, background) >= 4.5, `gradient text ${slug} ${recipe}`);
						for (const state of ['fill', 'hover', 'active']) {
							assert.ok(engine.contrast(p[state], background) >= 3);
							assert.ok(engine.contrast(p[state], p.on) >= 4.5);
						}
					}
			}
		}
	}
	for (const stops of [
		['#ff2828', '#b90008'],
		['#ffffff', '#000000'],
		['#eeee99', '#484526']
	]) {
		const p = engine.gradientPalette(stops);
		for (const fill of [p.start, p.via, p.end]) assert.ok(engine.contrast(p.copy, fill) >= 4.5);
	}
});

test('hover surfaces reset inherited copy for both direct and grouped background changes', () => {
	const css = readFileSync(
		new URL('../src/lib/styles/surface-contrast.css', import.meta.url),
		'utf8'
	);
	const rules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
	for (const [name, surface] of [
		['primary', 'primary'],
		['secondary', 'secondary'],
		['surface-warm', 'warm'],
		['cat-2-500', 'cat-2-500']
	]) {
		const rule = rules.find(
			(r) => r[1].includes(`.hover\\:bg-${name}:`) && r[1].includes(`.group-hover\\:bg-${name}`)
		);
		assert.ok(rule, `missing hover surface adapter for ${name}`);
		assert.ok(rule[2].includes(`--ds-copy: var(--ds-contrast-${surface}-copy)`));
		for (const seed of Object.keys(engine.SEEDS))
			assert.ok(
				rule[2].includes(`--ds-c-${seed}-text: var(--ds-contrast-${surface}-${seed}-text)`),
				`${name}: nested ${seed} text retained the outer surface`
			);
	}
});

test('Promo-1 badges and buttons pair light hover copy with a shade of their own accent', () => {
	const css = readFileSync(
		new URL('../src/lib/styles/surface-contrast.css', import.meta.url),
		'utf8'
	);
	const rules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
	for (const name of [
		'brand-500',
		'link-400',
		'link-500',
		'cat-1-500',
		'cat-2-500',
		'cat-3-500',
		'cat-6-500',
		'cat-8-500'
	]) {
		const rule = rules.find(
			([, selector]) =>
				selector.includes(`.p1-hover-on-dark.hover\\:bg-${name}:`) &&
				selector.includes(`.p1-hover-on-dark.group-hover\\:bg-${name}`)
		);
		assert.ok(rule, `missing light hover copy for ${name}`);
		const seed = name.slice(0, -4);
		assert.ok(
			rule[2].includes(`background-color: var(--ds-contrast-white-${seed}-text) !important`)
		);
		assert.ok(rule[2].includes('color: var(--ds-contrast-black-copy) !important'));
	}
});

test('quiet controls propagate their foreground without adding a border', () => {
	const css = readFileSync(
		new URL('../src/lib/styles/surface-contrast.css', import.meta.url),
		'utf8'
	);
	const rules = [...css.matchAll(/([^{}]+)\{([^{}]+)\}/g)];
	for (const name of ['white', 'surface-card', 'on-dark']) {
		const base = rules.find(
			(r) =>
				r[1].includes(`:is(.bg-${name}):not(.ds-action)`) &&
				!r[1].includes(':hover') &&
				r[2].includes('background:')
		);
		const hover = rules.find(
			(r) =>
				r[1].includes(`:is(.bg-${name}):not(.ds-action)`) &&
				r[1].includes(':hover') &&
				r[2].includes('background:')
		);
		assert.ok(base && hover, `missing quiet control pair: ${name}`);
		assert.doesNotMatch(base[2], /(?:^|[;\n])\s*border\s*:/);
		for (const seed of Object.keys(engine.SEEDS))
			assert.ok(
				hover[2].includes(`--ds-c-${seed}-text: var(--ds-c-accent-on-hover)`),
				`${name}: nested ${seed} text did not follow hover`
			);
	}
});
