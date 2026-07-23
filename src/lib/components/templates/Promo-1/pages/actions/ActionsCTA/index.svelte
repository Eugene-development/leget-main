<script lang="ts">
	import ActionsCTAV1 from './v1/ActionsCTA.svelte';
	import ActionsCTAV2 from './v2/ActionsCTA.svelte';
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
	<div class="relative w-full overflow-hidden {selectedVersion === 'disabled' ? 'opacity-40 grayscale' : ''}">
		<!-- Встраиваемый переключатель версий -->
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="ActionsCTA"
			versionKey="actionsCTAVersion"
			bind:selectedVersion
		/>

		{#if selectedVersion === 'disabled'}
			<!-- Информационная плашка "Компонент отключен" -->
			<div class="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]">
				<div class="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-slate-900/90 border border-red-500/30 shadow-2xl text-center select-none max-w-sm mx-4">
					<div class="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
						<span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
						Блок отключен
					</div>
					<p class="text-[11px] text-slate-400 font-medium">Этот блок не будет отображаться для обычных (не авторизованных) пользователей.</p>
				</div>
			</div>
		{/if}

		<!-- Динамический рендеринг выбранного компонента с эффектом слайдера -->
		{#if selectedVersion === 'v2'}
			<div class="w-full" in:fly={{ x: 1200, duration: 600 }} out:fly={{ x: 1200, duration: 600 }}>
				<ActionsCTAV2 bind:data {editContext} {isEditable} />
			</div>
		{:else}
			<div class="w-full" in:fly={{ x: -1200, duration: 600 }} out:fly={{ x: -1200, duration: 600 }}>
				<ActionsCTAV1 bind:data {editContext} {isEditable} />
			</div>
		{/if}
	</div>
{/if}
