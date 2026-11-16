import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { compile } from 'svelte/compiler';
import { render } from 'svelte/server';
import * as server from 'svelte/internal/server';
import ts from 'typescript';
import { error, fail, redirect } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';

const appearance = loadServerModule(
	new URL('../src/lib/site-settings/appearance.ts', import.meta.url),
	{}
);
const source = readFileSync(
	new URL('../src/lib/components/SiteAppearance.svelte', import.meta.url),
	'utf8'
);
const compiled = compile(source, { generate: 'server' }).js.code;
const output = ts.transpileModule(compiled, {
	compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;
const module = { exports: {} };
new Function('module', 'exports', 'require', output)(module, module.exports, (name) => {
	if (name === 'svelte/internal/server') return server;
	if (name === '$lib/site-settings/appearance') return appearance;
	throw new Error(`Unexpected dependency: ${name}`);
});
const Component = module.exports.default;
const colors = {
	primaryColor: '#253545',
	accentColor: '#713f55',
	surfaceColor: '#e5edf4',
	textColor: '#202b38',
	fontPreset: 'modern',
	radiusPreset: 'sharp'
};

function primaryPair(style) {
	return Object.fromEntries(style.split('; ').map((entry) => entry.split(': ').slice(0, 2)));
}

function assertPrimaryContrast(tokens, primary) {
	const accent = tokens['--ds-color-primary-accent'];
	const hover = tokens['--ds-color-primary-accent-hover'];
	const onAccent = tokens['--ds-color-on-primary-accent'];
	assert.ok(appearance.contrastRatio(primary, tokens['--ds-color-on-primary']) >= 4.5);
	for (const fill of [accent, hover]) {
		assert.ok(appearance.contrastRatio(primary, fill) >= 4.5, `${fill} against ${primary}`);
		assert.ok(appearance.contrastRatio(onAccent, fill) >= 4.5, `${onAccent} on ${fill}`);
	}
}

test('primary surfaces retain readable accents and button text for arbitrary owner palettes', () => {
	for (const primaryColor of ['#2c2c2c', '#ffffff', '#000000', '#777777', '#8b3f35']) {
		for (const accentColor of [
			'#595579',
			'#432dd7',
			'#8b3f35',
			'#ffffff',
			'#000000',
			primaryColor
		]) {
			const tokens = primaryPair(
				appearance.siteAppearanceStyle({ ...colors, primaryColor, accentColor })
			);
			assertPrimaryContrast(tokens, primaryColor);
			// Adapting a dark section must not change the site's selected accent elsewhere.
			assert.equal(tokens['--ds-color-accent'], accentColor);
		}
	}
	const tokens = primaryPair(
		appearance.siteAppearanceStyle({ ...colors, primaryColor: '#2c2c2c', accentColor: '#c4a87c' })
	);
	assert.equal(tokens['--ds-color-primary-accent'], '#c4a87c');
});

test('all built-in systems provide readable primary surface pairs without owner overrides', () => {
	for (const slug of ['base', 'apple', 'graphite', 'iris', 'ochre']) {
		const css = readFileSync(
			new URL(`../src/lib/design-systems/${slug}.css`, import.meta.url),
			'utf8'
		);
		const tokens = Object.fromEntries(
			Array.from(css.matchAll(/(--ds-color-[\w-]+):\s*(#[0-9a-f]{6});/g), (m) => [m[1], m[2]])
		);
		assertPrimaryContrast(tokens, tokens['--ds-color-primary']);
	}
});

test('the first server render includes root overrides, before hydration', () => {
	const { head } = render(Component, { props: { value: colors } });
	assert.match(head, /<style data-site-appearance>:root \{/);
	assert.match(head, /--ds-color-surface: #e5edf4 !important/);
	assert.match(head, /--color-surface: var\(--ds-color-surface\) !important/);
	assert.match(head, /--ds-font-heading: 'Inter'/);
	assert.match(head, /--ds-radius-xl: 6px !important/);
});

test('disabled or absent settings emit no overriding stylesheet', () => {
	for (const value of [undefined, null, false, '', []]) {
		assert.equal(appearance.siteAppearanceStylesheet(value), '');
		assert.doesNotMatch(render(Component, { props: { value } }).head, /<style/);
	}
});

test('separate page/site renders never share the preceding appearance', () => {
	const first = render(Component, { props: { value: colors } }).head;
	const other = render(Component, {
		props: { value: { ...colors, surfaceColor: '#fff4e5' } }
	}).head;
	const disabled = render(Component, { props: { value: null } }).head;
	assert.match(first, /#e5edf4/);
	assert.doesNotMatch(other, /#e5edf4/);
	assert.match(other, /#fff4e5/);
	assert.doesNotMatch(disabled, /#e5edf4|#fff4e5|<style/);
});

test('the scoped preview rebinds color/font/radius aliases at its own element', () => {
	const style = appearance.siteAppearanceStyle(colors);
	assert.match(style, /--color-surface: var\(--ds-color-surface\)/);
	assert.match(style, /--color-text-primary: var\(--ds-color-text-primary\)/);
	assert.match(style, /--font-heading: var\(--ds-font-heading\)/);
	assert.match(style, /--radius-xl: var\(--ds-radius-xl\)/);
	assert.doesNotMatch(style, /!important/);
});

test('untrusted values cannot close the style tag or add CSS declarations', () => {
	const attack = '</style><script>alert(1)</script>';
	const { head } = render(Component, {
		props: {
			value: {
				primaryColor: attack,
				accentColor: attack,
				surfaceColor: attack,
				textColor: attack,
				fontPreset: attack,
				radiusPreset: attack,
				extra: attack
			}
		}
	});
	assert.doesNotMatch(head, /<script>|alert\(1\)/);
	assert.match(head, /--ds-color-surface: #faf9f7 !important/);
	assert.equal((head.match(/<\/style>/g) ?? []).length, 1);
});

test('saving and disabling use the shared site header without changing another site', async () => {
	const license = {
		id: 'one',
		domain: 'one.test',
		templateId: 2,
		headerData: { phone: 'keep-me' }
	};
	const other = {
		id: 'two',
		domain: 'two.test',
		templateId: 2,
		headerData: { phone: 'other-site' }
	};
	const writes = [];
	const settings = loadServerModule(
		new URL('../src/routes/site-settings/+page.server.ts', import.meta.url),
		{
			'@sveltejs/kit': { error, fail, redirect },
			'$lib/server/admin-api': { adminAuthApi: async () => new Response(null, { status: 200 }) },
			'$lib/utils/graphql-client': {
				createGraphQLClient: () => ({
					request: async (query, variables) => {
						if (query.includes('mutation SaveSiteSettings')) {
							writes.push(variables);
							assert.equal(variables.id, license.id);
							license.headerData = variables.headerData;
							return { updateLicense: license };
						}
						if (query.includes('query SiteSettingsDesignSystems')) return { designSystems: [] };
						return { myLicenses: [license, other] };
					}
				})
			}
		}
	);
	const save = async (enabled, overrides = {}) => {
		const body = new FormData();
		body.set('designSystem', 'base');
		if (enabled) {
			body.set('appearanceEnabled', 'on');
			for (const [key, value] of Object.entries({ ...colors, ...overrides })) body.set(key, value);
		}
		return settings.actions.save({
			cookies: { get: () => 'valid-session' },
			url: new URL('https://one.test/site-settings'),
			request: new Request('https://one.test/site-settings', { method: 'POST', body })
		});
	};
	assert.equal((await save(true)).success, true);
	assert.deepEqual(license.headerData.siteAppearance, colors);
	assert.equal(license.headerData.phone, 'keep-me');
	assert.match(
		render(Component, { props: { value: license.headerData.siteAppearance } }).head,
		/#e5edf4/
	);
	for (const surfaceColor of ['#101010', '#oops']) {
		const invalid = await save(true, { surfaceColor });
		assert.equal(invalid.status, 400);
		assert.equal(invalid.data.values.surfaceColor, surfaceColor);
		assert.equal(invalid.data.values.primaryColor, colors.primaryColor);
		assert.equal(invalid.data.values.appearanceEnabled, true);
		assert.ok(invalid.data.errors.surfaceColor);
		assert.equal(writes.length, 1);
		assert.deepEqual(license.headerData.siteAppearance, colors);
	}
	assert.equal((await save(false)).success, true);
	assert.equal(license.headerData.siteAppearance, null);
	assert.doesNotMatch(
		render(Component, { props: { value: license.headerData.siteAppearance } }).head,
		/<style/
	);
	assert.equal(license.headerData.phone, 'keep-me');
	assert.deepEqual(other.headerData, { phone: 'other-site' });
	assert.equal(writes.length, 2);
});
