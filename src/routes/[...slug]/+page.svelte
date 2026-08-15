<script lang="ts">
	import ComponentResolver from '$lib/components/ComponentResolver.svelte';
	import type { PageSeoData } from '$lib/utils/page-edit';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type SiteData = {
		name: string | null;
		metaDescription: string | null;
		templateId: number | null;
		faviconUrl: string | null;
		header: { data: Record<string, unknown> } | null;
		footer: { data: Record<string, unknown> } | null;
	};

	type PageComponent = {
		type: string;
		data: Record<string, unknown>;
	};

	const site = $derived(data.pageData?.site as SiteData | undefined);
	const templateId = $derived(site?.templateId ?? null);

	const page = $derived(data.pageData?.page);
	const pageSlug = $derived(page?.slug ?? null);
	const seo = $derived((page?.seo as PageSeoData | undefined) ?? null);

	// Try both camelCase and snake_case for licenseId to be resilient to GraphQL mapping
	const pageId = $derived(page?.id ?? null);
	const licenseId = $derived(page?.licenseId ?? (page as any)?.license_id ?? null);
</script>

<svelte:head>
	{#if seo?.title ?? site?.name}
		<title>{seo?.title ?? site?.name}</title>
	{/if}
	{#if seo?.description ?? site?.metaDescription}
		<meta name="description" content={seo?.description ?? site?.metaDescription} />
	{/if}
	{#if seo?.keywords}
		<meta name="keywords" content={seo.keywords} />
	{/if}
	{#if site?.faviconUrl}
		<link rel="icon" href={site.faviconUrl} />
	{/if}
</svelte:head>

<ComponentResolver
	{templateId}
	slug={pageSlug}
	headerData={site?.header?.data ?? null}
	footerData={site?.footer?.data ?? null}
	{seo}
	components={(data.pageData?.page?.componentsData as PageComponent[]) ?? []}
	editContext={pageId && licenseId ? { pageId, licenseId, templateId, slug: pageSlug } : null}
/>
