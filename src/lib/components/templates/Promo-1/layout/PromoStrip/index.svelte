<script lang="ts">
	import PromoStripV1 from './v1/PromoStrip.svelte';
	import PromoStripV2 from './v2/PromoStrip.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { editStore } from '$lib/stores/edit.svelte';
	import { createThemeToggle, isLightBlock } from '$lib/utils/block-theme';
	import {
		saveLayoutData,
		getLayoutComponentArticle,
		type EditContext
	} from '$lib/utils/page-edit';
	import { fly } from 'svelte/transition';
	import '../../theme.css';
	import './promo-strip.css';

	// Независимый контент полосы хранится в header_data вместе с её темой и версией.
	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
	} = $props();

	const savedText = $derived(typeof data.promoText === 'string' ? data.promoText : '');
	const text = $derived(
		editStore.activeField?.key === 'PromoStrip.promoText'
			? (editStore.activeField.draft ?? savedText)
			: savedText
	);

	function editText() {
		if (!isEditable || !editContext) return;
		drawerOpen = false;
		editStore.open({
			key: 'PromoStrip.promoText',
			label: 'Текст информационной полосы',
			value: savedText,
			multiline: true,
			richText: false,
			onSave: async (value) => {
				if (!editContext) return;
				const updated = { ...data, promoText: value.trim() };
				await saveLayoutData(editContext, 'Header', updated);
				data = updated;
			}
		});
	}

	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных — ровно
	// та же причина, что у баннера.
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.promoVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
	let drawerOpen = $state(false);
	let hasManuallySelected = $state(false);

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

	// Полоса нарисована живой (а не индикатором «отключена»/«нет текста») —
	// от этого зависит, где стоит триггер настроек: у первой версии справа
	// есть крестик, и наезжать на него нельзя.
	const isLive = $derived(selectedVersion !== 'disabled' && text.trim().length > 0);

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
			console.error('Ошибка сохранения версии информационной полосы:', err);
		}
	}
</script>

<div class="relative" data-field-toolbar-scope>
	{#if selectedVersion === 'disabled'}
		{#if isEditable}
			<!-- Редактор: тонкая индикация, что полоса отключена -->
			<div
				class="flex h-9 items-center justify-center gap-2 bg-ink-900 text-[11px] font-medium tracking-wider text-ink-400 uppercase"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
				Информационная полоса отключена
			</div>
		{/if}
	{:else if !text.trim()}
		{#if isEditable}
			<div
				class="flex h-9 items-center justify-center gap-2 bg-ink-900 text-[11px] font-medium tracking-wider text-ink-400 uppercase"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
				Добавьте текст в настройках полосы
			</div>
		{/if}
	{:else if selectedVersion === 'v2'}
		<div in:fly={{ x: 0, y: -40, duration: 400 }}>
			<PromoStripV2 {data} {text} {isEditable} />
		</div>
	{:else}
		<div in:fly={{ x: 0, y: -40, duration: 400 }}>
			<PromoStripV1 {data} {text} {isEditable} />
		</div>
	{/if}

	{#if isEditable && editContext}
		<!-- Компактный триггер (полоса узкая): открывает SideDrawer справа.
		     Рисуется ВСЕГДА, в том числе на индикаторе «полоса отключена», —
		     иначе включить её обратно было бы нечем. У первой версии отступает
		     левее, чтобы не наехать на крестик посетителя. -->
		<button
			type="button"
			onclick={() => (drawerOpen = true)}
			class="absolute top-1/2 z-[100] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-on-dark/10 bg-ink-950/80 text-on-dark/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-link-400/40 hover:bg-ink-900 hover:text-on-dark active:scale-95 {isLive &&
			selectedVersion === 'v1'
				? 'right-14 lg:right-16'
				: 'right-1.5'}"
			title="Настройки информационной полосы"
			data-field-toolbar-anchor
			aria-label="Настройки информационной полосы"
			data-goal-ignore="Настройки полосы владельцем"
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
	<SideDrawer bind:open={drawerOpen} title="Информационная полоса">
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

			<section aria-label="Текст полосы">
				<h4 class="p1-title-sub text-[10px] text-on-dark/40 uppercase">Текст полосы</h4>
				<p class="mt-2 text-xs leading-relaxed text-ink-400">
					Текст не связан с акциями. Если он шире доступного места, включается бегущая строка.
					Пустая полоса скрыта от посетителей.
				</p>
				<button
					type="button"
					onclick={editText}
					data-goal-ignore="Редактирование текста полосы владельцем"
					class="mt-4 w-full cursor-pointer rounded-2xl border border-on-dark/10 px-4 py-3 text-left text-sm text-on-dark transition-colors hover:bg-on-dark/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400"
				>
					<span class="block text-xs text-ink-300">Редактировать текст</span>
					<span class="mt-2 block break-words whitespace-pre-wrap"
						>{savedText || 'Добавить текст'}</span
					>
				</button>
			</section>

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
						data-goal-ignore="Выбор версии полосы владельцем"
					>
						<span class="block text-xs font-bold tracking-wider uppercase">Вариант 1</span>
						<span class="mt-1 block text-[11px] text-ink-400">Строка с кнопкой закрытия</span>
					</button>
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition-all duration-200 {selectedVersion ===
						'v2'
							? 'scale-[1.01] border-link-500/40 bg-gradient-to-r from-link-500/15 to-cat-4-500/15 text-link-200 shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
						onclick={() => selectVersion('v2')}
						data-goal-ignore="Выбор версии полосы владельцем"
					>
						<span class="block text-xs font-bold tracking-wider uppercase">Вариант 2</span>
						<span class="mt-1 block text-[11px] text-ink-400">Строка без кнопки закрытия</span>
					</button>
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left text-xs font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
						'disabled'
							? 'scale-[1.01] border-brand-500/40 bg-brand-500/15 text-brand-200 shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-brand-500/5 hover:text-brand-400'}"
						onclick={() => selectVersion('disabled')}
						data-goal-ignore="Отключение полосы владельцем"
					>
						Отключить
					</button>
				</div>
			</section>

			{#if selectedVersion === 'v1'}
				<!-- Крестик -->
				<section class="border-t border-on-dark/10 pt-5">
					<h4 class="p1-title-sub text-[10px] text-on-dark/40 uppercase">Закрытие посетителем</h4>
					<p class="mt-2 text-xs leading-relaxed text-ink-400">
						Крестик скрывает полосу до конца сессии вкладки: в новой сессии текст показывается
						снова. В режиме редактирования закрытие не действует — иначе настройки полосы стали бы
						недоступны.
					</p>
				</section>
			{/if}
		</div>
	</SideDrawer>
{/if}
