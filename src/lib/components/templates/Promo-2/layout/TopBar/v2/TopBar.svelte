<script lang="ts">
	// Артикул: 2.В.1.2 — см. docs/architecture/component-articles-map.md
	import TopBarContent from '../TopBarContent.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	let { data, isEditable = false }: PageComponentProps = $props();
</script>

<TopBarContent {data} {isEditable} defaultTheme="dark" largeText={true} />
