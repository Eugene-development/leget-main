<script lang="ts">
	import ComponentResolver from '$lib/components/ComponentResolver.svelte';
	import Header from '$lib/components/templates/Test/blocks/Header.svelte';
	import Footer from '$lib/components/templates/Test/blocks/Footer.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type SiteData = {
		name: string | null;
		metaDescription: string | null;
		header: { data: Record<string, unknown> } | null;
		footer: { data: Record<string, unknown> } | null;
	};

	const site = $derived(data.pageData?.site as SiteData | undefined);
</script>

<svelte:head>
	{#if site?.name}
		<title>{site.name}</title>
	{/if}
	{#if site?.metaDescription}
		<meta name="description" content={site.metaDescription} />
	{/if}
</svelte:head>

{#if site?.header}
	<Header data={site.header.data} />
{/if}

{#if data.pageData?.page?.componentsData}
	<ComponentResolver components={data.pageData.page.componentsData} />
{/if}

{#if site?.footer}
	<Footer data={site.footer.data} />
{/if}
