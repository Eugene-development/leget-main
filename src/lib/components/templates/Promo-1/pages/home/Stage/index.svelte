<script lang="ts">
	import StageV1 from './v1/Stage.svelte';
	import StageV2 from './v2/Stage.svelte';
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

	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>('v1');
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div
		class="relative w-full overflow-hidden {selectedVersion === 'disabled'
			? 'opacity-40 grayscale'
			: ''}"
	>
		<!-- Встраиваемый переключатель версий -->
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="Stage"
			versionKey="stageVersion"
			themeVersions={['v2']}
			themeDefault="dark"
			title="Этапы работы"
			bind:selectedVersion
		/>

		{#if selectedVersion === 'disabled'}
			<!-- Информационная плашка "Компонент отключен" -->
			<div
				class="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]"
			>
				<div
					class="mx-4 flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-red-500/30 bg-slate-900/90 px-6 py-4 text-center shadow-2xl select-none"
				>
					<div
						class="flex items-center gap-2 text-xs font-bold tracking-wider text-red-400 uppercase"
					>
						<span class="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500"></span>
						Блок отключен
					</div>
					<p class="text-[11px] font-medium text-slate-400">
						Этот блок не будет отображаться для обычных (не авторизованных) пользователей.
					</p>
				</div>
			</div>
		{/if}

		<!-- Динамический рендеринг выбранного компонента с эффектом слайдера -->
		{#if selectedVersion === 'v2'}
			<div class="w-full" in:fly={{ x: 1200, duration: 600 }} out:fly={{ x: 1200, duration: 600 }}>
				<StageV2 bind:data {editContext} {isEditable} />
			</div>
		{:else}
			<div
				class="w-full"
				in:fly={{ x: -1200, duration: 600 }}
				out:fly={{ x: -1200, duration: 600 }}
			>
				<StageV1 bind:data {editContext} {isEditable} />
			</div>
		{/if}
	</div>
{/if}
