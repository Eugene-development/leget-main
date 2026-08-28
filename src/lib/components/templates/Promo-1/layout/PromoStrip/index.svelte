<script lang="ts">
	import PromoStripV1 from './v1/PromoStrip.svelte';
	import PromoStripV2 from './v2/PromoStrip.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { createThemeToggle, isLightBlock } from '$lib/utils/block-theme';
	import {
		saveLayoutData,
		getLayoutComponentArticle,
		type EditContext
	} from '$lib/utils/page-edit';
	import { activeActionCards } from '../../pages/actions/actionCards';
	import { isPromoClosed, rememberPromoClosed } from './session';
	import { fly } from 'svelte/transition';
	import '../../theme.css';
	import './promo-strip.css';

	// Полоса акций — вторая полоса шапки, НАД баннером.
	//
	// Устроена как баннер и намеренно: это тоже layout-компонент, её версия и
	// тема живут в том же blob'е `header_data` (ключи `promoVersion`,
	// `promoTheme`), сохраняются тем же `saveLayoutData('Header', …)`, а выбор
	// варианта открывается тем же `SideDrawer` — полоса узкая, плавающему
	// переключателю в ней не поместиться.
	//
	// Чем от баннера ОТЛИЧАЕТСЯ: своего контента у неё нет. Она показывает
	// активные акции страницы `/actions` — те же, что видит там посетитель, —
	// поэтому в панели нет «сброса контента»: сбрасывать нечего, правится
	// содержимое на самой странице акций.
	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false,
		actionCards = null
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		/**
		 * Сохранённые карточки акций из `site.actionCards` (renderPage). `null` —
		 * тенант блок акций не правил, тогда берутся дефолты страницы; см. разбор
		 * в `pages/actions/actionCards.ts`.
		 */
		actionCards?: unknown;
	} = $props();

	const actions = $derived(activeActionCards(actionCards));

	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных — ровно
	// та же причина, что у баннера.
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.promoVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
	let drawerOpen = $state(false);
	let hasManuallySelected = $state(false);

	// Закрытие посетителем — на текущую сессию вкладки (см. ./session.ts).
	// Значение читается ПРИ ИНИЦИАЛИЗАЦИИ: на сервере оно всегда `false`, а на
	// клиенте уже известно к первому рендеру, поэтому закрытая полоса не успевает
	// мигнуть. До гидратации серверную разметку прячет CSS по атрибуту на `<html>`.
	//
	// В режиме редактирования закрытие игнорируется: иначе владелец, разок
	// закрывший полосу как посетитель, лишился бы доступа к её настройкам до
	// конца сессии.
	let closedBySession = $state(isPromoClosed());
	const isHidden = $derived(closedBySession && !isEditable);

	const THEME_VERSIONS: ('v1' | 'v2')[] = ['v1', 'v2'];
	const isLight = $derived(isLightBlock(data, 'dark', 'promoTheme'));
	const toggleTheme = createThemeToggle({
		type: 'Header',
		fallback: 'dark',
		key: 'promoTheme',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext,
		// Layout-компонент: сохраняем не свой blob компонента, а headerData лицензии.
		save: (context, _type, next) => saveLayoutData(context, 'Header', next)
	});

	$effect(() => {
		const ver = (data?.promoVersion as 'v1' | 'v2' | 'disabled') ?? 'v1';
		if (!hasManuallySelected && ver !== selectedVersion) {
			selectedVersion = ver;
		}
	});

	const versionNumber = (v: unknown): number | null => {
		const m = /^v([1-2])$/.exec(typeof v === 'string' ? v : '');
		return m ? Number(m[1]) : null;
	};

	// Артикул выбранной версии полосы (формат {шаблон}.П.1.{версия}).
	const promoArticle = $derived(
		editContext?.templateId != null
			? getLayoutComponentArticle(
					editContext.templateId,
					'PromoStrip',
					versionNumber(selectedVersion)
				)
			: null
	);

	// Полоса нарисована живой (а не индикатором «отключена»/«нет акций») —
	// от этого зависит, где стоит триггер настроек: у живой полосы справа уже
	// есть крестик, и наезжать на него нельзя.
	const isLive = $derived(selectedVersion !== 'disabled' && actions.length > 0 && !isHidden);

	// «1 активную акцию» / «3 активные акции» / «8 активных акций» — у русского
	// счётного оборота три формы, и двух здесь мало: список приходит от тенанта
	// и бывает любой длины.
	const actionsPhrase = $derived.by(() => {
		const n = actions.length;
		const tail = n % 10;
		const teen = n % 100;

		if (tail === 1 && teen !== 11) return `${n} активную акцию`;
		if (tail >= 2 && tail <= 4 && (teen < 12 || teen > 14)) return `${n} активные акции`;
		return `${n} активных акций`;
	});

	function close() {
		closedBySession = true;
		rememberPromoClosed();
	}

	async function selectVersion(version: 'v1' | 'v2' | 'disabled') {
		if (version === selectedVersion) return;
		selectedVersion = version;
		hasManuallySelected = true;
		if (!editContext) return;
		const updated = { ...data, promoVersion: version };
		try {
			await saveLayoutData(editContext, 'Header', updated);
			data = updated;
		} catch (err) {
			console.error('Ошибка сохранения версии полосы акций:', err);
		}
	}
</script>

