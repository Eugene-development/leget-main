<script lang="ts">
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { fly } from 'svelte/transition';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentType,
		versionKey = null,
		selectedVersion = $bindable()
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		componentType: string;
		versionKey?: string | null;
		selectedVersion: 'v1' | 'v2';
	} = $props();

	const actualVersionKey = $derived(
		versionKey ?? 
		(componentType === 'HeroMain' 
			? 'heroVersion' 
			: `${componentType.charAt(0).toLowerCase() + componentType.slice(1)}Version`)
	);

	let hasManuallySelected = $state(false);
	let isOpen = $state(false);

	async function selectVersion(version: 'v1' | 'v2') {
		if (version === selectedVersion) return;
		selectedVersion = version;
		hasManuallySelected = true;
		if (!editContext) return;
		
		const updated = { ...data, [actualVersionKey]: version };
		try {
			await saveComponentData(editContext, componentType, updated);
			data = updated;
		} catch (err) {
			console.error(`Ошибка сохранения версии для ${componentType}:`, err);
		}
	}

	// Синхронизация из внешних данных
	$effect(() => {
		const ver = (data?.[actualVersionKey] as 'v1' | 'v2') ?? 'v1';
		if (!hasManuallySelected && ver !== selectedVersion) {
			selectedVersion = ver;
		}
	});
</script>

{#if isEditable && editContext}
	<div class="absolute top-6 right-6 z-[100] select-none font-sans">
		<!-- Кнопка-триггер меню -->
		<button
			type="button"
			class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-950/75 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:border-white/25 active:scale-95 transition-all duration-300 shadow-2xl cursor-pointer backdrop-blur-xl"
			onclick={() => isOpen = !isOpen}
		>
			<span>Варианты</span>
			<svg class="w-3 h-3 transition-transform duration-300 {isOpen ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<!-- Прозрачный фон для закрытия меню при клике в любое другое место -->
		{#if isOpen}
			<button 
				type="button" 
				tabindex="-1"
				class="fixed inset-0 z-40 w-full h-full bg-transparent cursor-default outline-none" 
				onclick={() => isOpen = false}
				aria-label="Закрыть меню"
			></button>
		{/if}

		<!-- Выпадающий список вариантов с анимацией -->
		{#if isOpen}
			<div 
				class="absolute right-0 top-12 z-50 w-44 rounded-2xl border border-white/10 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-2xl flex flex-col gap-1"
				transition:fly={{ y: -10, duration: 200 }}
			>
				<button
					type="button"
					class="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer {selectedVersion === 'v1' ? 'bg-white/15 text-white border border-white/20 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}"
					onclick={() => { selectVersion('v1'); isOpen = false; }}
				>
					Вариант 1
				</button>
				<button
					type="button"
					class="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer {selectedVersion === 'v2' ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-200 border border-sky-500/30 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}"
					onclick={() => { selectVersion('v2'); isOpen = false; }}
				>
					Вариант 2
				</button>
			</div>
		{/if}
	</div>
{/if}
