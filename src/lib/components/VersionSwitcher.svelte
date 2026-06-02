<script lang="ts">
	import { saveComponentData, deleteComponentData, type EditContext } from '$lib/utils/page-edit';
	import { invalidateAll } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentType,
		versionKey = null,
		selectedVersion = $bindable(),
		versions = ['v1', 'v2']
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		componentType: string;
		versionKey?: string | null;
		selectedVersion: any;
		versions?: ('v1' | 'v2' | 'v3' | 'v4')[];
	} = $props();

	const actualVersionKey = $derived(
		versionKey ?? 
		(componentType === 'HeroMain' 
			? 'heroVersion' 
			: `${componentType.charAt(0).toLowerCase() + componentType.slice(1)}Version`)
	);

	let hasManuallySelected = $state(false);
	let isOpen = $state(false);

	async function selectVersion(version: 'v1' | 'v2' | 'v3' | 'v4' | 'disabled') {
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
		const ver = (data?.[actualVersionKey] as 'v1' | 'v2' | 'v3' | 'v4' | 'disabled') ?? 'v1';
		if (!hasManuallySelected && ver !== selectedVersion) {
			selectedVersion = ver;
		}
	});

	let isResetting = $state(false);
	let showConfirmModal = $state(false);

	const isLight = $derived(data?.theme === 'light');

	async function toggleTheme() {
		if (!editContext) return;
		const updated = { ...data, theme: isLight ? 'dark' : 'light' };
		try {
			await saveComponentData(editContext, 'HeroMain', updated);
			data = updated;
		} catch (err) {
			console.error(`Ошибка сохранения темы для HeroMain:`, err);
		}
	}

	function handleReset() {
		if (!editContext || !data?._componentId) return;
		showConfirmModal = true;
	}

	async function confirmReset() {
		if (!editContext || !data?._componentId || isResetting) return;
		isResetting = true;
		try {
			await deleteComponentData(editContext, data._componentId as string);
			showConfirmModal = false;
			await invalidateAll();
		} catch (err) {
			console.error(`Ошибка при сбросе контента блока:`, err);
			alert(err instanceof Error ? err.message : 'Не удалось сбросить контент');
		} finally {
			isResetting = false;
		}
	}
</script>

