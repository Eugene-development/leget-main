<script lang="ts">
	import { untrack } from 'svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import V1 from './v1/EquipmentAppliances.svelte';
	import V2 from './v2/EquipmentAppliances.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentId = null
	}: PageComponentProps = $props();

	// VersionSwitcher синхронизирует последующие изменения данных.
	let selectedVersion = $state(untrack(() => data?.equipmentAppliancesVersion) ?? 'v1');
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class={['relative', { 'opacity-40': selectedVersion === 'disabled' }]}>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="EquipmentAppliances"
			resetId={componentId}
			versions={['v1', 'v2']}
			themeVersions={['v2']}
			themeDefault="light"
			title="Бытовая техника"
			bind:selectedVersion
		/>
		{#if selectedVersion === 'v2'}
			<V2 bind:data {editContext} {isEditable} />
		{:else}
			<V1 bind:data {editContext} {isEditable} />
		{/if}
	</div>
{/if}
