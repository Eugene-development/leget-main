import { findPageSlug, templateFolders, templateKey, type PageOverrides } from './page-overrides';
import type { ComponentMap, TemplateLayout } from './types';

type TemplateModule = { loadLayout: () => Promise<TemplateLayout>; pageOverrides: PageOverrides };

const templates = {
	0: () => import('./Test'),
	1: () => import('./Promo-1'),
	2: () => import('./Promo-2'),
	3: () => import('./Promo-3')
} satisfies Record<keyof typeof templateFolders, () => Promise<TemplateModule>>;

export async function loadTemplatePage(
	templateId: number | null,
	slug: string | null
): Promise<{ layout: TemplateLayout; componentMap: ComponentMap }> {
	const template = await templates[templateKey(templateId)]();
	const pages: PageOverrides = template.pageOverrides;
	const pageSlug = findPageSlug(slug, Object.keys(pages));
	const [layout, page] = await Promise.all([
		template.loadLayout(),
		pageSlug ? pages[pageSlug]() : null
	]);
	return { layout, componentMap: page?.default ?? {} };
}
