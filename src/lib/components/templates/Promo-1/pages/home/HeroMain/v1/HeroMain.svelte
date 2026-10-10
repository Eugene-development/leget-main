<script module lang="ts">
	// Browser module memory survives client navigation, but resets on a full reload.
	let noticeDismissed = false;
</script>

<script lang="ts">
	// Артикул: 1.1.1.1 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import HoverSwapLabel from '$lib/components/HoverSwapLabel.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import ImagePickerDialog from '$lib/components/ImagePickerDialog.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { createEditableVisibility } from '$lib/utils/editable-visibility.svelte';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { fly, slide } from 'svelte/transition';
	import { getHeroBackgrounds } from './backgrounds';

	type PartnerBrand = {
		name: string;
		logo: string;
		url: string;
	};

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Видимость сохраняется вместе с контентом HeroMain и применяется на SSR:
	// посетитель не получает скрытые части, а владелец видит их полупрозрачными
	// и может вернуть тем же тумблером рядом с карандашом.
	const visibility = createEditableVisibility({
		getComponentType: () => 'HeroMain',
		getData: () => data,
		setData: (next) => (data = next),
		getEditContext: () => editContext
	});

	const bgImages = $derived(
		getHeroBackgrounds(data ?? {})
			.filter(({ enabled }) => enabled)
			.map(({ url }) => url)
	);
	const bgIntervalMs = $derived(Math.min(300, Math.max(1, Number(data?.bgIntervalV1) || 5)) * 1000);
	let activeBgIndex = $state(0);
	let bgViewport = $state<HTMLDivElement>();
	let bgInViewport = $state(true);
	let pageVisible = $state(true);
	let reducedMotion = $state(false);
	let glassPanel = $state<HTMLDivElement>();
	let heroStage = $state<HTMLElement>();
	let noticeVisible = $state(false);
	let noticeExpanded = $state(false);
	const noticeId = $props.id();
	let noticeHeaderBottom = $state(0);

	$effect(() => {
		if (!heroStage || isEditable) return;
		const root = heroStage;
		let disposed = false;
		let stop: (() => void) | undefined;
		// Load GSAP only for this version in the browser; SSR stays fully visible.
		void import('./motion')
			.then(({ animateHeroEntrance }) => {
				if (!disposed) stop = animateHeroEntrance(root);
			})
			.catch((error) => console.warn('HeroMain entrance unavailable', error));
		return () => {
			disposed = true;
			stop?.();
		};
	});

	function closeNotice() {
		noticeDismissed = true;
		noticeVisible = false;
	}

	onMount(() => {
		const header = document.querySelector('header[data-field-toolbar-scope]');
		if (!header) return;
		const update = () => {
			noticeHeaderBottom = Math.max(0, header.getBoundingClientRect().bottom);
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(header);
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	});

	let noticeTimer: ReturnType<typeof setTimeout>;
	const scheduleNotice = () => {
		clearTimeout(noticeTimer);
		noticeTimer = setTimeout(() => (noticeVisible = true), 2000);
	};

	afterNavigate(({ to }) => {
		clearTimeout(noticeTimer);
		window.removeEventListener('load', scheduleNotice);
		noticeVisible = false;
		noticeExpanded = false;
		if (to?.url.pathname !== '/' || noticeDismissed) return;
		if (document.readyState === 'complete') scheduleNotice();
		else window.addEventListener('load', scheduleNotice, { once: true });
	});

	onDestroy(() => {
		clearTimeout(noticeTimer);
		if (typeof window !== 'undefined') window.removeEventListener('load', scheduleNotice);
	});

	// Decorative pointer response never moves the text or click targets.
	$effect(() => {
		if (!glassPanel || reducedMotion || isEditable) return;
		const panel = glassPanel;
		let frame = 0;
		const move = (event: PointerEvent) => {
			if (event.pointerType !== 'mouse') return;
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const rect = panel.getBoundingClientRect();
				panel.style.setProperty(
					'--glass-x',
					`${((event.clientX - rect.left) / rect.width) * 100}%`
				);
				panel.style.setProperty(
					'--glass-y',
					`${((event.clientY - rect.top) / rect.height) * 100}%`
				);
			});
		};
		const reset = () => {
			cancelAnimationFrame(frame);
			panel.style.removeProperty('--glass-x');
			panel.style.removeProperty('--glass-y');
		};
		panel.addEventListener('pointermove', move);
		panel.addEventListener('pointerleave', reset);
		return () => {
			reset();
			panel.removeEventListener('pointermove', move);
			panel.removeEventListener('pointerleave', reset);
		};
	});

	$effect(() => {
		if (activeBgIndex >= bgImages.length) activeBgIndex = 0;
	});

	$effect(() => {
		if (
			typeof window === 'undefined' ||
			bgImages.length < 2 ||
			reducedMotion ||
			!bgInViewport ||
			!pageVisible
		)
			return;

		const timer = window.setInterval(() => {
			activeBgIndex = (activeBgIndex + 1) % bgImages.length;
		}, bgIntervalMs);
		return () => window.clearInterval(timer);
	});

	onMount(() => {
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const syncMotion = () => (reducedMotion = motion.matches);
		syncMotion();
		motion.addEventListener('change', syncMotion);

		const handleVisibility = () => (pageVisible = document.visibilityState === 'visible');
		handleVisibility();
		document.addEventListener('visibilitychange', handleVisibility);

		const observer =
			bgViewport && typeof IntersectionObserver !== 'undefined'
				? new IntersectionObserver(([entry]) => (bgInViewport = entry?.isIntersecting ?? true), {
						threshold: 0.01
					})
				: null;
		if (bgViewport) observer?.observe(bgViewport);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibility);
			motion.removeEventListener('change', syncMotion);
			observer?.disconnect();
		};
	});

	const defaultBrands: PartnerBrand[] = [
		{
			name: 'Hettich',
			logo: 'https://storage.yandexcloud.net/novostroy/logo/hettich-Logo.png',
			url: 'https://www.hettich.com'
		},
		{
			name: 'Egger',
			logo: 'https://storage.yandexcloud.net/novostroy/logo/egger-Logo.png',
			url: 'https://www.egger.com'
		},
		{
			name: 'Аристо',
			logo: 'https://storage.yandexcloud.net/novostroy/logo/aristo-Logo.png',
			url: 'https://www.aristo.ru'
		},
		{
			name: 'Blum',
			logo: 'https://storage.yandexcloud.net/novostroy/logo/blum-Logo.png',
			url: 'https://www.blum.com'
		}
	];

	const brands = $derived<PartnerBrand[]>(
		Array.isArray(data?.brands) ? (data.brands as PartnerBrand[]) : defaultBrands
	);
	const renderedBrands = $derived(
		brands
			.map((brand, index) => ({ brand, index }))
			.filter(({ index }) => isEditable || visibility.isVisible(`brand:${index}`))
	);
	// Как в Brands v1: сначала наполняем один цикл достаточным числом логотипов,
	// затем выводим два одинаковых цикла и сдвигаем трек ровно на половину.
	// Поэтому лента остаётся бесшовной даже после удаления части брендов.
	const MARQUEE_MIN_ITEMS = 4;
	const marqueeBrands = $derived(
		renderedBrands.length > 0
			? Array.from(
					{ length: Math.max(1, Math.ceil(MARQUEE_MIN_ITEMS / renderedBrands.length)) },
					() => renderedBrands
				).flat()
			: []
	);
	const hasBrandMarquee = $derived(!isEditable && marqueeBrands.length > 0);
	const brandMarqueeDuration = $derived(Math.max(marqueeBrands.length, 4) * 4.5);
	const brandsBlockVisible = $derived(visibility.isVisible('brandsBlock'));
	// Laravel converts an empty string in GraphQL variables to null. Presence of the key
	// therefore distinguishes an intentionally cleared title from untouched defaults.
	const brandsTitle = $derived(
		Object.prototype.hasOwnProperty.call(data ?? {}, 'brandsTitle')
			? String(data?.brandsTitle ?? '')
			: 'РАБОТАЕМ С ЛУЧШИМИ БРЕНДАМИ:'
	);
	const hasBrandsTitle = $derived(brandsTitle.trim().length > 0);

	let editingBrandIndex = $state<number | null>(null);
	let isAddingBrand = $state(false);
	let brandsViewport = $state<HTMLDivElement>();
	let isBrandsVisible = $state(true);
	const editingBrand = $derived(
		isAddingBrand
			? { name: `Партнёр ${brands.length + 1}`, logo: '', url: '' }
			: editingBrandIndex === null
				? null
				: (brands[editingBrandIndex] ?? null)
	);

	$effect(() => {
		if (!brandsViewport || typeof IntersectionObserver === 'undefined') return;

		const observer = new IntersectionObserver(
			([entry]) => {
				isBrandsVisible = entry?.isIntersecting ?? true;
			},
			{ threshold: 0.01 }
		);
		observer.observe(brandsViewport);

		return () => observer.disconnect();
	});

	function openBrandLogoPicker(index: number) {
		isAddingBrand = false;
		editingBrandIndex = index;
	}

	function openNewBrandPicker() {
		editingBrandIndex = null;
		isAddingBrand = true;
	}

	function closeBrandPicker() {
		editingBrandIndex = null;
		isAddingBrand = false;
	}

	async function handleBrandLogoApprove(url: string) {
		if (!editContext) return;

		const updatedBrands = isAddingBrand
			? [
					...brands,
					{
						name: `Партнёр ${brands.length + 1}`,
						logo: url,
						url: ''
					}
				]
			: brands.map((brand, index) =>
					index === editingBrandIndex ? { ...brand, logo: url } : brand
				);
		const updated = { ...data, brands: updatedBrands };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
		closeBrandPicker();
	}

	async function handleBrandLogoRemove() {
		if (isAddingBrand || editingBrandIndex === null || !editContext) return;
		const updatedBrands = brands.map((brand, index) =>
			index === editingBrandIndex ? { ...brand, logo: '' } : brand
		);
		const updated = { ...data, brands: updatedBrands };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
		closeBrandPicker();
	}

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
	}
