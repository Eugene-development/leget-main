<script lang="ts">
	// Артикул: 2.17.5.1 — см. docs/architecture/component-articles-map.md
	import EquipmentSection from '../../../_shared/EquipmentSection.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { equipmentDefaults } from '../../content';

	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();
	const image = $derived(
		typeof data?.image === 'string' ? data.image : equipmentDefaults.EquipmentLighting.image
	);
</script>

<EquipmentSection bind:data {editContext} {isEditable} componentType="EquipmentLighting" />

{#if image.trim() || isEditable}
	<div class="aspect-[4/3] w-full overflow-hidden bg-surface-warm text-secondary sm:aspect-[2/1]">
		<ImageFallback
			imagePath={['image']}
			src={image}
			alt="Освещение кухни"
			class="block h-full w-full object-cover"
			loading="lazy"
		/>
	</div>
{/if}
