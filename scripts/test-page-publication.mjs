import assert from 'node:assert/strict';
import { test } from 'node:test';
import { get, writable } from 'svelte/store';
import { loadServerModule } from './test-server-module.mjs';

const context = { licenseId: 'site-one', pageId: 'slug:/test', slug: '/test' };
const response = (value, status = 200) => ({ ok: status < 400, status, json: async () => value });

test('draft inline writes serialize against the latest version and stay on tenant endpoints', async () => {
	const oldWindow = globalThis.window;
	const oldFetch = globalThis.fetch;
	globalThis.window = { location: { href: `https://site.test/test?draft=${'a'.repeat(64)}` } };
	const drafts = loadServerModule(new URL('../src/lib/growth/drafts.ts', import.meta.url), {
		'svelte/store': { get, writable },
		'$lib/utils/auth-session': { getAuthToken: () => 'editor-session' },
		'$lib/utils/config': { getGraphQLUrl: () => 'https://api.test/graphql' }
	});
	drafts.draftSession.set({
		licenseId: context.licenseId,
		draft: { id: 'draft-one', slug: '/test', version: 1 }
	});
	let release;
	const firstWrite = new Promise((resolve) => {
		release = resolve;
	});
	const calls = [];
	globalThis.fetch = async (url, options) => {
		const body = JSON.parse(options.body);
		calls.push({ url, options, body });
		if (calls.length === 1) await firstWrite;
		return response({ id: 'draft-one', slug: '/test', version: body.version + 1 });
	};
	try {
		const first = drafts.saveDraftOperation(context, {
			kind: 'component',
			type: 'Hero',
			data: { title: 'One' }
		});
		const second = drafts.saveDraftOperation(context, {
			kind: 'layout',
			type: 'Header',
			data: { phone: 'Two' }
		});
		await new Promise((resolve) => setImmediate(resolve));
		assert.equal(calls.length, 1);
		release();
		await Promise.all([first, second]);
		assert.deepEqual(
			calls.map((call) => call.body.version),
			[1, 2]
		);
		assert.equal(get(drafts.draftSession).draft.version, 3);
		assert.ok(
			calls.every(
				(call) => call.url === 'https://api.test/growth/sites/site-one/publication/drafts/draft-one'
			)
		);
		assert.equal(calls[0].options.headers.Authorization, 'Bearer editor-session');
		assert.equal(get(drafts.draftSaving), false);
	} finally {
		globalThis.window = oldWindow;
		globalThis.fetch = oldFetch;
	}
});

test('draft URLs fail closed before owner state loads and for another tenant', () => {
	const oldWindow = globalThis.window;
	globalThis.window = { location: { href: `https://site.test/test?draft=${'a'.repeat(64)}` } };
	const drafts = loadServerModule(new URL('../src/lib/growth/drafts.ts', import.meta.url), {
		'svelte/store': { get, writable },
		'$lib/utils/auth-session': { getAuthToken: () => 'editor-session' },
		'$lib/utils/config': { getGraphQLUrl: () => 'https://api.test/graphql' }
	});
	try {
		assert.throws(() => drafts.usesDraft(context), /загружается/);
		drafts.draftSession.set({
			licenseId: 'other-site',
			draft: { id: 'other-draft', slug: '/test', version: 1 }
		});
		assert.throws(() => drafts.usesDraft(context), /загружается/);
		drafts.draftSession.set({
			licenseId: 'site-one',
			draft: { id: 'draft', slug: '/other-page', version: 1 }
		});
		assert.throws(() => drafts.usesDraft(context), /другой странице/);
		assert.equal(drafts.usesDraft({ ...context, slug: '__global__' }), true);
	} finally {
		globalThis.window = oldWindow;
	}
});

