<script lang="ts">
	// Артикул: 2.В.1.1 — см. docs/architecture/component-articles-map.md
	import TopBarContent from '../TopBarContent.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	let { data, isEditable = false }: PageComponentProps = $props();
</script>

<div class="border-b border-border-light bg-surface-warm">
	<TopBarContent {data} {isEditable} dark={false} largeText={true} />
</div>
