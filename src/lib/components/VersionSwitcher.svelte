<script lang="ts">
	import {
		saveComponentData,
		deleteComponentData,
		fetchComponentArticle,
		type EditContext,
		type ComponentVariantArticle
	} from '$lib/utils/page-edit';
	import { invalidateAll } from '$app/navigation';
	import { browser } from '$app/environment';
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
		if (!editContext) {
			selectedVersion = version;
			hasManuallySelected = true;
			return;
		}
		const prevVersion = selectedVersion;
		const prevData = data;
		selectedVersion = version;
		hasManuallySelected = true;
		// Оптимистичное обновление: компонент переключается мгновенно, не дожидаясь
		// ответа сервера. На ошибке откатываем и свитчер, и данные (раньше
		// расхождение «залечивалось» invalidateAll — теперь refetch убран).
		const updated = { ...data, [actualVersionKey]: version };
		data = updated;
		try {
			await saveComponentData(editContext, componentType, updated);
		} catch (err) {
			selectedVersion = prevVersion;
			data = prevData;
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

	// Артикул компонента из глобального каталога (template.page.component.version).
	let articleVariants = $state<ComponentVariantArticle[]>([]);
	let articleLoaded = $state(false);
	let showArticleHint = $state(false);

	// Десктоп (есть hover) — раскрываем по наведению. Тач-устройства — по клику:
	// первый тап открывает, повторный — закрывает.
	let canHover = $state(true);
	$effect(() => {
		if (!browser) return;
		const mq = window.matchMedia('(hover: hover)');
		canHover = mq.matches;
		const update = () => (canHover = mq.matches);
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	// 'v1'..'v4' → 1..4; 'disabled'/unknown → null (артикул не показывается).
	const versionNumber = (v: unknown): number | null => {
		const m = /^v([1-4])$/.exec(typeof v === 'string' ? v : '');
		return m ? Number(m[1]) : null;
	};

	const activeArticle = $derived.by(() => {
		const vn = versionNumber(selectedVersion);
		if (vn === null) return null;
		return articleVariants.find((v) => v.version === vn)?.article ?? null;
	});

	const TEMPLATE_NAMES: Record<number, string> = { 1: 'Promo-1', 2: 'Promo-2', 3: 'Promo-3' };

	// Сегменты артикула для подсказки при наведении.
	const articleSegments = $derived.by(() => {
		if (!activeArticle) return null;
		const p = activeArticle.split('.');
		if (p.length !== 4) return null;
		return { template: p[0], page: p[1], component: p[2], version: p[3] };
	});

	$effect(() => {
		const tid = editContext?.templateId ?? null;
		const slug = editContext?.slug ?? null;
		if (!editContext || tid === null || !slug || articleLoaded) return;
		articleLoaded = true;
		fetchComponentArticle(tid, slug, componentType)
			.then((res) => {
				articleVariants = res?.variants ?? [];
			})
			.catch(() => {
				articleVariants = [];
			});
	});

	const isLight = $derived(data?.theme === 'light');

	async function toggleTheme() {
		if (!editContext) return;
		// Оптимистичное обновление: переключаем тему мгновенно, не дожидаясь
		// ответа сервера. Раньше data менялся только после saveComponentData
		// (сетевой запрос + invalidateAll), из-за чего свитчер и сам блок
		// «зависали» на 3–5 секунд. data — bindable и связан с HeroMain,
		// поэтому и свитчер, и компонент обновляются сразу.
		const previous = data;
		const updated = { ...data, theme: isLight ? 'dark' : 'light' };
		data = updated;
		try {
			await saveComponentData(editContext, 'HeroMain', updated);
		} catch (err) {
			data = previous; // откатываем тему при ошибке сохранения
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
	<div class="font-sans-premium absolute top-6 right-6 z-[100] flex items-center gap-2 select-none">
		{#if activeArticle}
			<button
				type="button"
				class="relative flex cursor-default items-center rounded-2xl border border-white/10 bg-slate-950 px-3 py-2.5 font-mono text-[11px] font-semibold tracking-wider text-white shadow-2xl"
				onmouseenter={() => canHover && (showArticleHint = true)}
				onmouseleave={() => canHover && (showArticleHint = false)}
				onclick={() => !canHover && (showArticleHint = !showArticleHint)}
				aria-expanded={showArticleHint}
				aria-label="Артикул {activeArticle}"
			>
				{activeArticle}
				{#if showArticleHint && articleSegments}
					<!-- Расшифровка сегментов артикула: TEMPLATE.PAGE.COMPONENT.VERSION -->
					<div
						class="absolute top-full left-0 z-[200] mt-2 w-64 rounded-2xl border border-white/10 bg-slate-950 p-3 font-sans shadow-2xl"
						role="tooltip"
						transition:fade={{ duration: 120 }}
					>
						<div class="mb-2 flex items-center justify-between gap-2 border-b border-white/10 pb-2">
							<span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase"
								>Артикул</span
							>
							<span class="font-mono text-[12px] font-bold text-white">{activeArticle}</span>
						</div>
						<ul class="flex flex-col gap-1.5 text-[11px] leading-tight">
							<li class="flex items-baseline gap-2">
								<span class="w-3 text-center font-mono font-bold text-emerald-300"
									>{articleSegments.template}</span
								>
								<span class="text-slate-300"
									>Шаблон{#if TEMPLATE_NAMES[Number(articleSegments.template)]}<span
											class="text-slate-500"
										>
											({TEMPLATE_NAMES[Number(articleSegments.template)]})</span
										>{/if}</span
								>
							</li>
							<li class="flex items-baseline gap-2">
								<span class="w-3 text-center font-mono font-bold text-sky-300"
									>{articleSegments.page}</span
								>
								<span class="text-slate-300"
									>Страница{#if editContext?.slug}<span class="text-slate-500">
											({editContext.slug})</span
										>{/if}</span
								>
							</li>
							<li class="flex items-baseline gap-2">
								<span class="w-3 text-center font-mono font-bold text-violet-300"
									>{articleSegments.component}</span
								>
								<span class="text-slate-300"
									>Компонент{#if componentType}<span class="text-slate-500">
											({componentType})</span
										>{/if}</span
								>
							</li>
							<li class="flex items-baseline gap-2">
								<span class="w-3 text-center font-mono font-bold text-amber-300"
									>{articleSegments.version}</span
								>
								<span class="text-slate-300"
									>Версия компонента<span class="text-slate-500">
										(v{articleSegments.version})</span
									></span
								>
							</li>
						</ul>
					</div>
				{/if}
			</button>
		{/if}
		{#if componentType === 'HeroMain' && (selectedVersion === 'v2' || selectedVersion === 'v3' || selectedVersion === 'v4')}
			<!-- Кнопка переключения темы -->
			<button
				type="button"
				class="order-first relative flex h-[38px] w-[68px] cursor-pointer items-center rounded-full border p-[3px] shadow-2xl backdrop-blur-xl transition-all duration-300 active:scale-98 {isLight
					? 'border-slate-300/80 bg-slate-200/60 hover:border-slate-400/80'
					: 'border-white/10 bg-slate-950/75 hover:border-white/20'}"
				onclick={toggleTheme}
				aria-label={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
				title={isLight ? 'Включить тёмную тему' : 'Включить светлую тему'}
			>
				<!-- Подложка иконок для наглядности (показывает куда переключать) -->
				<span
					class="pointer-events-none absolute left-2.5 flex items-center justify-center opacity-40"
				>
					<!-- Sun icon on the left (inactive state in light mode) -->
					<svg
						class="h-3.5 w-3.5 text-amber-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
						/>
					</svg>
				</span>
				<span
					class="pointer-events-none absolute right-2.5 flex items-center justify-center opacity-40"
				>
					<!-- Moon icon on the right (inactive state in dark mode) -->
					<svg
						class="h-3.5 w-3.5 text-indigo-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2.5"
							d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
						/>
					</svg>
				</span>

				<!-- Подвижный переключатель (Thumb) -->
				<span
					class="flex h-[30px] w-[30px] items-center justify-center rounded-full shadow-lg transition-transform duration-300 ease-out {isLight
						? 'translate-x-[30px] bg-white text-indigo-600 shadow-indigo-500/10'
						: 'translate-x-0 bg-slate-900 text-amber-400 shadow-amber-500/20'}"
				>
					{#if isLight}
						<!-- Moon icon active -->
						<svg
							class="h-4 w-4 text-indigo-600"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
							/>
						</svg>
					{:else}
						<!-- Sun icon active -->
						<svg
							class="h-4 w-4 text-amber-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
							/>
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
				class="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/25 active:scale-95"
				onclick={() => (isOpen = !isOpen)}
			>
				<span>Варианты</span>
				<svg
					class="h-3 w-3 transition-transform duration-300 {isOpen ? 'rotate-180' : ''}"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2.5"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			<!-- Прозрачный фон для закрытия меню при клике в любое другое место -->
			{#if isOpen}
				<button
					type="button"
					tabindex="-1"
					class="fixed inset-0 z-40 h-full w-full cursor-default bg-transparent outline-none"
					onclick={() => (isOpen = false)}
					aria-label="Закрыть меню"
				></button>
			{/if}

			<!-- Выпадающий список вариантов с анимацией -->
			{#if isOpen}
				<div
					class="absolute top-12 left-0 z-50 flex w-44 flex-col gap-1 rounded-2xl border border-white/10 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-2xl"
					transition:fly={{ y: -10, duration: 200 }}
				>
					{#each versions as ver}
						{#if ver === 'v1'}
							<button
								type="button"
								class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
								'v1'
									? 'scale-[1.02] border border-white/20 bg-white/15 text-white shadow-md'
									: 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}"
								onclick={() => {
									selectVersion('v1');
									isOpen = false;
								}}
							>
								Вариант 1
							</button>
						{:else if ver === 'v2'}
							<button
								type="button"
								class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
								'v2'
									? 'scale-[1.02] border border-sky-500/30 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-200 shadow-md'
									: 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}"
								onclick={() => {
									selectVersion('v2');
									isOpen = false;
								}}
							>
								Вариант 2
							</button>
						{:else if ver === 'v3'}
							<button
								type="button"
								class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
								'v3'
									? 'scale-[1.02] border border-violet-500/30 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-200 shadow-md'
									: 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}"
								onclick={() => {
									selectVersion('v3');
									isOpen = false;
								}}
							>
								Вариант 3
							</button>
						{:else if ver === 'v4'}
							<button
								type="button"
								class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
								'v4'
									? 'scale-[1.02] border border-emerald-500/30 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-200 shadow-md'
									: 'border border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'}"
								onclick={() => {
									selectVersion('v4');
									isOpen = false;
								}}
							>
								Вариант 4
							</button>
						{/if}
					{/each}

					<!-- Кнопка отключения блока -->
					<button
						type="button"
						class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-[10px] font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
						'disabled'
							? 'scale-[1.02] border border-red-500/30 bg-red-500/20 text-red-200 shadow-md'
							: 'border border-transparent text-slate-400 hover:bg-red-500/5 hover:text-red-400'}"
						onclick={() => {
							selectVersion('disabled');
							isOpen = false;
						}}
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
				class="cursor-pointer rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-red-500/30 hover:bg-red-950/80 hover:text-red-200 active:scale-95"
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
		class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop click to close -->
		<button
			type="button"
			class="absolute inset-0 h-full w-full cursor-default border-none bg-transparent outline-none"
			onclick={() => (showConfirmModal = false)}
			aria-label="Закрыть"
		></button>

		<!-- Modal Card -->
		<div
			class="font-sans-premium relative z-10 flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-white/10 bg-slate-900/95 p-6 text-center shadow-2xl backdrop-blur-2xl"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Warning Icon Container with subtle red glow -->
			<div
				class="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
			>
				<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			<!-- Typography -->
			<div class="flex flex-col gap-2">
				<h3 class="text-lg font-extrabold tracking-tight text-white uppercase">
					Сбросить изменения?
				</h3>
				<p class="text-xs leading-relaxed font-medium text-slate-400">
					Вы уверены, что хотите сбросить контент блока
					<span class="font-bold text-slate-200">"{componentType}"</span>
					к начальному состоянию? Все изменения будут безвозвратно удалены.
				</p>
			</div>

			<!-- Buttons Row -->
			<div class="mt-2 flex w-full items-center gap-3">
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all duration-300 hover:bg-white/10 active:scale-98"
					onclick={() => (showConfirmModal = false)}
				>
					Отмена
				</button>
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 hover:brightness-110 active:scale-98"
					onclick={confirmReset}
					disabled={isResetting}
				>
					{isResetting ? 'Сброс...' : 'Да, сбросить'}
				</button>
			</div>
		</div>
	</div>
{/if}
