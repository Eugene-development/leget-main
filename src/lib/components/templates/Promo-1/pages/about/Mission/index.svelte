<script lang="ts">
	import MissionV1 from './v1/Mission.svelte';
	import MissionV2 from './v2/Mission.svelte';
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
	// Начальное значение нужно и SSR; VersionSwitcher синхронизирует дальнейшие изменения.
	// svelte-ignore state_referenced_locally
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.missionVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class="relative" class:opacity-40={selectedVersion === 'disabled'}>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="Mission"
			versionKey="missionVersion"
			versions={['v1', 'v2']}
			themeVersions={['v1', 'v2']}
			themeDefault="light"
			title="Наша миссия"
			bind:selectedVersion
		/>
		{#if selectedVersion === 'v2'}
			<MissionV2 bind:data {editContext} {isEditable} />
		{:else}
			<MissionV1 bind:data {editContext} {isEditable} />
		{/if}
	</div>
{/if}
