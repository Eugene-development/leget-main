<script lang="ts">
	import EquipmentV1 from './v1/Equipment.svelte';
	import EquipmentV2 from './v2/Equipment.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import { fly } from 'svelte/transition';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: any;
		isEditable?: boolean;
	} = $props();

	let selectedVersion = $state<'v1' | 'v2'>('v1');
</script>

<div class="relative w-full overflow-hidden">
	<!-- Встраиваемый переключатель версий -->
	<VersionSwitcher 
		bind:data 
		{editContext} 
		{isEditable} 
		componentType="Equipment" 
		versionKey="equipmentVersion"
		bind:selectedVersion 
	/>

	<!-- Динамический рендеринг выбранного компонента с эффектом слайдера -->
	{#if selectedVersion === 'v2'}
		<div class="w-full" in:fly={{ x: 1200, duration: 600 }} out:fly={{ x: 1200, duration: 600 }}>
			<EquipmentV2 bind:data {editContext} {isEditable} />
		</div>
	{:else}
		<div class="w-full" in:fly={{ x: -1200, duration: 600 }} out:fly={{ x: -1200, duration: 600 }}>
			<EquipmentV1 bind:data {editContext} {isEditable} />
		</div>
	{/if}
</div>
