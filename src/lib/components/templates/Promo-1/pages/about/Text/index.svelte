<script lang="ts">
	import TextV1 from './v1/Text.svelte';
	import TextV2 from './v2/Text.svelte';
	import TextV3 from './v3/Text.svelte';
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
	let selectedVersion = $state<'v1' | 'v2' | 'v3' | 'disabled'>(
		(data?.textVersion as 'v1' | 'v2' | 'v3' | 'disabled') ?? 'v1'
	);
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class="relative" class:opacity-40={selectedVersion === 'disabled'}>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="Text"
			versionKey="textVersion"
			versions={['v1', 'v2', 'v3']}
			themeVersions={['v1', 'v2', 'v3']}
			themeDefault="light"
			title="О компании"
			bind:selectedVersion
		/>
		{#if selectedVersion === 'v2'}
			<TextV2 bind:data {editContext} {isEditable} />
		{:else if selectedVersion === 'v3'}
			<TextV3 bind:data {editContext} {isEditable} />
		{:else}
			<TextV1 bind:data {editContext} {isEditable} />
		{/if}
	</div>
{/if}
