<script lang="ts">
	import { untrack } from 'svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import V1 from './v1/EquipmentCTA.svelte';
	import V2 from './v2/EquipmentCTA.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentId = null
	}: PageComponentProps = $props();

	// VersionSwitcher синхронизирует последующие изменения данных.
	let selectedVersion = $state(untrack(() => data?.equipmentCTAVersion) ?? 'v1');
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class={['relative', { 'opacity-40': selectedVersion === 'disabled' }]}>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="EquipmentCTA"
			resetId={componentId}
			versions={['v1', 'v2']}
			themeVersions={['v2']}
			themeDefault="dark"
			title="Консультация по комплектации"
			bind:selectedVersion
		/>
		{#if selectedVersion === 'v2'}
			<V2 bind:data {editContext} {isEditable} />
		{:else}
			<V1 bind:data {editContext} {isEditable} />
		{/if}
	</div>
{/if}
