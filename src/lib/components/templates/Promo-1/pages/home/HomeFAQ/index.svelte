<script lang="ts">
	import HomeFAQV1 from './v1/HomeFAQ.svelte';
	import HomeFAQV2 from './v2/HomeFAQ.svelte';
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

	// Инициализация из данных нужна для SSR и пререндера каталога.
	// svelte-ignore state_referenced_locally — последующую синхронизацию выполняет VersionSwitcher.
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.homeFAQVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class="relative w-full" class:opacity-40={selectedVersion === 'disabled'}>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="HomeFAQ"
			versionKey="homeFAQVersion"
			versions={['v1', 'v2']}
			themeVersions={['v1', 'v2']}
			themeDefault="light"
			title="Частые вопросы"
			bind:selectedVersion
		/>

		{#if selectedVersion === 'v2'}
			<HomeFAQV2 bind:data {editContext} {isEditable} />
		{:else}
			<HomeFAQV1 bind:data {editContext} {isEditable} />
		{/if}
	</div>
{/if}
