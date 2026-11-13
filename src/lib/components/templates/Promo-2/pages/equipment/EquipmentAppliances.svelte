<script lang="ts">
	// Артикул: 2.17.2.1 — см. docs/architecture/component-articles-map.md
	import EquipmentSection from '../_shared/EquipmentSection.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();
</script>

<EquipmentSection bind:data {editContext} {isEditable} componentType="EquipmentAppliances" />
