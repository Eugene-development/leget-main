<script lang="ts">
	import { siteAppearanceStylesheet } from '$lib/site-settings/appearance';

	let { value, designSystem = 'base' }: { value: unknown; designSystem?: string } = $props();
	// Only validated hex colors and fixed font/radius presets enter this CSS.
	// Svelte owns the head node in SSR and on navigation, including its removal.
	const stylesheet = $derived(siteAppearanceStylesheet(value, designSystem));
</script>

<svelte:head>
	{#if stylesheet}
		<svelte:element this={'style'} data-site-appearance>{stylesheet}</svelte:element>
	{/if}
</svelte:head>
