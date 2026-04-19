<script lang="ts">
	import ComponentResolver from '$lib/components/ComponentResolver.svelte';

	let { data } = $props();
</script>

<svelte:head>
	{#if data.pageData?.site?.name}
		<title>{data.pageData.site.name}</title>
	{/if}
	{#if data.pageData?.site?.metaDescription}
		<meta name="description" content={data.pageData.site.metaDescription} />
	{/if}
</svelte:head>

{#if data.pageData?.page?.componentsData}
	<ComponentResolver components={data.pageData.page.componentsData} />
{/if}