test('a draft conflict cannot fall through to published GraphQL saves', async () => {
	const operations = [];
	const handlers = loadServerModule(new URL('../src/lib/utils/page-edit.ts', import.meta.url), {
		'$lib/utils/auth-session': {
			getAuthToken: () => {
				throw new Error('Published auth must not be used');
			}
		},
		'$lib/utils/config': {
			getGraphQLUrl: () => {
				throw new Error('Published endpoint must not be used');
			}
		},
		'$lib/growth/drafts': {
			usesDraft: () => true,
			saveDraftOperation: async (_context, operation) => {
				operations.push(operation);
				if (operation.data?.title === 'conflict') throw new Error('Concurrent change');
				return { componentId: 'draft-component' };
			}
		}
	});
	const data = { title: 'Prepared' };
	assert.equal(await handlers.saveComponentData(context, 'Hero', data), 'draft-component');
	assert.equal(data._componentId, 'draft-component');
	await handlers.saveLayoutData(context, 'Header', { phone: 'Prepared' });
	await handlers.savePageSeo(context, { title: 'Prepared', description: '', keywords: '' });
	await handlers.deleteComponentData(context, 'draft-component');
	await handlers.saveComponentData({ ...context, slug: '__global__' }, 'Footer', {
		label: 'Prepared'
	});
	assert.deepEqual(
		operations.map((operation) => operation.kind),
		['component', 'layout', 'seo', 'reset', 'component']
	);
	assert.equal(operations[4].scope, 'global');
	await assert.rejects(
		handlers.saveComponentData(context, 'Hero', { title: 'conflict' }),
		/Concurrent change/
	);
});

test('normal editing retains the existing published save operation', async () => {
	const oldFetch = globalThis.fetch;
	let body;
	globalThis.fetch = async (_url, options) => {
		body = JSON.parse(options.body);
		return response({ data: { upsertPageComponent: { id: 'published-component' } } });
	};
	const handlers = loadServerModule(new URL('../src/lib/utils/page-edit.ts', import.meta.url), {
		'$lib/utils/auth-session': { getAuthToken: () => 'editor-session' },
		'$lib/utils/config': { getGraphQLUrl: () => 'https://api.test/graphql' },
		'$lib/growth/drafts': { usesDraft: () => false }
	});
	try {
		assert.equal(
			await handlers.saveComponentData(context, 'Hero', { title: 'Published' }),
			'published-component'
		);
		assert.match(body.query, /upsertPageComponent/);
		assert.equal(body.variables.licenseId, context.licenseId);
	} finally {
		globalThis.fetch = oldFetch;
	}
});

test('preview SSR forwards only capability and sets private noindex headers', async () => {
	let forwarded;
	let headers;
	const loaders = loadServerModule(new URL('../src/lib/server/render-page.ts', import.meta.url), {
		'@sveltejs/kit': {
			error: (status, message) => {
				throw Object.assign(new Error(message), { status });
			}
		},
		'graphql-request': { ClientError: class ClientError extends Error {} },
		'$lib/utils/graphql-client': {
			createGraphQLClient: (value) => {
				forwarded = value;
				return { request: async () => ({ renderPage: { site: { header: null }, page: {} } }) };
			}
		},
		'$lib/design-systems/registry': { readDesignSystem: () => 'base' }
	});
	const token = 'a'.repeat(64);
	const url = new URL(`https://site.test/test?draft=${token}&preview=1`);
	const event = {
		url,
		request: { url: url.href },
		locals: {},
		setHeaders: (value) => {
			headers = value;
		}
	};
	await loaders.loadRenderPage(event, '/test');
	assert.deepEqual(forwarded, { 'X-Forwarded-Host': 'site.test', 'X-Leget-Draft': token });
	assert.equal(headers['cache-control'], 'private, no-store');
	assert.equal(headers['x-robots-tag'], 'noindex, nofollow');
	assert.equal(headers['referrer-policy'], 'no-referrer');
	event.url = new URL('https://site.test/test?draft=wrong');
	await assert.rejects(loaders.loadRenderPage(event, '/test'), (error) => error.status === 404);
});