<div class="relative">
	{#if selectedVersion === 'disabled'}
		{#if isEditable}
			<!-- Редактор: тонкая индикация, что полоса отключена -->
			<div
				class="flex h-9 items-center justify-center gap-2 bg-ink-900 text-[11px] font-medium tracking-wider text-ink-400 uppercase"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
				Полоса акций отключена
			</div>
		{/if}
	{:else if actions.length === 0}
		{#if isEditable}
			<!-- Активных акций нет: посетителю полоса не показывается вовсе —
			     пустая строка в шапке хуже её отсутствия. Владельцу говорим, где
			     это чинится. -->
			<div
				class="flex h-9 items-center justify-center gap-2 bg-ink-900 text-[11px] font-medium tracking-wider text-ink-400 uppercase"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
				Нет активных акций — полоса скрыта
			</div>
		{/if}
	{:else if !isHidden}
		{#if selectedVersion === 'v2'}
			<div in:fly={{ x: 0, y: -40, duration: 400 }}>
				<PromoStripV2 {data} {actions} onClose={close} />
			</div>
		{:else}
			<div in:fly={{ x: 0, y: -40, duration: 400 }}>
				<PromoStripV1 {data} {actions} onClose={close} />
			</div>
		{/if}
	{/if}

	{#if isEditable && editContext}
		<!-- Компактный триггер (полоса узкая): открывает SideDrawer справа.
		     Рисуется ВСЕГДА, в том числе на индикаторе «полоса отключена», —
		     иначе включить её обратно было бы нечем. У живой полосы отступает
		     левее, чтобы не наехать на крестик посетителя. -->
		<button
			type="button"
			onclick={() => (drawerOpen = true)}
			class="absolute top-1/2 z-[100] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-on-dark/10 bg-ink-950/80 text-on-dark/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-link-400/40 hover:bg-ink-900 hover:text-on-dark active:scale-95 {isLive
				? 'right-14 lg:right-16'
				: 'right-1.5'}"
			title="Варианты полосы акций"
			aria-label="Варианты полосы акций"
		>
			<svg
				class="h-3.5 w-3.5"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
				<circle cx="9" cy="6" r="2" fill="currentColor" />
				<circle cx="15" cy="12" r="2" fill="currentColor" />
				<circle cx="8" cy="18" r="2" fill="currentColor" />
			</svg>
		</button>
	{/if}
</div>

{#if isEditable && editContext}
	<SideDrawer bind:open={drawerOpen} title="Полоса акций">
		<div class="flex flex-col gap-6">
			<!-- Артикул выбранной версии -->
			{#if promoArticle}
				<div class="flex items-center gap-2">
					<span class="text-[10px] font-semibold tracking-[0.2em] text-on-dark/40 uppercase"
						>Артикул</span
					>
					<ArticleBadge article={promoArticle} sectionLabel="Раздел" align="left" />
				</div>
			{/if}

			<!-- Тема полосы -->
			{#if THEME_VERSIONS.includes(selectedVersion as 'v1' | 'v2')}
				<section>
					<h4 class="p1-title-sub mb-3 text-[10px] text-on-dark/40 uppercase">Тема</h4>
					<div class="flex items-center gap-3">
						<ThemeToggle {isLight} onToggle={toggleTheme} />
						<span class="text-xs font-medium text-ink-300">
							{isLight ? 'Светлая' : 'Тёмная'}
						</span>
					</div>
				</section>
			{/if}

			<!-- Варианты -->
			<section>
				<h4 class="p1-title-sub mb-3 text-[10px] text-on-dark/40 uppercase">Вариант дизайна</h4>
				<div class="flex flex-col gap-2">
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition-all duration-200 {selectedVersion ===
						'v1'
							? 'scale-[1.01] border-on-dark/20 bg-on-dark/10 text-on-dark shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
						onclick={() => selectVersion('v1')}
					>
						<span class="block text-xs font-bold tracking-wider uppercase">Вариант 1</span>
						<span class="mt-1 block text-[11px] text-ink-400">Одна акция, смена раз в 6 секунд</span
						>
					</button>
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition-all duration-200 {selectedVersion ===
						'v2'
							? 'scale-[1.01] border-link-500/40 bg-gradient-to-r from-link-500/15 to-cat-4-500/15 text-link-200 shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
						onclick={() => selectVersion('v2')}
					>
						<span class="block text-xs font-bold tracking-wider uppercase">Вариант 2</span>
						<span class="mt-1 block text-[11px] text-ink-400">Бегущая лента, видно все акции</span>
					</button>
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left text-xs font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
						'disabled'
							? 'scale-[1.01] border-brand-500/40 bg-brand-500/15 text-brand-200 shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-brand-500/5 hover:text-brand-400'}"
						onclick={() => selectVersion('disabled')}
					>
						Отключить
					</button>
				</div>
			</section>

			<!-- Откуда контент -->
			<section class="border-t border-on-dark/10 pt-5">
				<h4 class="p1-title-sub text-[10px] text-on-dark/40 uppercase">Контент</h4>
				<p class="mt-2 text-xs leading-relaxed text-ink-400">
					Полоса показывает {actionsPhrase} со страницы «Акции» — те же, что видит там посетитель. Текст
					и состав правятся на самой странице: выключенная там акция исчезает и отсюда.
				</p>
				<a
					href="/actions"
					class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-on-dark/10 px-4 py-3 text-xs font-bold tracking-wider text-ink-300 uppercase transition-all duration-300 hover:border-on-dark/20 hover:text-on-dark"
				>
					Открыть страницу акций
				</a>
			</section>

			<!-- Крестик -->
			<section class="border-t border-on-dark/10 pt-5">
				<h4 class="p1-title-sub text-[10px] text-on-dark/40 uppercase">Закрытие посетителем</h4>
				<p class="mt-2 text-xs leading-relaxed text-ink-400">
					Крестик скрывает полосу до конца сессии вкладки: в новой сессии акции показываются снова.
					В режиме редактирования закрытие не действует — иначе настройки полосы стали бы
					недоступны.
				</p>
			</section>
		</div>
	</SideDrawer>
{/if}
