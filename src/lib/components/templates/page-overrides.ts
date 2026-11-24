import type { ComponentMap } from './types';

export type PageOverrides = Record<string, () => Promise<{ default: ComponentMap }>>;

export const templateFolders = { 0: 'Test', 1: 'Promo-1', 2: 'Promo-2', 3: 'Promo-3' } as const;

export function templateKey(id: number | null): keyof typeof templateFolders {
	return id !== null && Object.hasOwn(templateFolders, id)
		? (id as keyof typeof templateFolders)
		: 0;
}

export function findPageSlug(slug: string | null, registeredSlugs: string[]): string | undefined {
	if (!slug) return;
	const path = slug.startsWith('/') ? slug : '/' + slug;
	if (registeredSlugs.includes(path)) return path;

	const segments = path.split('/');
	return registeredSlugs.find((candidate) => {
		if (!candidate.includes('{')) return false;
		const pattern = candidate.split('/');
		return (
			pattern.length === segments.length &&
			pattern.every((part, index) =>
				/^\{\w+\}$/.test(part) ? segments[index] !== '' : part === segments[index]
			)
		);
	});
}
