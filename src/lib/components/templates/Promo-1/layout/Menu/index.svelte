<script lang="ts">
	import MenuV1 from './v1/Menu.svelte';
	import MenuV2 from './v2/Menu.svelte';
	import MenuV3 from './v3/Menu.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import {
		saveLayoutData,
		getLayoutComponentArticle,
		type EditContext
	} from '$lib/utils/page-edit';
	import type { CatalogItem } from '../catalogItems';
	import type { ServiceItem } from '../serviceItems';

	// Меню (навигация хэдера) — layout-компонент. Как и баннер, его версия хранится
	// в общем header_data blob'е (ключ menuVersion) и сохраняется через
	// saveLayoutData('Header'). Раздел меню в системе артикулов — «М» (тип Header):
	// формат {шаблон}.М.1.{версия}. Данные пунктов и переключатели видимости
	// рубрик/услуг приходят из Header.svelte пропсами (они общие с мобильным меню).
	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false,
		links = [],
		visibleCatalogItems = [],
		visibleServiceItems = [],
		disabledRubrics = [],
		disabledServices = [],
		onToggleRubric,
		onToggleService
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
		links: { href: string; label: string }[];
		visibleCatalogItems: CatalogItem[];
		visibleServiceItems: ServiceItem[];
		disabledRubrics: string[];
		disabledServices: string[];
		onToggleRubric: (href: string, currentEnabled: boolean, e: Event) => void;
		onToggleService: (href: string, currentEnabled: boolean, e: Event) => void;
	} = $props();

	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных —
	// на живых сайтах это давало подмену версии после гидратации, а каталог
	// /_ds (пререндер) вообще не смог бы показать ничего, кроме v1.
	let selectedVersion = $state<'v1' | 'v2' | 'v3'>(
		(data?.menuVersion as 'v1' | 'v2' | 'v3') ?? 'v1'
	);
	let drawerOpen = $state(false);
	let hasManuallySelected = $state(false);

	$effect(() => {
		const ver = (data?.menuVersion as 'v1' | 'v2' | 'v3') ?? 'v1';
		if (!hasManuallySelected && ver !== selectedVersion) {
			selectedVersion = ver;
		}
	});

	const versionNumber = (v: unknown): number | null => {
		const m = /^v([1-4])$/.exec(typeof v === 'string' ? v : '');
		return m ? Number(m[1]) : null;
	};

	// Артикул выбранной версии меню (формат {шаблон}.М.1.{версия}).
	const menuArticle = $derived(
		editContext?.templateId != null
			? getLayoutComponentArticle(editContext.templateId, 'Header', versionNumber(selectedVersion))
			: null
	);

	async function selectVersion(version: 'v1' | 'v2' | 'v3') {
		if (version === selectedVersion) return;
		selectedVersion = version;
		hasManuallySelected = true;
		if (!editContext) return;
		const updated = { ...data, menuVersion: version };
		try {
			await saveLayoutData(editContext, 'Header', updated);
			data = updated;
		} catch (err) {
			console.error('Ошибка сохранения версии меню:', err);
		}
	}
</script>

<div class="relative flex items-center gap-2">
	{#if selectedVersion === 'v3'}
		<MenuV3
			{links}
			{visibleCatalogItems}
			{visibleServiceItems}
			{disabledRubrics}
			{disabledServices}
			{isEditable}
			{onToggleRubric}
			{onToggleService}
		/>
	{:else if selectedVersion === 'v2'}
		<MenuV2
			{links}
			{visibleCatalogItems}
			{visibleServiceItems}
			{disabledRubrics}
			{disabledServices}
			{isEditable}
			{onToggleRubric}
			{onToggleService}
		/>
	{:else}
		<MenuV1
			{links}
			{visibleCatalogItems}
			{visibleServiceItems}
			{disabledRubrics}
			{disabledServices}
			{isEditable}
			{onToggleRubric}
			{onToggleService}
		/>
	{/if}

	{#if isEditable && editContext}
		<!-- Компактный триггер: открывает SideDrawer с выбором варианта меню -->
		<button
			type="button"
			onclick={() => (drawerOpen = true)}
			class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink-200 bg-surface-raised text-ink-500 shadow-sm transition-all duration-300 hover:border-link-300 hover:text-link-600 active:scale-95"
			title="Варианты меню"
			aria-label="Варианты меню"
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
	<SideDrawer bind:open={drawerOpen} title="Меню" eyebrow="Шапка · Promo-1">
		<div class="flex flex-col gap-6">
			<!-- Артикул выбранной версии -->
			{#if menuArticle}
				<div class="flex items-center gap-2">
					<span class="text-[10px] font-semibold tracking-[0.2em] text-on-dark/40 uppercase"
						>Артикул</span
					>
					<ArticleBadge article={menuArticle} sectionLabel="Раздел" align="left" />
				</div>
			{/if}

			<!-- Варианты -->
			<section>
				<h4 class="p1-title-sub mb-3 text-[10px] text-on-dark/40 uppercase">Вариант дизайна</h4>
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
							? 'scale-[1.01] border-link-500/40 bg-linear-to-r from-link-500/15 to-cat-4-500/15 text-link-200 shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
						onclick={() => selectVersion('v2')}
					>
						Вариант 2
					</button>
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left text-xs font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
						'v3'
							? 'scale-[1.01] border-cat-5-400/40 bg-cat-5-400/10 text-cat-5-100 shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
						onclick={() => selectVersion('v3')}
					>
						Вариант 3
					</button>
				</div>
			</section>

			<p class="text-xs leading-relaxed text-ink-400">
				Вариант меняет дизайн навигации в шапке. Пункты меню, каталог и услуги (включая их
				видимость) остаются общими для всех вариантов.
			</p>
		</div>
	</SideDrawer>
{/if}
