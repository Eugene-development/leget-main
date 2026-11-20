<script lang="ts">
	// Артикул: 2.17.6.2 — см. docs/architecture/component-articles-map.md
	import type { PageComponentProps } from '$lib/components/templates/types';
	import EquipmentSection from '../../../_shared/EquipmentSection.svelte';

	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();
</script>

<EquipmentSection
	bind:data
	{editContext}
	{isEditable}
	componentType="EquipmentStorage"
	variant="v2"
/>
