<script lang="ts">
	import MebelProcessV1 from './v1/MebelProcess.svelte';
	import MebelProcessV2 from './v2/MebelProcess.svelte';
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

	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных.
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.mebelProcessVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div
		class="relative w-full overflow-hidden {selectedVersion === 'disabled'
			? 'opacity-40 grayscale'
			: ''}"
	>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="MebelProcess"
			versionKey="mebelProcessVersion"
			versions={['v1', 'v2']}
			themeVersions={['v2']}
			themeDefault="light"
			title="Как мы работаем"
			bind:selectedVersion
		/>

		{#if selectedVersion === 'disabled'}
			<div
				class="absolute inset-0 z-40 flex items-center justify-center bg-ink-950/20 backdrop-blur-[2px]"
			>
				<div
					class="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-brand-500/30 bg-ink-900/90 px-6 py-4 text-center shadow-2xl select-none"
				>
					<div
						class="flex items-center gap-2 text-xs font-bold tracking-wider text-brand-400 uppercase"
					>
						<span class="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500"></span>
						Блок отключен
					</div>
					<p class="text-[11px] font-medium text-ink-400">
						Этот блок не будет отображаться для обычных (не авторизованных) пользователей.
					</p>
				</div>
			</div>
		{/if}

		{#if selectedVersion === 'v2'}
			<div class="w-full" in:fly={{ x: 1200, duration: 600 }} out:fly={{ x: 1200, duration: 600 }}>
				<MebelProcessV2 bind:data {editContext} {isEditable} />
			</div>
		{:else}
			<div
				class="w-full"
				in:fly={{ x: -1200, duration: 600 }}
				out:fly={{ x: -1200, duration: 600 }}
			>
				<MebelProcessV1 bind:data {editContext} {isEditable} />
			</div>
		{/if}
	</div>
{/if}
