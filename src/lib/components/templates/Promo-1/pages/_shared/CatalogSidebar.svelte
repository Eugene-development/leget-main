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
	 * Данные списка: сначала блок из БД (`data[itemsKey]`), при пустом или
	 * отсутствующем значении — статический `defaultItems` от обёртки.
	 */
	import { onMount, type Snippet } from 'svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
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
		cta,
		itemActions
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
		cta?: Partial<SidebarCta>;
		/** Админ-кнопки у пункта списка (сейчас только у мебели). */
		itemActions?: Snippet<[SidebarItem]>;
	} = $props();

	const title = $derived(String(data?.title || defaultTitle));

	/* Блок из БД имеет приоритет; пустой список — повод показать статику. */
	const items = $derived.by<SidebarItem[]>(() => {
		const fromDb = data?.[itemsKey];
		return Array.isArray(fromDb) && fromDb.length > 0 ? fromDb : defaultItems;
	});

	/* В режиме редактирования показываем и отключённые пункты — их видно по бейджу. */
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
			<div
				class="ms-item"
				class:ms-item--active={isActive}
				class:ms-item--off={isEditable && !isEnabled}
				style="--i: {i}"
			>
				<a
					href="{basePath}/{item.slug}"
					class="ms-link"
					class:pointer-events-none={isEditable && !isEnabled}
					aria-current={isActive ? 'page' : undefined}
					onclick={() => (isSheetOpen = false)}
				>
					<span class="ms-label">{label}</span>
					{#if isEditable && !isEnabled}
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

				{#if isEditable && itemActions}
					<div class="ms-controls">
						{@render itemActions(item)}
					</div>
				{/if}
			</div>
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
				{@render heading()}
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

				<div class="ms-sheet-body">
					{@render panel('sheet')}
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	/* ---------------------------------------------------------------- *
	 * Акцент рубрики
	 *
	 * Нейтральная часть карточки (поверхности, текст, тени) одинакова у всех
	 * рубрик, различается только акцент. Он объявлен переменными на корне
	 * каждого из трёх корневых элементов — сайдбара, FAB и листа.
	 * ---------------------------------------------------------------- */
	[data-accent] {
		--ms-accent: #0ea5e9;
		--ms-accent-deep: #0284c7;
		--ms-accent-light: #38bdf8;
		--ms-accent-wash: #f0f9ff;
	}

	[data-accent='amber'] {
		--ms-accent: #f59e0b;
		--ms-accent-deep: #d97706;
		--ms-accent-light: #fbbf24;
		--ms-accent-wash: #fffbeb;
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
		border-radius: 24px;
		border: 1px solid rgb(15 23 42 / 0.06);
		background:
			radial-gradient(
				120% 60% at 50% 0%,
				color-mix(in srgb, var(--ms-accent) 6%, transparent),
				transparent 70%
			),
			linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
		box-shadow:
			0 1px 2px rgb(15 23 42 / 0.04),
			0 12px 28px -14px rgb(15 23 42 / 0.14),
			0 44px 80px -60px color-mix(in srgb, var(--ms-accent-deep) 40%, transparent);
	}

	/* ---------------------------------------------------------------- *
	 * Шапка
	 * ---------------------------------------------------------------- */
	.ms-title {
		font-size: 1.0625rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: #0f172a;
	}

	.ms-rule {
		display: block;
		height: 1px;
		margin-top: 1.15rem;
		background: linear-gradient(90deg, rgb(15 23 42 / 0.12), rgb(15 23 42 / 0));
	}

	.ms-head {
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
		scrollbar-color: rgb(15 23 42 / 0.15) transparent;
	}

	.ms-nav::-webkit-scrollbar {
		width: 5px;
	}
	.ms-nav::-webkit-scrollbar-thumb {
		border-radius: 999px;
		background: rgb(15 23 42 / 0.14);
	}
	.ms-nav::-webkit-scrollbar-track {
		background: transparent;
	}

	.ms-item {
		position: relative;
		display: flex;
		align-items: center;
		border-radius: 14px;
		animation: ms-item-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i) * 45ms);
	}

	/* Подложка-заливка: уезжает влево и «наливается» при наведении. */
	.ms-item::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--ms-accent-wash) 0%, rgb(255 255 255 / 0) 100%);
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
		border-radius: 999px;
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

	.ms-item--off {
		opacity: 0.55;
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
		font-size: 0.9375rem;
		font-weight: 500;
		color: #475569;
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
		border-radius: 6px;
		background: rgb(148 163 184 / 0.2);
		padding: 2px 6px;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #475569;
	}

	.ms-empty {
		padding: 1rem 0.85rem;
		font-size: 0.875rem;
		color: #94a3b8;
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

	/* ---------------------------------------------------------------- *
	 * CTA-карточка
	 * ---------------------------------------------------------------- */
	.ms-cta {
		position: relative;
		flex: none;
		overflow: hidden;
		margin-top: 1.25rem;
		padding: 1.25rem;
		border-radius: 18px;
		background: linear-gradient(155deg, #0f172a 0%, #1e293b 100%);
		box-shadow: 0 18px 40px -24px rgb(15 23 42 / 0.7);
	}

	.ms-cta-glow {
		position: absolute;
		top: -55%;
		right: -25%;
		width: 180px;
		height: 180px;
		border-radius: 999px;
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
		font-size: 0.9375rem;
		font-weight: 600;
		color: #ffffff;
	}

	.ms-cta-text {
		margin-top: 0.4rem;
		font-size: 0.8125rem;
		line-height: 1.55;
		color: rgb(203 213 225 / 0.9);
	}

	.ms-cta-btn {
		position: relative;
		overflow: hidden;
		width: 100%;
		margin-top: 1rem;
		padding: 0.65rem 1rem;
		border-radius: 12px;
		background: #ffffff;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #0f172a;
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
		border-radius: 999px;
		background: linear-gradient(155deg, #0f172a 0%, #1e293b 100%);
		font-size: 0.8125rem;
		font-weight: 600;
		color: #ffffff;
		box-shadow:
			0 10px 30px -10px rgb(15 23 42 / 0.65),
			0 0 0 1px rgb(255 255 255 / 0.06) inset;
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
		border-radius: 999px;
		background: color-mix(in srgb, var(--ms-accent) 90%, transparent);
		font-size: 11px;
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
		background: rgb(2 6 23 / 0.5);
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
		border-radius: 26px 26px 0 0;
		background:
			radial-gradient(
				120% 40% at 50% 0%,
				color-mix(in srgb, var(--ms-accent) 7%, transparent),
				transparent 70%
			),
			linear-gradient(180deg, #ffffff 0%, #fbfcfe 100%);
		box-shadow: 0 -20px 60px -20px rgb(15 23 42 / 0.35);
	}

	@media (min-width: 640px) {
		.ms-sheet {
			max-width: 460px;
			margin: 0 auto 1rem;
			border-radius: 26px;
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
		border-radius: 999px;
		background: rgb(15 23 42 / 0.14);
	}

	.ms-sheet-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid rgb(15 23 42 / 0.07);
	}

	.ms-close {
		display: inline-flex;
		flex: none;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: 999px;
		background: rgb(15 23 42 / 0.05);
		color: #475569;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
	}

	.ms-close:hover {
		background: rgb(15 23 42 / 0.09);
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
