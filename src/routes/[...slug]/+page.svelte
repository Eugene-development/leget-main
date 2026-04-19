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

	const site = $derived(data.pageData?.site as SiteData | undefined);
	const templateId = $derived(site?.templateId ?? null);
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
	headerData={site?.header?.data ?? null}
	footerData={site?.footer?.data ?? null}
	components={data.pageData?.page?.componentsData ?? []}
/>
