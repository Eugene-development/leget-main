<script lang="ts">
	import { getContext, onMount, type Snippet } from 'svelte';
	import NavigationLoading from './NavigationLoading.svelte';

	let {
		label = 'Загрузка контента…',
		workspace = true,
		children
	}: { label?: string; workspace?: boolean; children?: Snippet } = $props();
	const contentLoading = getContext<{ start: () => () => void } | undefined>(
		'leget-content-loading'
	);

	// Register only in the browser; leaving the loading branch or the route
	// releases its own request without stopping other pending content.
	onMount(() => contentLoading?.start());
</script>

{#if children}
	{@render children()}
{:else}
	<NavigationLoading {workspace} {label} />
{/if}
