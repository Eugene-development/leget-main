import assert from 'node:assert/strict';
import { error, fail, redirect } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';
const { createLeadCatcherGate, isTopExit, leadCatcherPolicy, supportsLeadCatcher } =
	loadServerModule(new URL('../src/lib/utils/lead-catcher.ts', import.meta.url), {});
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
const top = { clientX: 100, clientY: 0, buttons: 0 };
const exits = (event = top, previousY = 100) => isTopExit(event, previousY, 1200);
assert.equal(exits(), true);
assert.equal(exits({ ...top, clientY: -1 }), true);
assert.equal(exits({ ...top, clientY: 300 }), false);
assert.equal(exits({ ...top, clientX: 0 }), false);
assert.equal(exits({ ...top, clientX: 1200 }), false);
assert.equal(exits({ ...top, buttons: 1 }), false);
assert.equal(exits(top, null), false);
assert.equal(exits(top, 0), false);
assert.equal(leadCatcherPolicy('/privacy'), '/privacy');
for (const url of ['javascript:alert(1)', '//other.test', '/\\other.test', '', undefined])
	assert.equal(leadCatcherPolicy(url), '');
console.log(
	'PASS: delay, top exit, cooldown, remounts, tenants, other tabs, blocked storage, policy paths.'
);

const makeLicense = (templateId) => ({
	id: String(templateId),
	domain: `site-${templateId}.test`,
	templateId,
	headerData: { phone: 'keep' }
});
const licenses = [1, 2, 3, 0].map(makeLicense);
licenses[0].headerData = {
	...licenses[0].headerData,
	leadCatcherEnabled: true,
	leadCatcherPolicyHref: '/custom-privacy'
};
const settings = loadServerModule(
	new URL('../src/routes/site-settings/+page.server.ts', import.meta.url),
	{
		'@sveltejs/kit': { error, fail, redirect },
		'$lib/server/admin-api': { adminAuthApi: async () => new Response(null, { status: 200 }) },
		'$lib/utils/graphql-client': {
			createGraphQLClient: () => ({
				request: async (query, variables) => {
					if (query.includes('mutation SaveSiteSettings')) {
						const license = licenses.find(({ id }) => id === variables.id);
						license.headerData = variables.headerData;
						return { updateLicense: license };
					}
					if (query.includes('SiteSettingsDesignSystems')) return { designSystems: [] };
					return { myLicenses: licenses };
				}
			})
		}
	}
);

function siteEvent(license) {
	return {
		cookies: { get: () => 'session' },
		url: new URL(`https://${license.domain}/site-settings`)
	};
}

async function save(license, fields) {
	const event = siteEvent(license);
	const body = new FormData();
	body.set('designSystem', 'base');
	for (const [key, value] of Object.entries(fields)) body.set(key, value);
	return settings.actions.save({
		...event,
		request: new Request(event.url, { method: 'POST', body })
	});
}

const fields = { leadCatcherSettings: '1', leadCatcherEnabled: 'on' };
for (const license of licenses.slice(0, 3)) {
	const otherSites = licenses
		.filter((site) => site !== license)
		.map((site) => [site, site.headerData]);
	const read = async () => (await settings.load(siteEvent(license))).site;
	assert.equal(supportsLeadCatcher(license.templateId), true);
	assert.equal((await read()).leadCatcherAvailable, true);
	assert.equal((await read()).leadCatcherEnabled, license.templateId === 1);
	if (license.templateId === 1) {
		assert.equal((await read()).leadCatcherPolicyHref, '/custom-privacy');
		assert.equal((await save(license, {})).success, true);
		assert.equal(license.headerData.leadCatcherPolicyHref, '/custom-privacy');
	}
	assert.equal(
		(await save(license, { ...fields, leadCatcherPolicyHref: '//elsewhere.test' })).status,
		400
	);
	assert.equal((await save(license, fields)).success, true);
	assert.equal((await read()).leadCatcherEnabled, true);
	assert.equal((await read()).leadCatcherPolicyHref, '/privacy');
	assert.equal((await save(license, { leadCatcherSettings: '1' })).success, true);
	assert.equal((await read()).leadCatcherEnabled, false);
	assert.equal(license.headerData.phone, 'keep');
	for (const [site, previous] of otherSites) assert.equal(site.headerData, previous);
}
const unsupported = licenses.at(-1);
assert.equal((await settings.load(siteEvent(unsupported))).site.leadCatcherAvailable, false);
assert.equal((await save(unsupported, fields)).success, true);
assert.equal(Object.hasOwn(unsupported.headerData, 'leadCatcherEnabled'), false);
console.log('PASS: settings persist on all three Promo templates, with license isolation.');
