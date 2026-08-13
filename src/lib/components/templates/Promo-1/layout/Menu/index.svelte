<script lang="ts">
	import MenuV1 from './v1/Menu.svelte';
	import MenuV2 from './v2/Menu.svelte';
	import MenuV3 from './v3/Menu.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
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
	let logoPickerOpen = $state(false);
	let hasManuallySelected = $state(false);
	const logoUrl = $derived(typeof data?.logoUrl === 'string' ? data.logoUrl : '');

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

	function openLogoPicker() {
		// BgImagePicker и SideDrawer используют полноэкранные слои. Закрываем drawer,
		// чтобы пикер оказался единственным активным диалогом и корректно получил фокус.
		drawerOpen = false;
		logoPickerOpen = true;
	}

	function closeLogoPicker() {
		logoPickerOpen = false;
	}

	async function handleLogoApprove(url: string) {
		if (!editContext) return;
		const updated = { ...data, logoUrl: url };
		await saveLayoutData(editContext, 'Header', updated);
		data = updated;
		closeLogoPicker();
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
		<!-- Компактный триггер: открывает SideDrawer с настройками меню -->
		<button
			type="button"
			onclick={() => (drawerOpen = true)}
			class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink-200 bg-surface-raised text-ink-500 shadow-sm transition-all duration-300 hover:border-link-300 hover:text-link-600 active:scale-95"
			title="Настройки меню"
			aria-label="Настройки меню"
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
	<SideDrawer bind:open={drawerOpen} title="Меню">
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

			<section>
				<h4 class="p1-title-sub mb-3 text-[10px] text-on-dark/40 uppercase">Логотип</h4>
				<div class="rounded-2xl border border-on-dark/10 bg-on-dark/5 p-3">
					<div class="flex min-h-24 items-center justify-center rounded-xl bg-surface-raised p-4">
						{#if logoUrl}
							<img
								src={logoUrl}
								alt="Текущий логотип сайта"
								class="max-h-16 max-w-full object-contain"
							/>
						{:else}
							<div class="text-center">
								<svg
									class="mx-auto h-7 w-7 text-ink-400"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="1.5"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
									/>
								</svg>
								<p class="mt-2 text-xs text-ink-500">Логотип ещё не выбран</p>
							</div>
						{/if}
					</div>

					<button
						type="button"
						onclick={openLogoPicker}
						class="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-link-500/35 bg-link-500/10 px-4 py-3 text-xs font-semibold text-link-200 transition-[background-color,border-color,transform] duration-[var(--ds-motion-duration-ui)] ease-ui hover:border-link-400/60 hover:bg-link-500/18 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 focus-visible:outline-none active:scale-[0.98]"
					>
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"
							/>
						</svg>
						{logoUrl ? 'Заменить логотип' : 'Выбрать логотип'}
					</button>
					<p class="mt-2 text-[11px] leading-relaxed text-ink-400">
						PNG, JPG, WebP или SVG · исходник до 20 МБ. Перед загрузкой можно обрезать; результат
						будет сжат. Логотип общий для всех вариантов меню.
					</p>
				</div>
			</section>

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

{#if logoPickerOpen && editContext}
	<BgImagePicker
		{editContext}
		currentImage={logoUrl}
		defaultImage={logoUrl}
		folder="logos"
		title="Логотип сайта"
		cropUploads
		aspectRatio={NaN}
		previewFit="contain"
		maxUploadBytes={20 * 1024 * 1024}
		cropMaxWidth={1024}
		cropMaxHeight={1024}
		cropOutputMimeType="image/webp"
		cropOutputQuality={0.86}
		cropMaxOutputBytes={2 * 1024 * 1024}
		onApprove={handleLogoApprove}
		onClose={closeLogoPicker}
	/>
{/if}
