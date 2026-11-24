import { dev } from '$app/environment';
import { findPageSlug, templateFolders, templateKey } from '$lib/components/templates/page-overrides';
import { readFileSync } from 'node:fs';
import type { Manifest } from 'vite';

const templatePath = 'src/lib/components/templates/';
let clientManifest: Manifest | undefined;
const templateStyles = new Map<string, { layout: string[]; pages: Map<string, string[]> }>();

function readManifest(): Manifest {
	// The adapter ships a copy next to the server bundle. Vite preview uses the original.
	for (const path of [
		'../client-manifest.json',
		'./client-manifest.json',
		'../../client/.vite/manifest.json',
		'../client/.vite/manifest.json'
	]) {
		try {
			return JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8')) as Manifest;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
		}
	}
	throw new Error('Client manifest is missing from the leget-main build');
}

function entryStyles(manifest: Manifest, entry: string): string[] {
	const visited = new Set<string>();
	const stylesheets = new Set<string>();
	function collect(key: string) {
		if (visited.has(key)) return;
		visited.add(key);
		const chunk = manifest[key];
		if (!chunk) return;
		for (const dependency of chunk.imports ?? []) collect(dependency);
		for (const css of chunk.css ?? []) stylesheets.add(css);
	}

	collect(entry);
	return Array.from(stylesheets);
}

function readTemplateStyles(folder: string) {
	const manifest = (clientManifest ??= readManifest());
	const directory = templatePath + folder + '/page-modules/';
	const layoutEntry = directory + '_layout.ts';
	if (!manifest[layoutEntry]) throw new Error(`Missing layout entry for ${folder}`);

	const pages = new Map<string, string[]>();
	for (const key of Object.keys(manifest)) {
		if (key === layoutEntry || !key.startsWith(directory) || !key.endsWith('.ts')) continue;
		const name = key.slice(directory.length, -3);
		pages.set(name === '_root' ? '/' : '/' + name.replaceAll('~', '/'), entryStyles(manifest, key));
	}

	return { layout: entryStyles(manifest, layoutEntry), pages };
}

export function templatePageStyles(templateId: number | null, slug: string | null): string[] {
	if (dev) return [];
	const folder = templateFolders[templateKey(templateId)];
	let styles = templateStyles.get(folder);
	if (!styles) {
		styles = readTemplateStyles(folder);
		templateStyles.set(folder, styles);
	}
	const page = findPageSlug(slug, Array.from(styles.pages.keys()));
	return Array.from(new Set([...styles.layout, ...(page ? styles.pages.get(page)! : [])]));
}
