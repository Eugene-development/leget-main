<script lang="ts">
	// Артикул: 2.5.2.2 — см. docs/architecture/component-articles-map.md
	import CatalogLayout from '../CatalogLayout.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
</script>

<CatalogLayout bind:data {editContext} {isEditable} layout="gallery" />
