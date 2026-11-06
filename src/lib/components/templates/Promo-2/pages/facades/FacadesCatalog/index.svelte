<script lang="ts">
	import V1 from './v1/FacadesCatalog.svelte';
	import V2 from './v2/FacadesCatalog.svelte';
	import V3 from './v3/FacadesCatalog.svelte';
	import V4 from './v4/FacadesCatalog.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
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
	// svelte-ignore state_referenced_locally — VersionSwitcher синхронизирует дальнейшие изменения.
	let selectedVersion = $state<'v1' | 'v2' | 'v3' | 'v4' | 'disabled'>(
		(data?.facadesCatalogVersion as 'v1' | 'v2' | 'v3' | 'v4' | 'disabled') ?? 'v1'
	);
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class="relative w-full" class:opacity-40={selectedVersion === 'disabled'}>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="FacadesCatalog"
			versionKey="facadesCatalogVersion"
			versions={['v1', 'v2', 'v3', 'v4']}
			themeVersions={['v2', 'v3', 'v4']}
			title="Коллекция фасадов"
			bind:selectedVersion
		/>
		{#if selectedVersion === 'v2'}<V2 bind:data {editContext} {isEditable} />
		{:else if selectedVersion === 'v3'}<V3 bind:data {editContext} {isEditable} />
		{:else if selectedVersion === 'v4'}<V4 bind:data {editContext} {isEditable} />
		{:else}<V1 bind:data {editContext} {isEditable} />{/if}
	</div>
{/if}
