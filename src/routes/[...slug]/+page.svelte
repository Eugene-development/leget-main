<script lang="ts">
	import ComponentResolver from '$lib/components/ComponentResolver.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type SiteData = {
		name: string | null;
		metaDescription: string | null;
		templateId: number | null;
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
	
	// Try both camelCase and snake_case for licenseId to be resilient to GraphQL mapping
	const pageId = $derived(page?.id ?? null);
	const licenseId = $derived(page?.licenseId ?? (page as any)?.license_id ?? null);
</script>

<svelte:head>
	{#if site?.name}
		<title>{site.name}</title>
	{/if}
	{#if site?.metaDescription}
		<meta name="description" content={site.metaDescription} />
	{/if}
</svelte:head>

<ComponentResolver
	{templateId}
	slug={pageSlug}
	headerData={site?.header?.data ?? null}
	footerData={site?.footer?.data ?? null}
	components={data.pageData?.page?.componentsData as PageComponent[] ?? []}
	editContext={pageId && licenseId ? { pageId, licenseId } : null}
/>