{#if isEditable && editContext}
	<div class="absolute top-6 right-6 z-[100] select-none font-sans-premium flex items-center gap-2">
		{#if componentType === 'HeroMain' && (selectedVersion === 'v2' || selectedVersion === 'v3' || selectedVersion === 'v4')}
			<!-- Кнопка переключения темы -->
			<button
				type="button"
				class="relative flex h-[38px] w-[68px] items-center rounded-full border p-[3px] transition-all duration-300 shadow-2xl cursor-pointer backdrop-blur-xl active:scale-98 {isLight ? 'bg-slate-200/60 border-slate-300/80 hover:border-slate-400/80' : 'bg-slate-950/75 border-white/10 hover:border-white/20'}"
				onclick={toggleTheme}
				aria-label={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
				title={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
			>
				<!-- Подложка иконок для наглядности (показывает куда переключать) -->
				<span class="absolute left-2.5 flex items-center justify-center pointer-events-none opacity-40">
					<!-- Sun icon on the left (inactive state in light mode) -->
					<svg class="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
					</svg>
				</span>
				<span class="absolute right-2.5 flex items-center justify-center pointer-events-none opacity-40">
					<!-- Moon icon on the right (inactive state in dark mode) -->
					<svg class="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
					</svg>
				</span>

				<!-- Подвижный переключатель (Thumb) -->
				<span
					class="flex h-[30px] w-[30px] items-center justify-center rounded-full shadow-lg transition-transform duration-300 ease-out {isLight ? 'translate-x-[30px] bg-white text-indigo-600 shadow-indigo-500/10' : 'translate-x-0 bg-slate-900 text-amber-400 shadow-amber-500/20'}"
				>
					{#if isLight}
						<!-- Moon icon active -->
						<svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
						</svg>
					{:else}
						<!-- Sun icon active -->
						<svg class="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
						</svg>
					{/if}
				</span>
			</button>
		{/if}

		<!-- Контейнер для кнопки Варианты и выпадающего списка -->
		<div class="relative">
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
					class="absolute left-0 top-12 z-50 w-44 rounded-2xl border border-white/10 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-2xl flex flex-col gap-1"
					transition:fly={{ y: -10, duration: 200 }}
				>
					{#each versions as ver}
						{#if ver === 'v1'}
							<button
								type="button"
								class="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer {selectedVersion === 'v1' ? 'bg-white/15 text-white border border-white/20 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}"
								onclick={() => { selectVersion('v1'); isOpen = false; }}
							>
								Вариант 1
							</button>
						{:else if ver === 'v2'}
							<button
								type="button"
								class="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer {selectedVersion === 'v2' ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-200 border border-sky-500/30 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}"
								onclick={() => { selectVersion('v2'); isOpen = false; }}
							>
								Вариант 2
							</button>
						{:else if ver === 'v3'}
							<button
								type="button"
								class="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer {selectedVersion === 'v3' ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-200 border border-violet-500/30 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}"
								onclick={() => { selectVersion('v3'); isOpen = false; }}
							>
								Вариант 3
							</button>
						{:else if ver === 'v4'}
							<button
								type="button"
								class="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer {selectedVersion === 'v4' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 border border-emerald-500/30 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}"
								onclick={() => { selectVersion('v4'); isOpen = false; }}
							>
								Вариант 4
							</button>
						{/if}
					{/each}

					<!-- Кнопка отключения блока -->
					<button
						type="button"
						class="w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer {selectedVersion === 'disabled' ? 'bg-red-500/20 text-red-200 border border-red-500/30 shadow-md scale-[1.02]' : 'text-slate-400 hover:text-red-400 hover:bg-red-500/5 border border-transparent'}"
						onclick={() => { selectVersion('disabled'); isOpen = false; }}
					>
						Отключить
					</button>
				</div>
			{/if}
		</div>

		<!-- Кнопка сброса контента (только если компонент изменен) -->
		{#if data?._componentId}
			<button
				type="button"
				class="px-4 py-2.5 rounded-2xl bg-slate-950/75 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-950/80 hover:border-red-500/30 hover:text-red-200 active:scale-95 transition-all duration-300 shadow-2xl cursor-pointer backdrop-blur-xl"
				onclick={handleReset}
				disabled={isResetting}
			>
				<span>{isResetting ? 'Сброс...' : 'Сброс'}</span>
			</button>
		{/if}
	</div>
{/if}

{#if showConfirmModal}
	<div 
		class="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop click to close -->
		<button 
			type="button" 
			class="absolute inset-0 w-full h-full bg-transparent cursor-default outline-none border-none" 
			onclick={() => showConfirmModal = false}
			aria-label="Закрыть"
		></button>

		<!-- Modal Card -->
		<div 
			class="relative z-10 max-w-md w-full rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl flex flex-col items-center gap-5 text-center font-sans-premium"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Warning Icon Container with subtle red glow -->
			<div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-pulse">
				<svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
				</svg>
			</div>

			<!-- Typography -->
			<div class="flex flex-col gap-2">
				<h3 class="text-lg font-extrabold tracking-tight text-white uppercase">
					Сбросить изменения?
				</h3>
				<p class="text-xs text-slate-400 leading-relaxed font-medium">
					Вы уверены, что хотите сбросить контент блока 
					<span class="text-slate-200 font-bold">"{componentType}"</span> 
					к начальному состоянию? Все ваши изменения будут безвозвратно удалены.
				</p>
			</div>

			<!-- Buttons Row -->
			<div class="flex items-center gap-3 w-full mt-2">
				<button
					type="button"
					class="flex-1 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 active:scale-98 transition-all duration-300 cursor-pointer"
					onclick={() => showConfirmModal = false}
				>
					Отмена
				</button>
				<button
					type="button"
					class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 hover:shadow-lg hover:shadow-red-600/20 active:scale-98 transition-all duration-300 cursor-pointer"
					onclick={confirmReset}
					disabled={isResetting}
				>
					{isResetting ? 'Сброс...' : 'Да, сбросить'}
				</button>
			</div>
		</div>
	</div>
{/if}
