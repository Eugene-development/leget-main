<script lang="ts">
	import { siteAppearanceStylesheet } from '$lib/site-settings/appearance';

	let { value }: { value: unknown } = $props();
	// Only validated hex colors and fixed font/radius presets enter this CSS.
	// Svelte owns the head node in SSR and on navigation, including its removal.
	const stylesheet = $derived(siteAppearanceStylesheet(value));
	const markup = $derived(stylesheet ? `<style data-site-appearance>${stylesheet}</style>` : '');
</script>

<svelte:head>
	{@html markup}
</svelte:head>
