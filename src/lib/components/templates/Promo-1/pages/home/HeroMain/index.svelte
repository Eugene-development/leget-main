<script lang="ts">
	import HeroV1 from './v1/HeroMain.svelte';
	import HeroV2 from './v2/HeroMain.svelte';
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

<div class="relative w-full min-h-screen overflow-hidden">
	<!-- Встраиваемый переключатель версий -->
	<VersionSwitcher 
		bind:data 
		{editContext} 
		{isEditable} 
		componentType="HeroMain" 
		versionKey="heroVersion"
		bind:selectedVersion 
	/>

	<!-- Динамический рендеринг выбранного компонента с эффектом слайдера -->
	{#if selectedVersion === 'v2'}
		<div class="absolute inset-0 w-full h-full" in:fly={{ x: 1200, duration: 600 }} out:fly={{ x: 1200, duration: 600 }}>
			<HeroV2 bind:data {editContext} {isEditable} />
		</div>
	{:else}
		<div class="absolute inset-0 w-full h-full" in:fly={{ x: -1200, duration: 600 }} out:fly={{ x: -1200, duration: 600 }}>
			<HeroV1 bind:data {editContext} {isEditable} />
		</div>
	{/if}
</div>




