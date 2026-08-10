<script lang="ts">
	import BannerV1 from './v1/Banner.svelte';
	import BannerV2 from './v2/Banner.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import {
		saveLayoutData,
		getLayoutComponentArticle,
		type EditContext
	} from '$lib/utils/page-edit';
	import { fly } from 'svelte/transition';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
	} = $props();

	// Баннер — layout-компонент, его данные живут в том же header_data blob, что и хэдер
	// (сохраняется через saveLayoutData('Header')). Версия — bannerVersion в том же blob'е.
	// Баннер узкий, поэтому плавающий переключатель не подходит: компактная кнопка-триггер
	// открывает SideDrawer (справа) с выбором варианта и сбросом.
	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных —
	// на живых сайтах это давало подмену версии после гидратации, а каталог
	// /_ds (пререндер) вообще не смог бы показать ничего, кроме v1.
	let selectedVersion = $state<'v1' | 'v2' | 'disabled'>(
		(data?.bannerVersion as 'v1' | 'v2' | 'disabled') ?? 'v1'
	);
	let drawerOpen = $state(false);
	let isResetting = $state(false);
	let hasManuallySelected = $state(false);

	$effect(() => {
		const ver = (data?.bannerVersion as 'v1' | 'v2' | 'disabled') ?? 'v1';
		if (!hasManuallySelected && ver !== selectedVersion) {
			selectedVersion = ver;
		}
	});

	// Публикуем реальную высоту баннера в --banner-h на :root.
	// HeroMain вычитает её вместе с --header-h из 100dvh. При отключённом баннере
	// (для посетителя) обёртка пуста → высота 0.
	let bannerEl: HTMLElement;
	$effect(() => {
		if (!bannerEl) return;
		const update = () =>
			document.documentElement.style.setProperty('--banner-h', bannerEl.offsetHeight + 'px');
		update();
		const ro = new ResizeObserver(update);
		ro.observe(bannerEl);
		return () => ro.disconnect();
	});

	const versionNumber = (v: unknown): number | null => {
		const m = /^v([1-4])$/.exec(typeof v === 'string' ? v : '');
		return m ? Number(m[1]) : null;
	};

	// Артикул выбранной версии баннера (формат {шаблон}.Б.1.{версия}).
	const bannerArticle = $derived(
		editContext?.templateId != null
			? getLayoutComponentArticle(editContext.templateId, 'Banner', versionNumber(selectedVersion))
			: null
	);

	async function selectVersion(version: 'v1' | 'v2' | 'disabled') {
		if (version === selectedVersion) return;
		selectedVersion = version;
		hasManuallySelected = true;
		if (!editContext) return;
		const updated = { ...data, bannerVersion: version };
		try {
			await saveLayoutData(editContext, 'Header', updated);
			data = updated;
		} catch (err) {
			console.error('Ошибка сохранения версии баннера:', err);
		}
	}

	// Сброс контента баннера (phone/email/links/favoritesHref). Вариант сохраняем,
	// пункты меню хэдера (disabledRubrics/disabledServices) не трогаем — они в том же blob'е,
	// но мы не удаляем их из данных.
	const BANNER_CONTENT_KEYS = ['phone', 'email', 'links', 'favoritesHref'] as const;

	async function confirmReset() {
		if (!editContext || isResetting) return;
		isResetting = true;
		try {
			const cleared: Record<string, unknown> = { ...data };
			for (const key of BANNER_CONTENT_KEYS) {
				delete cleared[key];
			}
			cleared.bannerVersion = selectedVersion;
			await saveLayoutData(editContext, 'Header', cleared);
			data = cleared;
		} catch (err) {
			console.error('Ошибка при сбросе контента баннера:', err);
			alert(err instanceof Error ? err.message : 'Не удалось сбросить контент');
		} finally {
			isResetting = false;
		}
	}
</script>

<div bind:this={bannerEl} class="relative">
	{#if selectedVersion === 'disabled'}
		{#if isEditable}
			<!-- Редактор: тонкая индикация, что баннер отключён -->
			<div
				class="flex h-9 items-center justify-center gap-2 bg-ink-900 text-[11px] font-medium tracking-wider text-ink-400 uppercase"
			>
				<span class="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
				Баннер отключён
			</div>
		{/if}
	{:else if selectedVersion === 'v2'}
		<div in:fly={{ x: 0, y: -40, duration: 400 }}>
			<BannerV2 bind:data {editContext} {isEditable} />
		</div>
	{:else}
		<div in:fly={{ x: 0, y: -40, duration: 400 }}>
			<BannerV1 bind:data {editContext} {isEditable} />
		</div>
	{/if}

	{#if isEditable && editContext}
		<!-- Компактный триггер (узкий баннер): открывает SideDrawer справа -->
		<button
			type="button"
			onclick={() => (drawerOpen = true)}
			class="absolute top-1/2 right-1.5 z-[100] flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-on-dark/10 bg-ink-950/80 text-on-dark/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-link-400/40 hover:bg-ink-900 hover:text-on-dark active:scale-95"
			title="Варианты и сброс"
			aria-label="Варианты и сброс баннера"
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
	<SideDrawer bind:open={drawerOpen} title="Баннер" eyebrow="Шапка · Promo-1">
		<div class="flex flex-col gap-6">
			<!-- Артикул выбранной версии -->
			{#if bannerArticle}
				<div class="flex items-center gap-2">
					<span class="text-[10px] font-semibold tracking-[0.2em] text-on-dark/40 uppercase"
						>Артикул</span
					>
					<ArticleBadge article={bannerArticle} sectionLabel="Раздел" align="left" />
				</div>
			{/if}

			<!-- Варианты -->
			<section>
				<h4 class="p1-title-sub mb-3 text-[10px] tracking-[0.2em] text-on-dark/40 uppercase">
					Вариант дизайна
				</h4>
				<div class="flex flex-col gap-2">
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left text-xs font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
						'v1'
							? 'scale-[1.01] border-on-dark/20 bg-on-dark/10 text-on-dark shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
						onclick={() => selectVersion('v1')}
					>
						Вариант 1
					</button>
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left text-xs font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
						'v2'
							? 'scale-[1.01] border-link-500/40 bg-gradient-to-r from-link-500/15 to-cat-4-500/15 text-link-200 shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
						onclick={() => selectVersion('v2')}
					>
						Вариант 2
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

			<!-- Сброс контента -->
			<section class="border-t border-on-dark/10 pt-5">
				<h4 class="p1-title-sub text-[10px] tracking-[0.2em] text-on-dark/40 uppercase">Контент</h4>
				<p class="mt-2 text-xs leading-relaxed text-ink-400">
					Сброс вернёт контакты и ссылки баннера к значениям по умолчанию. Выбранный вариант и меню
					хэдера не изменятся.
				</p>
				<button
					type="button"
					class="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-brand-500/20 bg-brand-500/5 px-4 py-3 text-xs font-bold tracking-wider text-brand-300 uppercase transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-500/15 hover:text-brand-200 active:scale-[0.98]"
					onclick={confirmReset}
					disabled={isResetting}
				>
					<svg
						class="h-3.5 w-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M4 4v6h6M20 20v-6h-6M5 14a7.5 7.5 0 0 0 12.32 2.5M19 10A7.5 7.5 0 0 0 6.68 7.5"
						/>
					</svg>
					{isResetting ? 'Сброс...' : 'Сбросить контент'}
				</button>
			</section>
		</div>
	</SideDrawer>
{/if}