</script>

<div aria-live="polite" aria-atomic="true">
	{#if noticeVisible}
		<aside
			class="free-services-notice glass-panel rounded-3xl"
			style:--notice-header-bottom={`${noticeHeaderBottom}px`}
			aria-label="Об услугах компании"
			transition:fly={{ y: -12, duration: reducedMotion ? 0 : 480 }}
		>
			<button
				type="button"
				class="notice-close"
				aria-label="Закрыть уведомление"
				data-goal-ignore="Закрытие информационного уведомления без формы"
				onclick={closeNotice}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					aria-hidden="true"
				>
					<path d="m6 6 12 12M18 6 6 18" stroke-linecap="round" />
				</svg>
			</button>
			<p class="notice-title">Наши услуги бесплатны</p>
			<button
				type="button"
				class="notice-details"
				aria-expanded={noticeExpanded}
				aria-controls={noticeId}
				data-goal-ignore="Раскрытие пояснения о бесплатных услугах, не форма"
				onclick={() => (noticeExpanded = !noticeExpanded)}
			>
				{noticeExpanded ? 'Свернуть' : 'Подробнее'}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					aria-hidden="true"
					class:notice-chevron-open={noticeExpanded}
				>
					<path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
			<div id={noticeId}>
				{#if noticeExpanded}
					<div transition:slide={{ duration: reducedMotion ? 0 : 260 }}>
						<p class="notice-comment text-sm">
							Наш сервис — место, где встречаются покупатели и поставщики товаров и услуг.
						</p>
						<p class="notice-comment text-sm">
							Проект «Новострой» даёт полезные бесплатные рекомендации, которые ни к чему вас не
							обязывают.
						</p>
					</div>
				{/if}
			</div>
		</aside>
	{/if}
</div>

<section
	bind:this={heroStage}
	class="hero-stage relative flex min-h-full w-full items-end overflow-hidden text-ink-900"
>
	<!-- Фоновое изображение -->
	<div class="hero-background absolute inset-0 z-0 bg-surface-raised" bind:this={bgViewport}>
		{#each bgImages as bgImage, index (`${index}:${bgImage}`)}
			<div
				class="hero-bg-slide absolute inset-0 {index === activeBgIndex
					? 'hero-bg-slide-active'
					: ''}"
				aria-hidden={index === activeBgIndex ? undefined : 'true'}
			>
				<!-- Новые интерьеры скомпонованы от верхнего края; у остальных фото сохраняем центр. -->
				<ImageFallback
					imagePath={[
						'bgImagesV1',
						Math.max(
							0,
							Array.isArray(data.bgImagesV1) && data.bgImagesV1.includes(bgImage)
								? data.bgImagesV1.indexOf(bgImage)
								: getHeroBackgrounds(data).findIndex((item) => item.url === bgImage)
						)
					]}
					imageDefaults={{ bgImagesV1: getHeroBackgrounds(data).map((item) => item.url) }}
					src={bgImage}
					alt=""
					class="h-full w-full object-cover {bgImage.startsWith(
						'https://storage.yandexcloud.net/leget-main/templates/promo-1/hero-interior-'
					)
						? 'object-top'
						: 'object-center'}"
				/>
			</div>
		{/each}
		<div class="absolute inset-0 bg-linear-to-b from-scrim/20 via-scrim/10 to-scrim/30"></div>
	</div>

	{#if editingBrand && editContext}
		<ImagePickerDialog
			{editContext}
			currentImage={editingBrand.logo}
			folder="logos"
			title={`Логотип партнёра «${editingBrand.name}»`}
			cropUploads
			aspectRatio={NaN}
			previewFit="contain"
			maxUploadBytes={20 * 1024 * 1024}
			cropMaxWidth={1024}
			cropMaxHeight={1024}
			cropOutputMimeType="image/webp"
			cropOutputQuality={0.86}
			cropMaxOutputBytes={2 * 1024 * 1024}
			onApprove={handleBrandLogoApprove}
			onRemove={!isAddingBrand ? handleBrandLogoRemove : null}
			onClose={closeBrandPicker}
		/>
	{/if}

	<!-- Основной контент -->
	<div class="hero-shell relative z-10 w-full">
		<!-- Стеклянная панель -->
		<div
			bind:this={glassPanel}
			class="glass-panel relative flex w-full flex-col rounded-3xl border border-on-dark/40"
		>
			<!-- Контент -->
			<div class="hero-content relative flex min-w-0 flex-col items-center text-center">
				<!-- Название компании -->
				<EditableField
					fieldKey="HeroMain.companyName"
					label="Название компании"
					value={String(data?.companyName ?? '')}
					{isEditable}
					visible={visibility.isVisible('companyName')}
					visibilityLabel="название компании"
					visibilityPending={visibility.isPending('companyName')}
					onToggleVisibility={(event) => visibility.toggle('companyName', event)}
					onSave={(v) => saveField('companyName', v)}
					class="-mb-2 block"
				>
					{#snippet children(displayValue)}
						<span class="hero-company ds-label inline-block text-ink-700">
							<RichText value={displayValue} />
						</span>
					{/snippet}
				</EditableField>

				<!-- Заголовок -->
				<EditableField
					fieldKey="HeroMain.title"
					label="Заголовок"
					value={String(data?.title ?? '')}
					{isEditable}
					visible={visibility.isVisible('title')}
					visibilityLabel="заголовок"
					visibilityPending={visibility.isPending('title')}
					onToggleVisibility={(event) => visibility.toggle('title', event)}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h1 class="hero-title text-4xl text-ink-900 md:text-5xl">
							<RichText value={displayValue} />
						</h1>
					{/snippet}
				</EditableField>

				<!-- Описание -->
				<EditableField
					fieldKey="HeroMain.description"
					label="Описание"
					value={String(data?.description ?? '')}
					{isEditable}
					multiline
					visible={visibility.isVisible('description')}
					visibilityLabel="описание"
					visibilityPending={visibility.isPending('description')}
					onToggleVisibility={(event) => visibility.toggle('description', event)}
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="hero-description text-sm text-ink-900 md:text-base">
							<RichText value={displayValue} />
						</p>
					{/snippet}
				</EditableField>

				<!-- Кнопки. Направление не reverse: пока кнопка была одна, порядок
				     ничего не значил, а со вторым CTA он стал смыслом — основной
				     остаётся первым и на мобильном, и на десктопе. -->
				<div class="hero-actions flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2">
					<EditableField
						fieldKey="HeroMain.buttonText"
						label="Текст кнопки"
						value={String(data?.buttonText ?? 'Дизайн-проект с расчётом стоимости')}
						{isEditable}
						visible={visibility.isVisible('button')}
						visibilityLabel="кнопку"
						visibilityPending={visibility.isPending('button')}
						onToggleVisibility={(event) => visibility.toggle('button', event)}
						onSave={(v) => saveField('buttonText', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<button
								data-metrika-goal="pages_home_heromain_v1_heromain_open_1"
								data-goal-label="Консультация (текст кнопки настраивается)"
								data-goal-action="open"
								type="button"
								onclick={() => serviceOrderStore.open('consultation')}
								class="hero-primary group cursor-pointer rounded-xl border border-ink-900 bg-ink-900 px-5 py-3 text-center text-sm font-semibold text-on-dark shadow-sm transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
							>
								<HoverSwapLabel text={displayValue} disabled={isEditable} />
							</button>
						{/snippet}
					</EditableField>

					<!-- Вторичное действие — текстовая кнопка рядом с основным CTA. -->
					<EditableField
						fieldKey="HeroMain.promoButtonText"
						label="Текст кнопки промокода"
						value={String(data?.promoButtonText ?? 'Получить промокод')}
						{isEditable}
						visible={visibility.isVisible('promoButton')}
						visibilityLabel="кнопку промокода"
						visibilityPending={visibility.isPending('promoButton')}
						onToggleVisibility={(event) => visibility.toggle('promoButton', event)}
						onSave={(v) => saveField('promoButtonText', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<button
								data-metrika-goal="pages_home_heromain_v1_heromain_open_2"
								data-goal-label="Получить промокод"
								data-goal-action="open"
								type="button"
								onclick={() => serviceOrderStore.open('promo')}
								class="cursor-pointer rounded-xl px-1 py-3 text-center text-sm font-semibold text-ink-900 underline decoration-ink-900/25 underline-offset-8 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:text-ink-900 hover:decoration-ink-900/60 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
							>
								<RichText value={displayValue} />
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>

			{#if (renderedBrands.length > 0 && brandsBlockVisible) || isEditable}
				<!-- Секция брендов -->
				<div class="hero-brands relative flex w-full justify-center px-6 pt-4 pb-8">
					<div class="flex w-full flex-col items-center">
						<EditableField
							fieldKey="HeroMain.brandsTitle"
							label="Заголовок блока брендов"
							value={brandsTitle}
							{isEditable}
							visible={brandsBlockVisible}
							visibilityLabel="блок брендов"
							visibilityPending={visibility.isPending('brandsBlock')}
							onToggleVisibility={(event) => visibility.toggle('brandsBlock', event)}
							onSave={(v) => saveField('brandsTitle', v)}
							class={hasBrandsTitle ? 'block' : 'brands-title-empty'}
						>
							{#snippet children(displayValue)}
								{#if displayValue.trim()}
									<p
										class="hero-brands-label mb-3 min-h-4 text-xs font-semibold tracking-widest text-ink-700 uppercase {isEditable
											? 'block'
											: 'hidden md:block'}"
									>
										<RichText value={displayValue} />
									</p>
								{/if}
							{/snippet}
						</EditableField>
						<div
							class="flex w-full items-center gap-3 transition-[opacity,filter] duration-[var(--ds-motion-duration-ui)] ease-ui md:gap-5 {brandsBlockVisible
								? ''
								: 'opacity-45 grayscale'}"
						>
							<div
								class="brand-viewport {hasBrandMarquee ? 'brand-viewport-scroll' : ''}"
								bind:this={brandsViewport}
							>
								<div
									class="brand-track {hasBrandMarquee
										? 'brand-track-marquee'
										: ''} {!isBrandsVisible || !brandsBlockVisible ? 'brand-track-paused' : ''}"
									style={`--brand-duration: ${brandMarqueeDuration}s`}
								>
									{#each Array(hasBrandMarquee ? 2 : 1) as _, copyIndex}
										<div
											class="brand-group {hasBrandMarquee
												? 'brand-group-marquee'
												: 'brand-group-static'} {copyIndex === 1 ? 'brand-group-copy' : ''}"
											aria-hidden={copyIndex === 1 ? 'true' : undefined}
										>
											{#each hasBrandMarquee ? marqueeBrands : renderedBrands as { brand, index }}
												<div
													class="brand-item {hasBrandMarquee
														? 'brand-item-marquee'
														: 'brand-item-static'}"
												>
													{#if isEditable && editContext}
														<div
															class="brand-logo flex h-10 w-full items-center justify-center px-2 {visibility.isVisible(
																`brand:${index}`
															)
																? ''
																: 'opacity-45 grayscale'}"
														>
															<ImageFallback
																imagePath={['brands', index, 'logo']}
																onImageEdit={() => openBrandLogoPicker(index)}
																imageVisibility={{
																	visible: visibility.isVisible(`brand:${index}`),
																	pending: visibility.isPending(`brand:${index}`),
																	label: `логотип «${brand.name}»`,
																	onToggle: (event) => visibility.toggle(`brand:${index}`, event)
																}}
																imageDefaults={{ brands }}
																class="max-h-full max-w-full object-contain"
																src={brand.logo}
																alt={copyIndex === 1 ? '' : brand.name}
															/>
														</div>
													{:else if brand.url}
														<a
															href={brand.url}
															target="_blank"
															rel="noopener noreferrer"
															tabindex={copyIndex === 1 ? -1 : undefined}
															class="brand-logo group flex h-8 w-full items-center justify-center px-2 opacity-90 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:opacity-100"
														>
															<ImageFallback
																imagePath={['brands', index, 'logo']}
																imageDefaults={{ brands }}
																class="max-h-full max-w-full object-contain"
																src={brand.logo}
																alt={copyIndex === 1 ? '' : brand.name}
															/>
														</a>
													{:else}
														<div
															class="brand-logo flex h-8 w-full items-center justify-center px-2"
														>
															<ImageFallback
																imagePath={['brands', index, 'logo']}
																imageDefaults={{ brands }}
																class="max-h-full max-w-full object-contain"
																src={brand.logo}
																alt={copyIndex === 1 ? '' : brand.name}
															/>
														</div>
													{/if}
												</div>
											{/each}
										</div>
									{/each}
								</div>
							</div>

							{#if isEditable && editContext}
								<button
									type="button"
									onclick={openNewBrandPicker}
									class="brand-add flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-ink-400 bg-surface-raised/70 text-ink-700 shadow-sm transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:border-link-500 hover:text-link-600 hover:shadow-md focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
									aria-label="Добавить логотип партнёра"
									title="Добавить логотип партнёра"
								>
									<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1.75"
											d="M12 5v14M5 12h14"
										/>
									</svg>
								</button>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.free-services-notice {
		position: fixed;
		top: calc(max(var(--notice-header-bottom), env(safe-area-inset-top)) + 1rem);
		right: max(1rem, env(safe-area-inset-right));
		z-index: 160;
		width: min(23rem, calc(100vw - 2rem));
		max-height: calc(100dvh - max(var(--notice-header-bottom), env(safe-area-inset-top)) - 2rem);
		overflow-y: auto;
		padding: 1.25rem;
		color: var(--ds-light-title);
		border: 1px solid color-mix(in srgb, var(--ds-on-dark) 55%, transparent);
	}
	.free-services-notice.glass-panel {
		background: color-mix(
			in srgb,
			var(--ds-light-surface) calc(var(--ds-liquid-glass-fill) - 24%),
			transparent
		);
	}
	.notice-title {
		padding-right: 2rem;
		font-weight: 700;
		line-height: 1.45;
		text-wrap: balance;
	}
	.notice-close,
	.notice-details {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		cursor: pointer;
		border-radius: var(--ds-radius-lg);
	}
	.notice-close {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		width: 44px;
	}
	.notice-details {
		gap: 0.375rem;
	}
	.notice-close:hover {
		background: color-mix(in srgb, var(--ds-light-title) 8%, transparent);
	}
	.notice-close:focus-visible,
	.notice-details:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
	.notice-chevron-open {
		transform: rotate(180deg);
	}
	.notice-comment {
		line-height: 1.65;
		padding-top: 0.75rem;
	}
	@supports not (backdrop-filter: blur(1px)) {
		.free-services-notice.glass-panel {
			background: var(--ds-light-surface);
		}
	}

	.hero-bg-slide {
		opacity: 0;
		transition-property: opacity;
		transition-duration: var(--ds-motion-duration-fast);
		transition-timing-function: var(--ds-motion-ease-soft);
	}

	.hero-bg-slide-active {
		opacity: 1;
	}

	.hero-stage {
		padding: clamp(1rem, 3vw, 3rem);
		padding-top: clamp(10rem, 23vh, 16rem);
	}

	.hero-shell {
		max-width: 31rem;
	}

	.glass-panel {
		isolation: isolate;
		background: linear-gradient(
			135deg,
			color-mix(
				in srgb,
				var(--ds-surface-raised) calc(var(--ds-liquid-glass-fill) - 14%),
				transparent
			),
			color-mix(
				in srgb,
				var(--ds-surface-raised) calc(var(--ds-liquid-glass-fill) - 30%),
				transparent
			)
		);
		backdrop-filter: blur(var(--ds-liquid-glass-blur)) saturate(var(--ds-liquid-glass-saturation));
		box-shadow:
			var(--ds-light-shadow),
			inset 0 1px 0 color-mix(in srgb, var(--ds-on-dark) 80%, transparent),
			inset 0 -1px 0 color-mix(in srgb, var(--ds-on-dark) 30%, transparent);
	}

	/* Light travels across the glass, while the content stays perfectly still. */
	.glass-panel::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: inherit;
		pointer-events: none;
		background: radial-gradient(
			ellipse at var(--glass-x, 12%) var(--glass-y, 0%),
			color-mix(in srgb, var(--ds-on-dark) var(--ds-liquid-glass-specular), transparent),
			transparent 65%
		);
	}

	.glass-panel::after {
		content: '';
		position: absolute;
		inset: 4px;
		border: 1px solid
			color-mix(in srgb, var(--ds-on-dark) var(--ds-liquid-glass-specular), transparent);
		border-radius: inherit;
		pointer-events: none;
	}

	.hero-content {
		padding: 1.5rem;
		gap: 1rem;
	}

	.hero-title {
		text-wrap: balance;
		overflow-wrap: anywhere;
	}

	.hero-description {
		line-height: 1.6;
		text-wrap: pretty;
		overflow-wrap: anywhere;
	}

	.hero-actions :global(.editable-field) {
		min-width: 0;
		max-width: 100%;
	}

	.hero-primary {
		min-height: 44px;
		max-width: 100%;
	}

	@supports not (backdrop-filter: blur(1px)) {
		.glass-panel {
			background: var(--ds-surface-raised);
		}
	}

	/* Пустой заголовок не занимает место над логотипами. В редакторе его
	   карандаш остаётся доступным поверх строки брендов, чтобы текст можно
	   было вернуть без появления пустого отступа. */
	.hero-brands :global(.brands-title-empty) {
		height: 0;
		width: 100%;
	}

	.hero-brands :global(.brands-title-empty .editable-field-controls) {
		top: -0.75rem;
		opacity: 1 !important;
		pointer-events: auto !important;
	}

	.brand-viewport {
		width: 100%;
		min-width: 0;
		/* Карандаш вынесен на 0.5rem над логотипом. Оставляем вертикальный
		   безопасный пояс внутри clipping-контейнера; отрицательные поля
		   сохраняют прежнюю высоту и положение строки брендов. */
		padding-block: 0.75rem;
		margin-block: -0.75rem;
		overflow: hidden;
	}

	.brand-viewport-scroll {
		mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
		-webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
	}

	.brand-track {
		display: flex;
		width: 100%;
	}

	.brand-track-marquee {
		width: max-content;
		animation: brand-marquee var(--brand-duration, 24s) linear infinite;
		will-change: transform;
	}

	.brand-track-marquee:hover,
	.brand-track-marquee:focus-within,
	.brand-track-paused {
		animation-play-state: paused;
	}

	.brand-group {
		display: flex;
		align-items: center;
	}

	.brand-group-static {
		width: 100%;
		justify-content: center;
		gap: 0.75rem;
	}

	.brand-group-marquee {
		gap: 1.5rem;
		padding-right: 1.5rem;
	}

	.brand-item {
		min-width: 0;
	}

	.brand-item-static {
		flex: 1 1 0;
	}

	.brand-item-marquee {
		width: 6.5rem;
		flex: 0 0 6.5rem;
	}

	@keyframes brand-marquee {
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-bg-slide {
			transition-duration: var(--ds-motion-duration-ui);
		}

		.brand-viewport-scroll {
			overflow-x: auto;
			mask-image: none;
			-webkit-mask-image: none;
			scrollbar-width: thin;
		}

		.brand-track-marquee {
			animation: none;
			will-change: auto;
		}

		.brand-group-copy {
			display: none;
		}
	}

	@media (min-width: 768px) {
		.brand-group-static {
			gap: 3rem;
		}

		.brand-group-marquee {
			gap: 3rem;
			padding-right: 3rem;
		}

		.brand-item-marquee {
			width: 8rem;
			flex-basis: 8rem;
		}
	}

	@media (max-width: 767px) {
		.hero-stage {
			/* Карточка перекрывает только нижние 10% фото, независимо от объёма текста. */
			--hero-photo-height: clamp(20rem, 85vw, 32rem);
			display: grid;
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: calc(var(--hero-photo-height) * 0.9) auto;
			align-content: start;
			align-items: start;
			padding: 0 1rem 1rem;
			background: var(--ds-surface-raised);
		}
		.hero-background {
			bottom: auto;
			height: var(--hero-photo-height);
		}
		.hero-shell {
			grid-row: 2;
			justify-self: center;
			max-width: 31rem;
		}
		.hero-content {
			padding: 1.25rem;
			gap: 0.875rem;
		}
	}
</style>
