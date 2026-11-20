import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { ClientError } from 'graphql-request';
import { error, isHttpError } from '@sveltejs/kit';
import { loadServerModule } from './test-server-module.mjs';

const defaults = JSON.parse(
	await fs.readFile(new URL('../src/lib/ds/defaults.json', import.meta.url), 'utf8')
);
const publicData = (name = 'Company') => ({
	site: {
		name,
		templateId: 1,
		ownerId: 'owner',
		header: { data: { designSystem: 'iris' } },
		footer: null
	},
	page: {
		id: 'page',
		licenseId: 'license',
		slug: '/',
		requestedSlug: '/',
		componentsData: [{ type: 'HeroMain', data: { title: name } }]
	}
});

async function fixture(dev = false) {
	const directory = await fs.mkdtemp(path.join(tmpdir(), 'leget-offline-'));
	const dependencies = {
		'node:crypto': crypto,
		'node:fs/promises': fs,
		'node:path': path,
		'$app/environment': { dev },
		'$env/dynamic/private': { env: { LEGET_PAGE_SNAPSHOT_DIR: directory } },
		'$lib/ds/defaults.json': defaults
	};
	const offline = loadServerModule(
		new URL('../src/lib/server/offline-pages.ts', import.meta.url),
		dependencies
	);
	let backend = async () => ({ renderPage: publicData() });
	const render = loadServerModule(new URL('../src/lib/server/render-page.ts', import.meta.url), {
		'@sveltejs/kit': { error },
		'graphql-request': { ClientError },
		'$lib/server/offline-pages': offline,
		'$lib/design-systems/registry': { readDesignSystem: (value) => value?.designSystem ?? 'base' },
		'$lib/utils/graphql-client': {
			createGraphQLClient: () => ({ request: (...args) => backend(...args) })
		}
	});
	return {
		directory,
		offline,
		render,
		setBackend(value) {
			backend = value;
		},
		close: () => fs.rm(directory, { recursive: true, force: true })
	};
}
function event(host = 'site.test', query = '') {
	const url = new URL(`https://${host}/${query}`);
	return {
		url,
		request: new Request(url),
		locals: {},
		headers: {},
		setHeaders(value) {
			Object.assign(this.headers, value);
		}
	};
}
const failure = (code, status = 200) =>
	new ClientError(
		{
			status,
			errors: [
				{
					message: code === 'INTERNAL_SERVER_ERROR' ? 'Internal server error' : code,
					extensions: { code }
				}
			]
		},
		{ query: '' }
	);

test('live page survives DB/network outage and restart; catalogue is unavailable, then recovers', async () => {
	const f = await fixture();
	try {
		assert.equal((await f.render.loadRenderPage(event(), '/')).backendUnavailable, undefined);
		for (const problem of [
			new TypeError('fetch failed'),
			failure('INTERNAL_SERVER_ERROR'),
			failure('DB_DOWN', 500)
		]) {
			f.setBackend(async () => {
				throw problem;
			});
			const request = event();
			const result = await f.render.loadRenderPage(request, '/');
			assert.equal(result.backendUnavailable, true);
			assert.equal(result.pageData.site.name, 'Company');
			assert.equal(result.pageData.site.ownerId, null);
			assert.equal(result.pageData.page.id, '');
			assert.equal(request.locals.designSystem, 'iris');
			assert.equal(request.headers['cache-control'], 'private, no-store');
			const catalog = await f.render.loadRenderPage(event(), '/mebel/kuhni');
			assert.equal(catalog.pageData.page.slug, '/mebel/kuhni');
			assert.deepEqual(catalog.pageData.page.componentsData, []);
		}
		// A fresh module has no in-memory state; disk snapshot still works.
		const entries = await fs.readdir(f.directory);
		assert.equal(entries.length, 1);
		const unknown = f.render.loadRenderPage(event('other.test'), '/');
		await assert.rejects(unknown, (err) => isHttpError(err, 503));
		f.setBackend(async () => ({ renderPage: publicData('Updated') }));
		assert.equal((await f.render.loadRenderPage(event(), '/')).pageData.site.name, 'Updated');
		assert.equal((await f.offline.loadOfflinePage('site.test', '/')).site.name, 'Updated');
	} finally {
		await f.close();
	}
});

test('cold local demos render all three templates; production and unknown hosts do not use demo data', async () => {
	for (const dev of [true, false]) {
		const f = await fixture(dev);
		try {
			for (const id of [1, 2, 3]) {
				const data = await f.offline.loadOfflinePage(`promo-${id}.localhost`, '/');
				if (dev) {
					assert.equal(data.site.templateId, id);
					assert.ok(data.page.componentsData.length);
				} else assert.equal(data, null);
			}
			assert.equal(await f.offline.loadOfflinePage('random.test', '/'), null);
		} finally {
			await f.close();
		}
	}
});

test('previews are never stored or served offline; business errors keep 403/404/410', async () => {
	const f = await fixture();
	try {
		const preview = event('site.test', `?draft=${'a'.repeat(64)}`);
		await f.render.loadRenderPage(preview, '/');
		assert.deepEqual(await fs.readdir(f.directory), []);
		await f.render.loadRenderPage(event(), '/');
		f.setBackend(async () => {
			throw new TypeError('fetch failed');
		});
		await assert.rejects(f.render.loadRenderPage(preview, '/'), (err) => isHttpError(err, 503));
		for (const [code, status] of [
			['PAGE_PREVIEW_NOT_FOUND', 410],
			['PAGE_NOT_FOUND', 404],
			['SITE_SUSPENDED', 403],
			['SITE_NOT_FOUND', 404],
			['BAD_USER_INPUT', 502]
		]) {
			f.setBackend(async () => {
				throw failure(code);
			});
			await assert.rejects(f.render.loadRenderPage(event(), '/'), (err) =>
				isHttpError(err, status)
			);
		}
		assert.equal(await f.offline.loadOfflinePage('site.test', '/'), null);
	} finally {
		await f.close();
	}
});

test('corrupt and expired snapshots are ignored and a read-only disk cannot break live rendering', async () => {
	const f = await fixture();
	try {
		await f.offline.savePublicPage('site.test', '/', publicData());
		const [site] = await fs.readdir(f.directory);
		const [file] = await fs.readdir(path.join(f.directory, site));
		const filePath = path.join(f.directory, site, file);
		const snapshot = JSON.parse(await fs.readFile(filePath, 'utf8'));
		snapshot.savedAt = Date.now() - 25 * 60 * 60 * 1000;
		await fs.writeFile(filePath, JSON.stringify(snapshot));
		assert.equal(await f.offline.loadOfflinePage('site.test', '/'), null);
		await fs.writeFile(filePath, '{');
		assert.equal(await f.offline.loadOfflinePage('site.test', '/'), null);
		await fs.rm(path.join(f.directory, site), { recursive: true });
		await fs.writeFile(path.join(f.directory, site), 'not a directory');
		assert.equal((await f.render.loadRenderPage(event(), '/')).pageData.site.name, 'Company');
	} finally {
		await f.close();
	}
});
