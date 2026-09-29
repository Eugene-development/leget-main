<script lang="ts">
	import { useImageEditing } from '$lib/utils/image-editing.svelte';
	const imageEditing = useImageEditing();
	// Артикулы: 1.М.1.1, 1.М.1.2, 1.М.1.3, 1.М.1.4 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import MenuV1 from './v1/Menu.svelte';
	import MenuV2 from './v2/Menu.svelte';
	import MenuV3 from './v3/Menu.svelte';
	import MenuV4 from './v4/Menu.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import ImagePickerDialog from '$lib/components/ImagePickerDialog.svelte';
	import {
		saveLayoutData,
		getLayoutComponentArticle,
		type EditContext
	} from '$lib/utils/page-edit';
	import type { CatalogItem } from '../catalogItems';
	import type { ServiceItem } from '../serviceItems';
	import type { Snippet } from 'svelte';
	import '../../theme.css';

	// Вариант всей десктопной шапки — layout-компонент. Как и баннер, его версия хранится
	// в общем header_data blob'е (ключ menuVersion) и сохраняется через
	// saveLayoutData('Header'). Раздел меню в системе артикулов — «М» (тип Header):
	// формат {шаблон}.М.1.{версия}. Header.svelte передаёт общие данные и элементы
	// строки (логотип, город, избранное, действия); вариант задаёт их композицию.
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
		onToggleService,
		logo,
		actions
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
		logo: Snippet<[boolean]>;
		actions: Snippet<[boolean, () => void]>;
	} = $props();

	type MenuVersion = 'v1' | 'v2' | 'v3' | 'v4';

	// Версию читаем сразу при инициализации, а не только в $effect: на сервере
	// эффекты не выполняются, и SSR отдавал бы v1 независимо от данных —
	// на живых сайтах это давало подмену версии после гидратации, а каталог
	// /_ds (пререндер) вообще не смог бы показать ничего, кроме v1.
	let selectedVersion = $state<MenuVersion>((data?.menuVersion as MenuVersion) ?? 'v1');
	let drawerOpen = $state(false);
	let logoPickerOpen = $state(false);
	let hasManuallySelected = $state(false);
	const logoUrl = $derived(typeof data?.logoUrl === 'string' ? data.logoUrl : '');

	function openSettings() {
		drawerOpen = true;
	}

	$effect(() => {
		const ver = (data?.menuVersion as MenuVersion) ?? 'v1';
		if (!hasManuallySelected && ver !== selectedVersion) {
			selectedVersion = ver;
		}
	});

	const versionNumber = (v: unknown): number | null => {
		const m = /^v([1-4])$/.exec(typeof v === 'string' ? v : '');
		return m ? Number(m[1]) : null;
	};

	// Артикул выбранной версии шапки (формат {шаблон}.М.1.{версия}).
	const menuArticle = $derived(
		editContext?.templateId != null
			? getLayoutComponentArticle(editContext.templateId, 'Header', versionNumber(selectedVersion))
			: null
	);

	async function selectVersion(version: MenuVersion) {
		if (version === selectedVersion) return;
		selectedVersion = version;
		hasManuallySelected = true;
		if (!editContext) return;
		const updated = { ...data, menuVersion: version };
		try {
			await saveLayoutData(editContext, 'Header', updated);
			data = updated;
		} catch (err) {
			console.error('Ошибка сохранения версии шапки:', err);
		}
	}

	function openLogoPicker() {
		// Общий ImageWorkspaceDialog сохраняет drawer справа и центрирует picker
		// в оставшейся рабочей области, как во всех остальных редакторах компонентов.
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

	async function handleLogoRemove() {
		await handleLogoApprove('');
	}
</script>

<div class="max-w-9xl mx-auto hidden items-center justify-between px-4 py-3 lg:flex lg:px-8">
	{@render logo(selectedVersion === 'v3')}
	<div class="relative flex items-center gap-2">
		{#if selectedVersion === 'v4'}
			<MenuV4
				{links}
				{visibleCatalogItems}
				{visibleServiceItems}
				{disabledRubrics}
				{disabledServices}
				{isEditable}
				{onToggleRubric}
				{onToggleService}
			/>
		{:else if selectedVersion === 'v3'}
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
	</div>
	{@render actions(selectedVersion === 'v3', openSettings)}
</div>

{#if isEditable && editContext}
	<SideDrawer bind:open={drawerOpen} title="Шапка сайта">
		<div class="flex flex-col gap-6">
			<!-- Артикул выбранной версии -->
			{#if menuArticle}
				<div class="flex items-center gap-2">
					<span class="text-xs font-semibold tracking-[0.2em] text-on-dark/40 uppercase"
						>Артикул</span
					>
					<ArticleBadge article={menuArticle} sectionLabel="Раздел" align="left" />
				</div>
			{/if}

			<section>
				<h4 class="p1-title-sub mb-3 text-xs text-on-dark/40 uppercase">Логотип</h4>
				<div class="rounded-2xl border border-on-dark/10 bg-on-dark/5 p-3">
					<div class="flex min-h-24 items-center justify-center rounded-xl bg-surface-raised p-4">
						{#if logoUrl || imageEditing?.editable}
							<ImageFallback
								imagePath={['logoUrl']}
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
						будет сжат. Логотип общий для всех вариантов шапки.
					</p>
				</div>
			</section>

			<!-- Варианты -->
			<section>
				<h4 class="p1-title-sub mb-3 text-xs text-on-dark/40 uppercase">Вариант дизайна</h4>
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
					<button
						type="button"
						class="w-full cursor-pointer rounded-2xl border px-4 py-3 text-left text-xs font-bold tracking-wider uppercase transition-all duration-200 {selectedVersion ===
						'v4'
							? 'scale-[1.01] border-cat-2-400/40 bg-cat-2-400/10 text-cat-2-100 shadow-md'
							: 'border-on-dark/10 text-ink-400 hover:bg-on-dark/5 hover:text-ink-200'}"
						onclick={() => selectVersion('v4')}
					>
						Вариант 4
					</button>
				</div>
			</section>

			<p class="text-xs leading-relaxed text-ink-400">
				Вариант меняет всю десктопную шапку: логотип, навигацию и действия справа. Их данные
				остаются общими для всех вариантов.
			</p>
		</div>
	</SideDrawer>
{/if}

{#if logoPickerOpen && editContext}
	<ImagePickerDialog
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
		onRemove={handleLogoRemove}
		onClose={closeLogoPicker}
	/>
{/if}
