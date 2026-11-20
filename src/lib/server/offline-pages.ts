import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import defaultsJson from '$lib/ds/defaults.json';
import type { RenderPageResponse } from '$lib/server/render-page';

type PublicPage = RenderPageResponse['renderPage'];
type Snapshot = { savedAt: number; host: string; slug: string; data: PublicPage };
type Defaults = { name: string; pages: Record<string, Record<string, Record<string, unknown>>> };
const defaults = defaultsJson as unknown as Record<string, Defaults>;
const MAX_AGE = 24 * 60 * 60 * 1000;

// Catalogue data must come from live storage. Keep the site shell available,
// but never substitute sample products or stale prices for an unavailable DB.
export function isCatalogPage(slug: string) {
	return /^\/(?:mebel|projects|stoleshnica|bytovaya-tehnika|santehnika|osveshchenie|dveri|okna|furnitura|plitka|kitchens|wardrobes|styles|facades|furniture|equipment|brands|collections|materials)(?:\/|$)/.test(
		slug
	);
}

function snapshotPath(host: string, slug: string) {
	const key = createHash('sha256').update(slug).digest('hex');
	return join(siteDirectory(host), `${key}.json`);
}

function siteDirectory(host: string) {
	return join(
		env.LEGET_PAGE_SNAPSHOT_DIR || '.cache/public-pages',
		createHash('sha256').update(host).digest('hex')
	);
}

/** Public, anonymous renderPage responses only; previews never call this. */
export async function savePublicPage(host: string, slug: string, data: PublicPage) {
	if (isCatalogPage(slug)) return;
	const path = snapshotPath(host, slug);
	const temporary = `${path}.${randomUUID()}.tmp`;
	try {
		await mkdir(siteDirectory(host), { recursive: true });
		const snapshot: Snapshot = { savedAt: Date.now(), host, slug, data };
		await writeFile(temporary, JSON.stringify(snapshot), { mode: 0o600 });
		await rename(temporary, path);
	} catch (err) {
		// A read-only/full disk must not turn a healthy live page into an error.
		console.warn(
			'[leget-main] Cannot save public page snapshot:',
			err instanceof Error ? err.message : err
		);
	} finally {
		await rm(temporary, { force: true }).catch(() => {});
	}
}

export async function removePublicPage(host: string, slug: string) {
	await rm(snapshotPath(host, slug), { force: true }).catch(() => {});
}

export async function removePublicSite(host: string) {
	await rm(siteDirectory(host), { recursive: true, force: true }).catch(() => {});
}

async function readSnapshot(host: string, slug: string): Promise<PublicPage | null> {
	try {
		const value = JSON.parse(await readFile(snapshotPath(host, slug), 'utf8')) as Snapshot;
		if (
			value.host !== host ||
			value.slug !== slug ||
			!Number.isFinite(value.savedAt) ||
			Date.now() - value.savedAt > MAX_AGE ||
			!value.data?.site ||
			!value.data?.page
		)
			return null;
		return value.data;
	} catch {
		return null;
	}
}

/** Cold-start defaults are allowed only for local demos, never arbitrary tenants. */
function localDemo(host: string, slug: string): PublicPage | null {
	if (!dev) return null;
	const templateId =
		/^(?:promo-([123])\.localhost)$/.exec(host)?.[1] ??
		(['localhost', '127.0.0.1', '[::1]'].includes(host) ? '1' : null);
	const template = templateId ? defaults[templateId] : null;
	if (!template || slug === '__global__') return null;
	const components = template.pages[slug];
	if (!components && !isCatalogPage(slug)) return null;
	return {
		site: {
			name: template.name,
			metaDescription: null,
			templateId: Number(templateId),
			faviconUrl: null,
			ownerId: null,
			header: null,
			footer: null,
			actionCards: null
		},
		page: {
			id: '',
			licenseId: '',
			slug,
			requestedSlug: slug,
			componentsData: Object.entries(components ?? {}).map(([type, data]) => ({ type, data })),
			seo: {
				title: template.name,
				description: null,
				keywords: null,
				rawTitle: null,
				rawDescription: null,
				isDynamic: false,
				pattern: slug,
				variables: []
			}
		}
	};
}

export async function loadOfflinePage(host: string, slug: string): Promise<PublicPage | null> {
	const catalog = isCatalogPage(slug);
	const data = (await readSnapshot(host, catalog ? '/' : slug)) ?? localDemo(host, slug);
	if (!data) return null;
	const copy = structuredClone(data);
	// Offline content is read-only even when an owner has an active browser session.
	copy.site.ownerId = null;
	copy.page.id = '';
	copy.page.licenseId = '';
	if (catalog) {
		copy.page.slug = slug;
		copy.page.requestedSlug = slug;
		copy.page.componentsData = [];
	}
	return copy;
}
