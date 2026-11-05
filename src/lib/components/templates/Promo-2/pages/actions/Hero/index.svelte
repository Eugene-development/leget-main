<script lang="ts">
	import HeroV1 from './v1/Hero.svelte';
	import HeroV2 from './v2/Hero.svelte';
	import HeroV3 from './v3/Hero.svelte';
	import HeroV4 from './v4/Hero.svelte';
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
		(data?.heroVersion as 'v1' | 'v2' | 'v3' | 'v4' | 'disabled') ?? 'v1'
	);
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class="relative w-full" class:opacity-40={selectedVersion === 'disabled'}>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="Hero"
			versionKey="heroVersion"
			versions={['v1', 'v2', 'v3', 'v4']}
			themeVersions={['v2', 'v3', 'v4']}
			themeDefault="light"
			title="Акции — первый экран"
			bind:selectedVersion
		/>
		{#if selectedVersion === 'v4'}
			<HeroV4 bind:data {editContext} {isEditable} />
		{:else if selectedVersion === 'v3'}
			<HeroV3 bind:data {editContext} {isEditable} />
		{:else if selectedVersion === 'v2'}
			<HeroV2 bind:data {editContext} {isEditable} />
		{:else}
			<HeroV1 bind:data {editContext} {isEditable} />
		{/if}
	</div>
{/if}
