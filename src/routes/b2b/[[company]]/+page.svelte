<script lang="ts">
	import { publicMediaUrl } from '$lib/utils/public-media';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	import * as Promo1Layout from '$lib/components/templates/Promo-1/layout';
	import B2BDirectory from '$lib/components/templates/Promo-1/pages/b2b/B2BDirectory.svelte';
	import B2BCompany from '$lib/components/templates/Promo-1/pages/b2b/B2BCompany.svelte';
	import type { ComponentMap, TemplateLayout } from '$lib/components/templates/types';
	import '$lib/components/templates/Promo-1/theme.css';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const site = $derived(data.pageData.site);
	const seo = $derived(data.pageData.page.seo);
	const componentMap: ComponentMap = { B2BDirectory, B2BCompany };
	const components = $derived(
		(data.pageData.page.componentsData as { type: string; data: Record<string, unknown> }[]).map(
			(component) =>
				component.type === 'B2BDirectory'
					? { ...component, data: { ...component.data, ...data.directory } }
					: component
		)
	);
</script>

<svelte:head>
	{#if seo.title}<title>{seo.title}</title>{/if}
	{#if seo.description}<meta name="description" content={seo.description} />{/if}
	{#if site.faviconUrl}<link rel="icon" href={publicMediaUrl(site.faviconUrl)} />{/if}
</svelte:head>

<PageRenderer
	layout={Promo1Layout as TemplateLayout}
	{componentMap}
	templateId={site.templateId}
	slug={data.slug}
	{components}
	headerData={site.header?.data ?? null}
	footerData={site.footer?.data ?? null}
	actionCards={site.actionCards}
	{seo}
	editContext={null}
/>
