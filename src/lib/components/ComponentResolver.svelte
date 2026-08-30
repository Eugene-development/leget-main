<script lang="ts">
	import type { EditContext } from '$lib/utils/page-edit';
	import type { PageSeoData } from '$lib/utils/page-edit';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	import type { ComponentMap, TemplateLayout } from '$lib/components/templates/types';

	// Template registries — each template exports its own component map.
	// ВНИМАНИЕ: эти четыре импорта затягивают в чанк ВСЕ страницы ВСЕХ шаблонов
	// (~1,3 МБ JS). Поэтому у частых страниц есть собственные маршруты
	// (src/routes/about, /partnership, /testimonials, /installment, /guarantees):
	// они минуют этот компонент и подключают PageRenderer напрямую со своей картой.
	// Здесь остаётся то, что резолвится только в рантайме: динамические слаги
	// (/mebel/{category}/{project}) и страницы без своего маршрута.
	import * as TestTemplate from './templates/Test';
	import * as Promo1Template from './templates/Promo-1';
	import * as Promo2Template from './templates/Promo-2';
	import * as Promo3Template from './templates/Promo-3';

	interface TemplateModule extends TemplateLayout {
		pageOverrides?: Record<string, ComponentMap>;
	}

	interface PageComponent {
		id?: string | null;
		type: string;
		data: Record<string, unknown>;
	}

	let {
		templateId = null,
		slug = null,
		components = [],
		headerData = null,
		footerData = null,
		actionCards = null,
		seo = null,
		editContext = null,
		ownerId = null
	}: {
		templateId: number | null;
		slug: string | null;
		components: PageComponent[];
		headerData: Record<string, unknown> | null;
		footerData: Record<string, unknown> | null;
		/** Сохранённые карточки акций (`site.actionCards`) — для полосы акций. */
		actionCards?: unknown;
		seo?: PageSeoData | null;
		editContext: EditContext | null;
		/** id владельца лицензии — PageRenderer включает по нему режим редактирования. */
		ownerId?: string | null;
	} = $props();

	/**
	 * Map templateId (from License) to a template module.
	 * null / undefined → fallback to Test template.
	 */
	function resolveTemplate(id: number | null): TemplateModule {
		switch (id) {
			case 1:
				return Promo1Template as unknown as TemplateModule;
			case 2:
				return Promo2Template as unknown as TemplateModule;
			case 3:
				return Promo3Template as unknown as TemplateModule;
			default:
				return TestTemplate as unknown as TemplateModule;
		}
	}

	/**
	 * Resolve page-specific component map by slug.
	 */
	function resolveComponentMap(tmpl: TemplateModule, pageSlug: string | null): ComponentMap {
		if (!pageSlug || !tmpl.pageOverrides) return {};

		// 1. Exact match
		if (tmpl.pageOverrides[pageSlug]) {
			return tmpl.pageOverrides[pageSlug];
		}

		// 2. Pattern matching (dynamic routes)
		const cleanSlug = pageSlug.startsWith('/') ? pageSlug : '/' + pageSlug;

		// /mebel/{category}/{project}
		if (cleanSlug.match(/^\/mebel\/[^\/]+\/[^\/]+$/)) {
			return tmpl.pageOverrides['/mebel/{category}/{project}'] || {};
		}

		// /mebel/{category}
		if (cleanSlug.match(/^\/mebel\/[^\/]+$/)) {
			return tmpl.pageOverrides['/mebel/{category}'] || {};
		}

		// /bytovaya-tehnika/{brand}
		if (cleanSlug.match(/^\/bytovaya-tehnika\/[^\/]+$/)) {
			return tmpl.pageOverrides['/bytovaya-tehnika/{brand}'] || {};
		}

		if (cleanSlug.match(/^\/stoleshnica\/[^/]+\/[^/]+$/)) {
			return tmpl.pageOverrides['/stoleshnica/{material}/{brand}'] || {};
		}
		if (cleanSlug.match(/^\/stoleshnica\/[^/]+$/)) {
			return tmpl.pageOverrides['/stoleshnica/{material}'] || {};
		}

		return {};
	}

	const template = $derived(resolveTemplate(templateId));
	const componentMap = $derived(resolveComponentMap(template, slug));
	const layout = $derived<TemplateLayout>({
		PromoStrip: template.PromoStrip ?? null,
		Banner: template.Banner ?? null,
		Header: template.Header ?? null,
		Footer: template.Footer ?? null
	});
</script>

<PageRenderer
	{layout}
	{componentMap}
	{slug}
	{components}
	{headerData}
	{footerData}
	{actionCards}
	{seo}
	{editContext}
	{ownerId}
/>
