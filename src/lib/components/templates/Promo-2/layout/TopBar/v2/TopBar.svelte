<script lang="ts">
	// Артикул: 2.В.1.2 — см. docs/architecture/component-articles-map.md
	import TopBarContent from '../TopBarContent.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	let { data, isEditable = false }: PageComponentProps = $props();
</script>

<div class="border-b border-inverse/10 bg-primary text-inverse">
	<TopBarContent {data} {isEditable} dark={true} largeText={true} />
</div>
