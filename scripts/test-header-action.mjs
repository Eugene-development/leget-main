import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { error, fail, redirect } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';
const button = loadServerModule(
	new URL('../src/lib/site-settings/header-button.ts', import.meta.url),
	{}
);
const engine = loadServerModule(
	new URL('../src/lib/design-systems/contrast.ts', import.meta.url),
	{}
);
function verify(palette) {
	const on = palette['--ds-header-action-on'];
	assert.equal(on, '#ffffff');
	assert.ok(engine.contrast(palette['--ds-header-action-outline'], '#ffffff') >= 3);
	for (const prefix of ['', 'hover-']) {
		const stops = ['start', 'mid', 'end'].map((s) => palette[`--ds-header-action-${prefix}${s}`]);
		for (let segment = 0; segment < 2; segment++)
			for (let n = 0; n <= 100; n++)
				assert.ok(
					engine.contrast(on, engine.blend(stops[segment], stops[segment + 1], n / 100)) >= 4.5
				);
	}
}
test('custom gradients retain readable text across stops, interpolation and hover', () => {
	for (const color of ['#b8860b', '#ffffff', '#000000', '#777777', '#ff00ff', '#0069a8', '#fafa99'])
		verify(
			Object.fromEntries(
				Object.entries(button.headerButtonPalette(color)).map(([k, v]) => [
					'--ds-header-action-' + k,
					v
				])
			)
		);
	assert.equal(button.headerButtonStyle('</style><script>'), '');
	assert.equal(button.normalizeHeaderButtonColor(' #AaBBcc '), '#aabbcc');
});
test('five systems own independent gradient defaults; the base default is gold', () => {
	for (const slug of ['base', 'graphite', 'ochre', 'iris', 'apple']) {
		const css = readFileSync(
			new URL(`../src/lib/design-systems/${slug}.css`, import.meta.url),
			'utf8'
		);
		const palette = Object.fromEntries(
			[...css.matchAll(/(--ds-header-action-[\w-]+):\s*(#[0-9a-f]{6});/g)].map((m) => [m[1], m[2]])
		);
		verify(palette);
		if (slug === 'base') assert.equal(palette['--ds-header-action-shadow'], '#b8860b');
	}
	const appearance = loadServerModule(
		new URL('../src/lib/site-settings/appearance.ts', import.meta.url),
		{}
	);
	assert.doesNotMatch(
		appearance.siteAppearanceStyle({ accentColor: '#00ff00' }),
		/--ds-header-action-/
	);
});
test('button colors save independently, reset to system defaults and preserve license isolation', async () => {
	const license = {
		id: 'one',
		domain: 'one.test',
		templateId: 2,
		headerData: { phone: 'keep', headerButtonColor: '#334455' }
	};
	const other = {
		id: 'two',
		domain: 'two.test',
		templateId: 2,
		headerData: { headerButtonColor: '#ff0000' }
	};
	let writes = 0,
		throwWrite = false;
	const settings = loadServerModule(
		new URL('../src/routes/site-settings/+page.server.ts', import.meta.url),
		{
			'@sveltejs/kit': { error, fail, redirect },
			'$lib/server/admin-api': { adminAuthApi: async () => new Response(null, { status: 200 }) },
			'$lib/utils/graphql-client': {
				createGraphQLClient: () => ({
					request: async (query, variables) => {
						if (query.includes('mutation SaveSiteSettings')) {
							if (throwWrite) throw Error('unavailable');
							writes++;
							assert.equal(variables.id, 'one');
							license.headerData = variables.headerData;
							return { updateLicense: license };
						}
						if (query.includes('SiteSettingsDesignSystems')) return { designSystems: [] };
						return { myLicenses: [license, other] };
					}
				})
			}
		}
	);
	const save = async (fields = {}) => {
		const body = new FormData();
		body.set('designSystem', 'base');
		for (const [k, v] of Object.entries(fields)) body.set(k, v);
		return settings.actions.save({
			cookies: { get: () => 'session' },
			url: new URL('https://one.test/site-settings'),
			request: new Request('https://one.test/site-settings', { method: 'POST', body })
		});
	};
	assert.equal((await save()).success, true);
	assert.equal(license.headerData.headerButtonColor, '#334455');
	const invalid = await save({
		headerButtonSettings: '1',
		headerButtonCustom: 'on',
		headerButtonColor: '#oops'
	});
	assert.equal(invalid.status, 400);
	assert.equal(invalid.data.values.headerButtonColor, '#oops');
	assert.ok(invalid.data.errors.headerButtonColor);
	assert.equal(writes, 1);
	assert.equal(
		(
			await save({
				headerButtonSettings: '1',
				headerButtonCustom: 'on',
				headerButtonColor: '#123456'
			})
		).success,
		true
	);
	assert.equal(license.headerData.headerButtonColor, '#123456');
	assert.equal(license.headerData.siteAppearance, null);
	assert.equal(license.headerData.phone, 'keep');
	assert.equal(other.headerData.headerButtonColor, '#ff0000');
	const loaded = await settings.load({
		cookies: { get: () => 'session' },
		url: new URL('https://one.test/site-settings')
	});
	assert.equal(loaded.site.headerButtonColor, '#123456');
	throwWrite = true;
	const failed = await save({
		headerButtonSettings: '1',
		headerButtonCustom: 'on',
		headerButtonColor: '#abcdef'
	});
	assert.equal(failed.status, 502);
	assert.equal(failed.data.values.headerButtonColor, '#abcdef');
	assert.equal(license.headerData.headerButtonColor, '#123456');
	throwWrite = false;
	assert.equal((await save({ headerButtonSettings: '1' })).success, true);
	assert.equal(license.headerData.headerButtonColor, null);
});
