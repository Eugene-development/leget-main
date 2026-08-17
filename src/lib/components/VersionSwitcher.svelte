<script lang="ts">
	import {
		saveComponentData,
		deleteComponentData,
		fetchComponentArticle,
		type EditContext,
		type ComponentVariantArticle
	} from '$lib/utils/page-edit';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import ComponentSettingsDrawer from '$lib/components/ComponentSettingsDrawer.svelte';
	import { createThemeToggle, isLightBlock, type BlockTheme } from '$lib/utils/block-theme';
	import { legacyVersionsFor } from '$lib/components/lifecycle';
	import { invalidateAll } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentType,
		versionKey = null,
		resetId = null,
		selectedVersion = $bindable(),
		versions = ['v1', 'v2'],
		showVersionMenu = true,
		themeVersions = [],
		themeDefault = 'light',
		title = '',
		placement = 'overlay'
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		componentType: string;
		versionKey?: string | null;
		/** Fallback id строки page_components, если `_componentId` ещё не попал в data. */
		resetId?: string | null;
		selectedVersion: any;
		versions?: ('v1' | 'v2' | 'v3' | 'v4')[];
		/** Показывать выбор варианта. Для одноверсионных блоков остаётся только панель настроек. */
		showVersionMenu?: boolean;
		/** Версии, у которых есть светлая/тёмная тема. Пусто — тумблер не показывается. */
		themeVersions?: ('v1' | 'v2' | 'v3' | 'v4')[];
		/** Тема блока по умолчанию, когда `data.theme` не задан. */
		themeDefault?: BlockTheme;
		/** Человекочитаемое имя блока для панели настроек. По умолчанию — тип компонента. */
		title?: string;
		/** Overlay поверх секции либо inline внутри собственного тулбара компонента. */
		placement?: 'overlay' | 'inline';
	} = $props();

	const actualVersionKey = $derived(
		versionKey ??
			(componentType === 'HeroMain'
				? 'heroVersion'
				: `${componentType.charAt(0).toLowerCase() + componentType.slice(1)}Version`)
	);
	const actualResetId = $derived(
		(typeof data?._componentId === 'string' ? data._componentId : null) ?? resetId
	);

	// Вывод версий из обращения. Выведенные не предлагаются в меню, но остаются
	// выбранными и продолжают рендериться — ветка рендера живёт в `<Тип>/index.svelte`
	// и об этом списке не знает. Разница между «не предлагается» и «не работает»
	// и есть весь смысл статуса legacy; см. docs/architecture/component-lifecycle.md.
	const legacyVersions = $derived(legacyVersionsFor(editContext?.templateId, componentType));
	const offeredVersions = $derived(versions.filter((ver) => !legacyVersions.includes(ver)));
	/** Тенант сидит на выведенной версии — ему показываем предложение перейти. */
	const onLegacyVersion = $derived(legacyVersions.includes(selectedVersion));

	let hasManuallySelected = $state(false);
	let isOpen = $state(false);
	let drawerOpen = $state(false);

	// Последний включённый вариант — чтобы кнопка в панели настроек работала как
	// переключатель: «Отключить» → 'disabled', «Включить» → вернуть этот вариант.
	let lastEnabledVersion = $state<'v1' | 'v2' | 'v3' | 'v4'>('v1');
	$effect(() => {
		if (selectedVersion && selectedVersion !== 'disabled') {
			lastEnabledVersion = selectedVersion;
		}
	});

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
	let componentArticle = $state<string | null>(null);
	// Сознательно не $state: флаг читается внутри эффекта-загрузчика, и реактивная
	// запись перезапускала бы его же (при сбросе флага после неудачи — бесконечно).
	let articleLoaded = false;

	// 'v1'..'v4' → 1..4; 'disabled'/unknown → null (артикул не показывается).
	const versionNumber = (v: unknown): number | null => {
		const m = /^v([1-4])$/.exec(typeof v === 'string' ? v : '');
		return m ? Number(m[1]) : null;
	};

	const activeArticle = $derived.by(() => {
		const vn = versionNumber(selectedVersion);
		if (vn === null) return null;
		return articleVariants.find((v) => v.version === vn)?.article ?? componentArticle;
	});

	// Конструкция активной версии. Принадлежит именно версии, а не компоненту:
	// переключение варианта меняет и морфотип, поэтому подпись-запаска в панели
	// настроек обязана пересчитываться вместе с выбором.
	const activeMorph = $derived.by(() => {
		const vn = versionNumber(selectedVersion);
		if (vn === null) return null;
		return articleVariants.find((v) => v.version === vn)?.morph ?? null;
	});

	// Артикул тянем только для авторизованного пользователя: запрос идёт под @guard и
	// без токена всегда возвращает null. Гость монтирует свитчер наравне со всеми
	// (разметка скрыта, но скрипт работает), и раньше единственная попытка сгорала
	// именно на нём: вход не пересоздаёт блоки (они живут в keyed `{#each ... (element.type)}`,
	// а рефетча страницы после входа нет), флаг оставался взведён — и бейдж не
	// появлялся до F5. Зависимость от isEditable даёт повтор ровно в момент входа.
	$effect(() => {
		const tid = editContext?.templateId ?? null;
		const slug = editContext?.slug ?? null;
		if (!isEditable || !editContext || tid === null || !slug || articleLoaded) return;
		articleLoaded = true;
		fetchComponentArticle(tid, slug, componentType)
			.then((res) => {
				if (res) {
					articleVariants = res.variants ?? [];
					componentArticle = res.article ?? null;
				}
				// Не получилось — снимаем флаг, чтобы попробовать снова при смене контекста.
				else articleLoaded = false;
			})
			.catch(() => {
				articleLoaded = false;
			});
	});

	// Тема блока. Оптимистичное обновление с откатом живёт в общем помощнике —
	// он же используется блоками без переключателя версий.
	const isLight = $derived(isLightBlock(data, themeDefault));

	const toggleTheme = createThemeToggle({
		type: () => componentType,
		fallback: () => themeDefault,
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	function handleReset() {
		if (!editContext || !actualResetId) return;
		showConfirmModal = true;
	}

	/** Кнопка отключения блока в панели настроек: 'disabled' ⇄ последний вариант. */
	function toggleDisabled() {
		selectVersion(selectedVersion === 'disabled' ? lastEnabledVersion : 'disabled');
	}

	async function saveImageData(next: Record<string, unknown>) {
		if (!editContext) return;
		await saveComponentData(editContext, componentType, next);
	}

	async function confirmReset() {
		if (!editContext || !actualResetId || isResetting) return;
		isResetting = true;
		try {
			await deleteComponentData(editContext, actualResetId);
			showConfirmModal = false;
			drawerOpen = false;
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
	<div
		class="font-sans-premium z-[100] flex items-center gap-2 select-none {placement === 'overlay'
			? 'absolute top-6 right-6'
			: 'relative'}"
	>
		{#if themeVersions.includes(selectedVersion)}
			<ThemeToggle {isLight} onToggle={toggleTheme} class="order-first" />
		{/if}

		<!-- Контейнер для кнопки Варианты и выпадающего списка -->
		{#if showVersionMenu}
			<div class="relative">
				<!-- Кнопка-триггер меню -->
				<button
					type="button"
					class="flex cursor-pointer items-center gap-2 rounded-2xl border border-on-dark/10 bg-ink-950/75 px-4 py-2.5 text-xs font-bold tracking-wider text-on-dark uppercase shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-on-dark/25 active:scale-95"
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
						class="absolute top-12 left-0 z-50 flex w-44 flex-col gap-1 rounded-2xl border border-on-dark/10 bg-ink-950/90 p-1.5 shadow-2xl backdrop-blur-2xl"
						transition:fly={{ y: -10, duration: 200 }}
					>
						{#if onLegacyVersion}
							<!-- Предложение сменить компонент. Видит только тот, кто сидит на
							     выведенной версии; остальные о ней вообще не узнают. -->
							<div
								class="mb-1 rounded-xl border border-cat-1-500/30 bg-cat-1-500/10 px-3 py-2.5 text-xs leading-relaxed font-medium text-cat-1-200"
							>
								Этот вариант выведен из обращения. Он продолжит работать, но новых улучшений не
								получит — выберите другой, когда будет удобно.
							</div>
						{/if}

						{#if offeredVersions.length === 0}
							<div class="rounded-xl px-3 py-2.5 text-xs leading-relaxed font-medium text-ink-400">
								Активных вариантов у этого блока не осталось: он заменён другим блоком.
							</div>
						{/if}

						<!-- Выбранный вариант подсвечен одним и тем же интерактивным цветом системы.
						     Раньше у каждого варианта был свой хью (белый / sky→indigo / violet→fuchsia /
						     emerald→teal): выбран всегда ровно один, так что четыре разных подсветки не
						     различали ничего — это была декорация мимо токенного слоя. -->
						{#each offeredVersions as ver}
							<button
								type="button"
								class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-xs font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
								ver
									? 'scale-[1.02] border border-link-500/40 bg-link-500/15 text-link-200 shadow-md'
									: 'border border-transparent text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
								onclick={() => {
									selectVersion(ver);
									isOpen = false;
								}}
							>
								Вариант {ver.slice(1)}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}

		<!-- Триггер панели настроек + сама панель (SideDrawer уходит порталом в body) -->
		<ComponentSettingsDrawer
			bind:data
			{editContext}
			{componentType}
			onSaveData={saveImageData}
			bind:open={drawerOpen}
			fallbackTitle={title || componentType}
			morph={activeMorph}
			article={activeArticle}
			articleSectionHint={editContext.slug}
			articleComponentHint={componentType}
			canReset={Boolean(actualResetId)}
			{isResetting}
			onReset={handleReset}
			isDisabled={selectedVersion === 'disabled'}
			enabledVersionLabel={lastEnabledVersion.replace('v', '')}
			onToggleDisabled={toggleDisabled}
		/>
	</div>
{/if}

{#if showConfirmModal}
	<div
		class="fixed inset-0 z-[1000] flex items-center justify-center bg-scrim/60 p-4 backdrop-blur-md"
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
			class="font-sans-premium relative z-10 flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-on-dark/10 bg-ink-900/95 p-6 text-center shadow-2xl backdrop-blur-2xl"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Значок предупреждения. Розовый хью категориальной шкалы (cat-6), а не
			     brand: brand — акцент тенанта, и у «Графита» он синий, то есть
			     разрушающее действие красилось бы там как обычное. -->
			<div
				class="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-cat-6-500/25 bg-cat-6-500/10 text-cat-6-400 shadow-[0_0_20px] shadow-cat-6-500/15"
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
				<h3 class="text-lg text-on-dark uppercase">Сбросить изменения?</h3>
				<p class="text-xs leading-relaxed font-medium text-ink-400">
					Вы уверены, что хотите сбросить контент блока
					<span class="font-bold text-ink-200">"{componentType}"</span>
					к начальному состоянию? Все изменения будут безвозвратно удалены.
				</p>
			</div>

			<!-- Buttons Row -->
			<div class="mt-2 flex w-full items-center gap-3">
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl border border-on-dark/10 bg-on-dark/5 px-4 py-3 text-xs font-bold tracking-wider text-on-dark uppercase transition-all duration-300 hover:bg-on-dark/10 active:scale-98"
					onclick={() => (showConfirmModal = false)}
				>
					Отмена
				</button>
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl bg-cat-6-600 px-4 py-3 text-xs font-bold tracking-wider text-on-dark uppercase transition-all duration-300 hover:bg-cat-6-500 hover:shadow-lg hover:shadow-cat-6-600/25 active:scale-98"
					onclick={confirmReset}
					disabled={isResetting}
				>
					{isResetting ? 'Сброс...' : 'Да, сбросить'}
				</button>
			</div>
		</div>
	</div>
{/if}
