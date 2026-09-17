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
		ownerId: string | null;
		header: { data: Record<string, unknown> } | null;
		footer: { data: Record<string, unknown> } | null;
		actionCards: unknown;
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
	const isUniversity = $derived(templateId === 1 && pageSlug === '/university');
	const metaTitle = $derived(
		isUniversity && !seo?.rawTitle
			? 'Университет — о дизайне, ремонте и доме'
			: (seo?.title ?? site?.name)
	);
	const metaDescription = $derived(
		isUniversity && !seo?.rawDescription
			? 'Универ: разбираемся в дизайне, ремонте, мебели, фурнитуре, технике, сантехнике и аксессуарах. Начните с интересной вам дисциплины.'
			: (seo?.description ?? site?.metaDescription)
	);

	// Try both camelCase and snake_case for licenseId to be resilient to GraphQL mapping
	const pageId = $derived(page?.id ?? null);
	const licenseId = $derived(page?.licenseId ?? (page as any)?.license_id ?? null);
</script>

<svelte:head>
	{#if metaTitle}
		<title>{metaTitle}</title>
	{/if}
	{#if metaDescription}
		<meta name="description" content={metaDescription} />
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
	actionCards={site?.actionCards ?? null}
	{seo}
	components={(data.pageData?.page?.componentsData as PageComponent[]) ?? []}
	editContext={pageId && licenseId ? { pageId, licenseId, templateId, slug: pageSlug } : null}
	ownerId={site?.ownerId ?? null}
/>
