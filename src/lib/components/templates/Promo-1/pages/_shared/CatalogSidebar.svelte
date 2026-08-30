<script lang="ts">
	/**
	 * Общий сайдбар рубрик каталога Promo-1.
	 *
	 * Один компонент на все рубрики (/mebel, /stoleshnica, /bytovaya-tehnika,
	 * /santehnika, /furnitura, /plitka) и на вложенные страницы категорий.
	 * Рубрика-обёртка (MebelSidebar и т.п.) остаётся отдельным блоком страницы —
	 * у неё свой артикул и свой ключ в componentsData, — но всю разметку,
	 * раскладку и поведение отдаёт сюда.
	 *
	 * Данные списка: ответ API (`data[itemsKey]`), включая пустой массив.
	 * Статический `defaultItems` нужен только для превью без данных API.
	 */
	import { onMount, type Snippet } from 'svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { saveComponentData, toggleCategory, type EditContext } from '$lib/utils/page-edit';
	import EditableField from '$lib/components/EditableField.svelte';
	import { browser } from '$app/environment';
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { serviceOrderStore, type ServiceType } from '$lib/stores/serviceOrder.svelte';

	interface SidebarItem {
		id?: string;
		slug: string;
		/** Подпись: у разных рубрик исторически разные ключи. */
		value?: string;
		title?: string;
		name?: string;
		is_enabled?: boolean;
		brands?: SidebarItem[];
		[key: string]: unknown;
	}

	interface SidebarCta {
		title: string;
		text: string;
		button: string;
		serviceType: ServiceType;
	}

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentType,
		itemsKey = 'categories',
		basePath,
		defaultTitle,
		defaultItems = [],
		fabLabel = 'Разделы',
		emptyText = 'Разделы появятся здесь',
		accent = 'sky',
		showDisabledBadge = true,
		canToggleItems = false,
		nestedBrands = false,
		itemNoun = 'пункт',
		cta,
		itemActions,
		settings
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		/** Тип блока в componentsData — под ним же сохраняется заголовок. */
		componentType: string;
		/** Поле блока со списком: categories / brands / shops. */
		itemsKey?: string;
		/** Префикс ссылок пункта: '/mebel' → /mebel/{slug}. */
		basePath: string;
		defaultTitle: string;
		/** Статический список на случай, если в БД по блоку ничего нет. */
		defaultItems?: SidebarItem[];
		/** Подпись плавающей кнопки на мобильных. */
		fabLabel?: string;
		emptyText?: string;
		accent?: 'sky' | 'amber';
		showDisabledBadge?: boolean;
		/**
		 * Тумблер «показать/скрыть» у пункта. Включается там, где список —
		 * настоящий справочник в БД: у пункта есть `id`, и состояние хранится
		 * в настройках сайта, а не в общем справочнике. У пунктов без `id` (статика
		 * обёртки) тумблера нет — переключать нечего.
		 */
		canToggleItems?: boolean;
		nestedBrands?: boolean;
		/** Существительное в винительном падеже для подписей тумблера: «категорию», «бренд». */
		itemNoun?: string;
		cta?: Partial<SidebarCta>;
		/** Админ-кнопки у пункта списка (сейчас только у мебели). */
		itemActions?: Snippet<[SidebarItem]>;
		/** Контрол настроек блока, встроенный в шапку сайдбара. */
		settings?: Snippet;
	} = $props();

	const title = $derived(String(data?.title || defaultTitle));
	let expandedMaterials = $state<Record<string, boolean>>({});
	const sidebarId = $props.id();
	const activeMaterial = $derived(String(data?.activeSlug ?? ''));
	function isExpanded(slug: string) {
		return expandedMaterials[`${activeMaterial}:${slug}`] ?? slug === activeMaterial;
	}

	/* Пустой ответ API не должен возвращать скрытые/удалённые пункты из статики. */
	const items = $derived.by<SidebarItem[]>(() => {
		const fromDb = data?.[itemsKey];
		return Array.isArray(fromDb) ? fromDb : defaultItems;
	});

	/* В режиме редактирования показываем и отключённые пункты, чтобы их можно было включить обратно. */
	const visibleItems = $derived(
		isEditable ? items : items.filter((item) => item.is_enabled !== false)
	);

	function labelOf(item: SidebarItem) {
		return String(item.value ?? item.title ?? item.name ?? '');
	}

	async function saveTitle(value: string) {
		if (!editContext) return;
		const updated = { ...data, title: value };
		await saveComponentData(editContext, componentType, updated);
		data = updated;
	}

	/* Пункты в процессе переключения: у каждого свой спиннер, поэтому набор, а не флаг. */
	let togglingIds = $state(new Set<string>());

	/**
	 * Переключение пункта справочника. Мутация одна на все рубрики
	 * (`toggleCategory`): и категории мебели, и бренды бытовой техники — строки
	 * одной таблицы, различает их только рубрика.
	 *
	 * После успеха перезагружаем данные страницы: список приезжает с сервера
	 * внутри ответа renderPage, локальная правка `data` разошлась бы с ним.
	 */
	async function handleToggleItem(item: SidebarItem, e: Event) {
		e.preventDefault();
		e.stopPropagation();

		const id = String(item.id ?? '');
		if (!id || !editContext || togglingIds.has(id)) return;

		togglingIds.add(id);
		togglingIds = new Set(togglingIds);

		try {
			await toggleCategory(editContext, id, item.is_enabled === false);
			const itemPath = `${basePath}/${item.slug}`;
			if (
				item.is_enabled !== false &&
				browser &&
				(window.location.pathname === itemPath ||
					window.location.pathname.startsWith(`${itemPath}/`))
			) {
				await goto(basePath, { invalidateAll: true });
			} else {
				await invalidateAll();
			}
		} catch (err: any) {
			console.error('Failed to toggle sidebar item:', err);
			alert(`Не удалось изменить состояние (${itemNoun}): ` + (err.message || 'ошибка'));
		} finally {
			togglingIds.delete(id);
			togglingIds = new Set(togglingIds);
		}
	}

	const ctaContent = $derived<SidebarCta>({
		title: 'Нужна помощь?',
		text: 'Наш старший дизайнер ответит на все ваши вопросы',
		button: 'Бесплатная консультация',
		serviceType: 'consultation',
		...cta
	});

	/**
	 * Форму заявки рисует глобальный ServiceOrderIsland (смонтирован в +layout.svelte),
	 * блоку достаточно открыть его через стор — так же, как это делают
	 * ConsultationHero и PromoOffer.
	 *
	 * Мобильный лист сначала закрываем: он лежит выше дровера по z-index и держит
	 * скролл body заблокированным.
	 */
	function openCta() {
		isSheetOpen = false;
		serviceOrderStore.open(ctaContent.serviceType);
	}

	/* ------------------------------------------------------------------ *
	 * Раскладка десктопного сайдбара
	 *
	 * Сайдбар — position: fixed (он рендерится отдельным блоком страницы,
	 * рядом с остальными секциями, поэтому sticky ему «не за что» зацепиться:
	 * его родитель по высоте равен ему самому).
	 *
	 * Что считаем каждый кадр:
	 *  - top: выравниваем по верху контента (.mebel-container), но не выше,
	 *    чем на 16px под липким хэдером. Нижнюю границу хэдера меряем, а не
	 *    хардкодим, и учитываем логотип: он висит на -mb-10 и выступает ниже
	 *    самого хэдера ровно над сайдбаром — иначе карточка на него наезжает;
	 *  - нижнюю границу: низ вьюпорта или верх футера — что ближе. Если карточка
	 *    не помещается, сначала поднимаем её (до предела под хэдером), и только
	 *    потом отдаём списку внутренний скролл через max-height.
	 * ------------------------------------------------------------------ */
	const GAP = 24;

	let sidebarElement: HTMLElement | null = $state(null);
	let cardElement: HTMLElement | null = $state(null);
	let offsetTop = $state(190);
	let maxHeight = $state(0);

	/* Мобильная раскладка: вместо скрытого сайдбара — плавающая кнопка и bottom sheet.
	   isDesktop стартует с true, чтобы SSR отдал десктопную разметку (на узких
	   экранах она всё равно скрыта через CSS), а на клиенте matchMedia сразу
	   переключит режим — без дублирования EditableField в DOM. */
	let isDesktop = $state(true);
	let isSheetOpen = $state(false);

	onMount(() => {
		const mq = window.matchMedia('(min-width: 1024px)');
		const applyMq = () => {
			isDesktop = mq.matches;
			if (isDesktop) isSheetOpen = false;
		};
		applyMq();
		mq.addEventListener('change', applyMq);

		let frame = 0;
		const measure = () => {
			frame = 0;
			if (!isDesktop || !sidebarElement || !cardElement) return;

			const header = document.querySelector('header');
			const footer = document.querySelector('footer');
			const container = document.querySelector('.mebel-container');

			let headerBottom = header ? header.getBoundingClientRect().bottom : 96;
			// Логотип вынесен из потока хэдера вниз (-mb-10) и висит прямо над
			// сайдбаром — считаем нижней границей шапки его низ, если он ниже.
			const logo = header?.querySelector('a[href="/"]');
			if (logo) headerBottom = Math.max(headerBottom, logo.getBoundingClientRect().bottom);

			const minTop = headerBottom + 16;
			const naturalTop = container ? container.getBoundingClientRect().top : minTop;

			let top = Math.max(minTop, naturalTop);

			let bottomLimit = window.innerHeight - GAP;
			if (footer) bottomLimit = Math.min(bottomLimit, footer.getBoundingClientRect().top - GAP);

			const cardHeight = cardElement.scrollHeight;
			if (cardHeight > bottomLimit - top) {
				top = Math.max(minTop, bottomLimit - cardHeight);
			}

			offsetTop = Math.round(top);
			maxHeight = Math.max(200, Math.round(bottomLimit - top));
		};

		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(measure);
		};

		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);

		const observer = new ResizeObserver(schedule);
		const footer = document.querySelector('footer');
		if (footer) observer.observe(footer);
		if (document.body) observer.observe(document.body);
		if (cardElement) observer.observe(cardElement);

		measure();

		return () => {
			if (frame) cancelAnimationFrame(frame);
			mq.removeEventListener('change', applyMq);
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			observer.disconnect();
		};
	});

	// Блокируем скролл страницы, пока открыт bottom sheet.
	$effect(() => {
		if (!browser) return;
		if (!isSheetOpen) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previous;
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isSheetOpen) isSheetOpen = false;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Содержимое панели: одно на десктоп и на мобильный лист. -->
{#snippet panel(context: 'desktop' | 'sheet')}
	<nav class="ms-nav" aria-label={title}>
		{#each visibleItems as item, i (item.id ?? item.slug)}
			{@const isActive = item.slug === data?.activeSlug}
			{@const isEnabled = item.is_enabled !== false}
			{@const label = labelOf(item)}
			{@const expanded = isExpanded(item.slug)}
			{@const brands = (item.brands ?? []).filter(
				(brand) => isEditable || brand.is_enabled !== false
			)}
			<div
				class="ms-item"
				class:ms-item--active={isActive}
				class:ms-item--off={isEditable && !isEnabled}
				style="--i: {i}"
			>
				{#if nestedBrands}
					<button
						type="button"
						class="ms-link ms-expand"
						aria-expanded={expanded}
						aria-controls="{sidebarId}-{context}-{item.slug}"
						onclick={() => (expandedMaterials[`${activeMaterial}:${item.slug}`] = !expanded)}
					>
						<span class="ms-label">{label}</span>
						{#if showDisabledBadge && isEditable && !isEnabled}<span class="ms-badge">Откл.</span
							>{/if}
						<svg
							class="ms-expand-icon"
							class:ms-expand-icon--open={expanded}
							viewBox="0 0 24 24"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="m6 9 6 6 6-6"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
					</button>
				{:else}
					<a
						href="{basePath}/{item.slug}"
						class="ms-link"
						class:pointer-events-none={isEditable && !isEnabled}
						aria-current={isActive ? 'page' : undefined}
						onclick={() => (isSheetOpen = false)}
					>
						<span class="ms-label">{label}</span>
						{#if showDisabledBadge && isEditable && !isEnabled}
							<span class="ms-badge">Откл.</span>
						{/if}
						{#if !isEditable}
							<svg class="ms-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M9 5l7 7-7 7"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{/if}
					</a>
				{/if}

				{#if isEditable && (itemActions || (canToggleItems && item.id))}
					<div class="ms-controls">
						{#if itemActions}
							{@render itemActions(item)}
						{/if}

						{#if canToggleItems && item.id}
							{@const isToggling = togglingIds.has(String(item.id))}
							<button
								type="button"
								onclick={(e) => handleToggleItem(item, e)}
								disabled={isToggling}
								class="ms-switch"
								class:ms-switch--on={isEnabled}
								title={isEnabled ? `Скрыть ${itemNoun}` : `Показать ${itemNoun}`}
								aria-label={isEnabled ? `Скрыть ${itemNoun}` : `Показать ${itemNoun}`}
								aria-pressed={isEnabled}
							>
								<span class="ms-knob">
									{#if isToggling}
										<svg class="ms-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
											<circle
												class="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												stroke-width="4"
											></circle>
											<path
												class="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
											></path>
										</svg>
									{/if}
								</span>
							</button>
						{/if}
					</div>
				{/if}
			</div>
			{#if nestedBrands}
				<div
					id="{sidebarId}-{context}-{item.slug}"
					class="ms-brands"
					class:ms-brands--expanded={expanded}
					inert={!expanded}
					aria-hidden={!expanded}
				>
					<div class="ms-brands-clip">
						<div class="ms-brands-content">
							{#each brands as brand (brand.id ?? brand.slug)}
								<a
									href="{basePath}/{item.slug}/{brand.slug}"
									class="ms-brand-link"
									aria-current={isActive && brand.slug === data?.activeBrandSlug
										? 'page'
										: undefined}
									onclick={() => (isSheetOpen = false)}>{labelOf(brand)}</a
								>
							{:else}
								<p class="ms-empty">Бренды скоро появятся</p>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		{/each}

		{#if visibleItems.length === 0}
			<p class="ms-empty">{emptyText}</p>
		{/if}
	</nav>

	<div class="ms-cta" class:ms-cta--sheet={context === 'sheet'}>
		<span class="ms-cta-glow" aria-hidden="true"></span>
		<div class="relative">
			<h4 class="p1-title-sub ms-cta-title">{ctaContent.title}</h4>
			<p class="ms-cta-text">{ctaContent.text}</p>
			<button type="button" class="ms-cta-btn" onclick={openCta}>
				<span>{ctaContent.button}</span>
			</button>
		</div>
	</div>
{/snippet}

{#snippet heading()}
	<h3 class="p1-title-sub ms-title">
		<EditableField
			fieldKey="{componentType}.title"
			label="Заголовок сайдбара"
			value={title}
			{isEditable}
			inline
			onSave={saveTitle}
		>
			{#snippet children(val)}
				{val}
			{/snippet}
		</EditableField>
	</h3>
{/snippet}

{#if isDesktop}
	<aside
		bind:this={sidebarElement}
		class="mebel-sidebar"
		data-accent={accent}
		style="top: {offsetTop}px;"
		aria-label={title}
	>
		<div
			bind:this={cardElement}
			class="ms-card"
			style={maxHeight ? `max-height: ${maxHeight}px` : ''}
		>
			<div class="ms-head">
				<div class="ms-head-row">
					{@render heading()}
					{#if isEditable && editContext && settings}
						<div class="ms-settings">{@render settings()}</div>
					{/if}
				</div>
				<span class="ms-rule" aria-hidden="true"></span>
			</div>

			{@render panel('desktop')}
		</div>
	</aside>
{:else}
	<!-- Мобильный/планшетный режим: плавающая кнопка + bottom sheet -->
	<button type="button" class="ms-fab" data-accent={accent} onclick={() => (isSheetOpen = true)}>
		<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<path
				d="M4 6h16M4 12h16M4 18h10"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
			/>
		</svg>
		<span>{fabLabel}</span>
		{#if visibleItems.length}
			<span class="ms-fab-count">{visibleItems.length}</span>
		{/if}
	</button>

	{#if isSheetOpen}
		<div
			class="ms-sheet-root"
			data-accent={accent}
			role="dialog"
			aria-modal="true"
			aria-label={title}
		>
			<button
				type="button"
				class="ms-scrim"
				aria-label="Закрыть"
				onclick={() => (isSheetOpen = false)}
				transition:fade={{ duration: 200 }}
			></button>

			<div
				class="ms-sheet"
				transition:fly={{ y: 420, duration: 380, easing: cubicOut, opacity: 1 }}
			>
				<span class="ms-grabber" aria-hidden="true"></span>

				<div class="ms-sheet-head">
					<div>
						{@render heading()}
					</div>
					<div class="ms-sheet-actions">
						{#if isEditable && editContext && settings}
							<div class="ms-settings">{@render settings()}</div>
						{/if}
						<button
							type="button"
							class="ms-close"
							onclick={() => (isSheetOpen = false)}
							aria-label="Закрыть"
						>
							<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
								<path
									d="M6 6l12 12M18 6L6 18"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div class="ms-sheet-body">
					{@render panel('sheet')}
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.ms-expand {
		width: 100%;
		text-align: left;
		cursor: pointer;
	}
	.ms-expand-icon {
		width: 15px;
		height: 15px;
		flex: none;
		transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.ms-expand-icon--open {
		transform: rotate(180deg);
	}
	.ms-brands {
		display: grid;
		flex: none;
		grid-template-rows: 0fr;
		opacity: 0;
		transition:
			grid-template-rows 280ms cubic-bezier(0.16, 1, 0.3, 1),
			opacity 180ms ease;
	}
	.ms-brands--expanded {
		grid-template-rows: 1fr;
		opacity: 1;
	}
	.ms-brands-clip {
		min-height: 0;
		overflow: hidden;
	}
	.ms-brands-content {
		padding: 0 0.5rem 0.5rem 1rem;
	}
	@media (prefers-reduced-motion: reduce) {
		.ms-brands,
		.ms-expand-icon {
			transition: none;
		}
	}
	.ms-brand-link {
		display: block;
		padding: 0.65rem 0.75rem;
		border-radius: var(--ds-radius-lg);
		font-size: var(--text-sm);
		color: var(--ds-light-body);
	}
	.ms-brand-link:hover,
	.ms-brand-link[aria-current='page'] {
		background: var(--ms-accent-wash);
		color: var(--ms-accent-deep);
	}
	.ms-expand:focus-visible,
	.ms-brand-link:focus-visible {
		outline: 2px solid var(--ms-accent);
		outline-offset: -2px;
	}
	/* ---------------------------------------------------------------- *
	 * Акцент рубрики
	 *
	 * Нейтральная часть карточки (поверхности, текст, тени) одинакова у всех
	 * рубрик, различается только акцент. Он объявлен переменными на корне
	 * каждого из трёх корневых элементов — сайдбара, FAB и листа.
	 * ---------------------------------------------------------------- */
	[data-accent] {
		font-family: var(--ds-font-body);
		--ms-accent: var(--ds-link-500);
		--ms-accent-deep: var(--ds-link-700);
		--ms-accent-light: var(--ds-link-400);
		--ms-accent-wash: var(--ds-link-50);
	}

	[data-accent='amber'] {
		--ms-accent: var(--ds-cat-1-500);
		--ms-accent-deep: var(--ds-cat-1-700);
		--ms-accent-light: var(--ds-cat-1-400);
		--ms-accent-wash: var(--ds-cat-1-50);
	}

	/* ---------------------------------------------------------------- *
	 * Каркас
	 * ---------------------------------------------------------------- */
	.mebel-sidebar {
		position: fixed;
		left: max(1.5rem, calc((100vw - 1536px) / 2 + 1.5rem));
		width: 300px;
		z-index: 30;
		/* top задаётся инлайном из measure() — без transition, чтобы
		   реакция на скролл была мгновенной, как у sticky. */
	}

	@media (max-width: 1536px) {
		.mebel-sidebar {
			left: 1.5rem;
		}
	}

	@media (max-width: 1023.98px) {
		.mebel-sidebar {
			display: none;
		}
	}

	.ms-card {
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 1.5rem 1.25rem 1.25rem;
		border-radius: var(--ds-radius-3xl);
		border: 1px solid color-mix(in srgb, var(--ds-light-title) 6%, transparent);
		background:
			radial-gradient(
				120% 60% at 50% 0%,
				color-mix(in srgb, var(--ms-accent) 6%, transparent),
				transparent 70%
			),
			linear-gradient(180deg, var(--ds-light-overlay) 0%, var(--ds-light-surface-alt) 100%);
		box-shadow:
			0 1px 2px color-mix(in srgb, var(--ds-light-title) 4%, transparent),
			0 12px 28px -14px color-mix(in srgb, var(--ds-light-title) 14.000000000000002%, transparent),
			0 44px 80px -60px color-mix(in srgb, var(--ms-accent-deep) 40%, transparent);
	}

	/* ---------------------------------------------------------------- *
	 * Шапка
	 * ---------------------------------------------------------------- */
	.ms-title {
		font-size: var(--text-lg);
		color: var(--ds-light-title);
	}

	.ms-rule {
		display: block;
		height: 1px;
		margin-top: 1.15rem;
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--ds-light-title) 12%, transparent),
			transparent
		);
	}

	.ms-head {
		flex: none;
	}

	.ms-head-row,
	.ms-sheet-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.ms-settings {
		position: relative;
		z-index: 2;
		flex: none;
	}

	/* ---------------------------------------------------------------- *
	 * Список
	 * ---------------------------------------------------------------- */
	.ms-nav {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		margin: 0.9rem -0.35rem 0;
		padding: 0 0.35rem;
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--ds-light-title) 15%, transparent) transparent;
	}

	.ms-nav::-webkit-scrollbar {
		width: 5px;
	}
	.ms-nav::-webkit-scrollbar-thumb {
		border-radius: var(--ds-radius-full);
		background: color-mix(in srgb, var(--ds-light-title) 14.000000000000002%, transparent);
	}
	.ms-nav::-webkit-scrollbar-track {
		background: transparent;
	}

	.ms-item {
		position: relative;
		display: flex;
		align-items: center;
		border-radius: var(--ds-radius-xl);
		animation: ms-item-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i) * 45ms);
	}

	/* Подложка-заливка: уезжает влево и «наливается» при наведении. */
	.ms-item::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--ms-accent-wash) 0%, transparent 100%);
		opacity: 0;
		transform: translateX(-6px);
		transition:
			opacity 0.28s ease,
			transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
		pointer-events: none;
	}

	.ms-item:hover::before {
		opacity: 1;
		transform: translateX(0);
	}

	/* Акцентная полоса активного пункта. */
	.ms-item::after {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		width: 3px;
		height: 22px;
		border-radius: var(--ds-radius-full);
		background: linear-gradient(180deg, var(--ms-accent-light), var(--ms-accent-deep));
		transform: translateY(-50%) scaleY(0);
		transform-origin: center;
		opacity: 0;
		transition:
			transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
			opacity 0.25s ease;
		pointer-events: none;
	}

	.ms-item--active::before {
		opacity: 1;
		transform: translateX(0);
	}

	.ms-item--active::after {
		transform: translateY(-50%) scaleY(1);
		opacity: 1;
	}

	.ms-item--off .ms-link {
		color: var(--ds-light-muted);
	}

	.ms-link {
		position: relative;
		z-index: 1;
		display: flex;
		flex: 1 1 auto;
		align-items: center;
		gap: 0.625rem;
		min-width: 0;
		padding: 0.7rem 0.85rem;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ds-light-body);
		transition: color 0.22s ease;
	}

	.ms-item:hover .ms-link,
	.ms-item--active .ms-link {
		color: var(--ms-accent-deep);
	}

	.ms-item--active .ms-link {
		font-weight: 600;
	}

	.ms-label {
		flex: 1 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.ms-chevron {
		flex: none;
		width: 15px;
		height: 15px;
		opacity: 0.3;
		transform: translateX(-2px);
		transition:
			opacity 0.25s ease,
			transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.ms-item:hover .ms-chevron,
	.ms-item--active .ms-chevron {
		opacity: 1;
		transform: translateX(1px);
	}

	.ms-badge {
		flex: none;
		border-radius: var(--ds-radius-md);
		background: color-mix(in srgb, var(--ds-light-muted) 15%, transparent);
		padding: 2px 6px;
		font-size: var(--ds-font-note-size);
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ds-light-body);
	}

	.ms-empty {
		padding: 1rem 0.85rem;
		font-size: var(--text-sm);
		color: var(--ds-light-muted);
	}

	/* Контейнер админ-кнопок: сами кнопки приходят сниппетом от обёртки. */
	.ms-controls {
		position: relative;
		z-index: 1;
		display: flex;
		flex: none;
		align-items: center;
		gap: 0.5rem;
		padding-right: 0.75rem;
	}

	/* Тумблер пункта справочника. Цвет берёт акцент рубрики, а не свой: у
	   янтарной рубрики синий тумблер выглядел бы чужой деталью. */
	.ms-switch {
		position: relative;
		display: inline-flex;
		flex: none;
		align-items: center;
		width: 36px;
		height: 20px;
		padding: 2px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-light-muted);
		cursor: pointer;
		transition: background-color 0.25s ease;
	}

	.ms-switch--on {
		background: var(--ms-accent);
	}

	.ms-switch:focus-visible {
		outline: 2px solid var(--ms-accent);
		outline-offset: 2px;
	}

	.ms-switch:disabled {
		cursor: default;
	}

	.ms-knob {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-surface-raised);
		box-shadow: 0 1px 2px color-mix(in srgb, var(--ds-light-title) 20%, transparent);
		transform: translateX(0);
		transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
		pointer-events: none;
	}

	.ms-switch--on .ms-knob {
		transform: translateX(16px);
	}

	.ms-spinner {
		width: 10px;
		height: 10px;
		color: var(--ms-accent);
		animation: ms-spin 0.8s linear infinite;
	}

	@keyframes ms-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ms-knob {
			transition-duration: 0.01ms;
		}
	}

	/* ---------------------------------------------------------------- *
	 * CTA-карточка
	 * ---------------------------------------------------------------- */
	.ms-cta {
		position: relative;
		flex: none;
		overflow: hidden;
		margin-top: 1.25rem;
		padding: 1.25rem;
		border-radius: var(--ds-radius-2xl);
		background: var(--ds-dark-surface);
		box-shadow: 0 18px 40px -24px color-mix(in srgb, var(--ds-light-title) 70%, transparent);
	}

	.ms-cta-glow {
		position: absolute;
		top: -55%;
		right: -25%;
		width: 180px;
		height: 180px;
		border-radius: var(--ds-radius-full);
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--ms-accent-light) 45%, transparent),
			transparent 65%
		);
		filter: blur(6px);
		animation: ms-float 7s ease-in-out infinite;
		pointer-events: none;
	}

	.ms-cta-title {
		font-size: var(--text-base);
		color: var(--ds-dark-title);
	}

	.ms-cta-text {
		margin-top: 0.4rem;
		font-size: var(--text-sm);
		line-height: 1.55;
		color: var(--ds-dark-body);
	}

	.ms-cta-btn {
		position: relative;
		overflow: hidden;
		width: 100%;
		margin-top: 1rem;
		padding: 0.65rem 1rem;
		border-radius: var(--ds-radius-xl);
		background: var(--ds-light-overlay);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--ds-light-title);
		cursor: pointer;
		transition:
			transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 0.25s ease;
	}

	/* Блик, пробегающий по кнопке при наведении. */
	.ms-cta-btn::after {
		content: '';
		position: absolute;
		top: 0;
		left: -120%;
		width: 60%;
		height: 100%;
		background: linear-gradient(
			100deg,
			transparent,
			color-mix(in srgb, var(--ms-accent) 28%, transparent),
			transparent
		);
		transition: left 0.7s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.ms-cta-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 24px -12px color-mix(in srgb, var(--ms-accent-light) 80%, transparent);
	}

	.ms-cta-btn:hover::after {
		left: 130%;
	}

	.ms-cta-btn:active {
		transform: translateY(0) scale(0.985);
	}

	/* ---------------------------------------------------------------- *
	 * Мобильный режим: плавающая кнопка + bottom sheet
	 * ---------------------------------------------------------------- */
	.ms-fab {
		position: fixed;
		right: 1rem;
		bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
		z-index: 60;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.7rem 1.1rem;
		border-radius: var(--ds-radius-full);
		background: var(--ds-dark-surface);
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--ds-dark-title);
		box-shadow:
			0 10px 30px -10px color-mix(in srgb, var(--ds-light-title) 65%, transparent),
			0 0 0 1px color-mix(in srgb, var(--ds-on-dark) 6%, transparent) inset;
		cursor: pointer;
		animation: ms-fab-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
		transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.ms-fab:active {
		transform: scale(0.95);
	}

	.ms-fab-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 6px;
		border-radius: var(--ds-radius-full);
		background: var(--ms-accent-deep);
		color: var(--ds-on-accent);
		font-size: var(--ds-font-note-size);
		font-weight: 700;
	}

	.ms-sheet-root {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		align-items: flex-end;
	}

	.ms-scrim {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background: color-mix(in srgb, var(--ds-scrim) 50%, transparent);
		backdrop-filter: blur(6px);
		border: none;
		cursor: default;
	}

	.ms-sheet {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		max-height: 85vh;
		padding: 0.5rem 1rem calc(1rem + env(safe-area-inset-bottom, 0px));
		border-radius: var(--ds-radius-3xl) var(--ds-radius-3xl) 0 0;
		background:
			radial-gradient(
				120% 40% at 50% 0%,
				color-mix(in srgb, var(--ms-accent) 7%, transparent),
				transparent 70%
			),
			linear-gradient(180deg, var(--ds-light-overlay) 0%, var(--ds-light-surface-alt) 100%);
		box-shadow: 0 -20px 60px -20px color-mix(in srgb, var(--ds-light-title) 35%, transparent);
	}

	@media (min-width: 640px) {
		.ms-sheet {
			max-width: 460px;
			margin: 0 auto 1rem;
			border-radius: var(--ds-radius-3xl);
		}

		.ms-sheet-root {
			align-items: flex-end;
			justify-content: center;
		}
	}

	.ms-grabber {
		width: 40px;
		height: 4px;
		margin: 0.25rem auto 0.75rem;
		border-radius: var(--ds-radius-full);
		background: color-mix(in srgb, var(--ds-light-title) 14.000000000000002%, transparent);
	}

	.ms-sheet-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid
			color-mix(in srgb, var(--ds-light-title) 7.000000000000001%, transparent);
	}

	.ms-close {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: var(--ds-radius-full);
		background: color-mix(in srgb, var(--ds-light-title) 5%, transparent);
		color: var(--ds-light-body);
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.ms-close:hover {
		background: color-mix(in srgb, var(--ds-light-title) 9%, transparent);
	}

	.ms-close:active {
		transform: scale(0.92);
	}

	.ms-sheet-body {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		-webkit-overflow-scrolling: touch;
	}

	/* Внутри листа список не скроллится сам — скроллится весь лист. */
	.ms-sheet-body .ms-nav {
		overflow: visible;
	}

	.ms-sheet-body .ms-link {
		padding-top: 0.85rem;
		padding-bottom: 0.85rem;
	}

	.ms-cta--sheet {
		margin-bottom: 0.25rem;
	}

	/* ---------------------------------------------------------------- *
	 * Анимации
	 * ---------------------------------------------------------------- */
	@keyframes ms-item-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes ms-fab-in {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes ms-float {
		0%,
		100% {
			transform: translate3d(0, 0, 0);
		}
		50% {
			transform: translate3d(-10px, 12px, 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ms-item,
		.ms-fab,
		.ms-cta-glow {
			animation: none;
		}

		.ms-item::before,
		.ms-item::after,
		.ms-chevron,
		.ms-cta-btn,
		.ms-cta-btn::after,
		.ms-close {
			transition-duration: 0.01ms;
		}
	}
</style>
