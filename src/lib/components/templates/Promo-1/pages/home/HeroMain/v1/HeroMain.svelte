<script lang="ts">
	// Артикул: 1.1.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import HoverSwapLabel from '$lib/components/HoverSwapLabel.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { createEditableVisibility } from '$lib/utils/editable-visibility.svelte';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { onMount } from 'svelte';

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

	const defaultBgImages = [
		'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg',
		'https://storage.yandexcloud.net/novostroy/bg/hero-1.jpg'
	];
	const bgImages = $derived.by(() => {
		if (Array.isArray(data?.bgImagesV1)) {
			const stored = data.bgImagesV1.filter(
				(value): value is string => typeof value === 'string' && value.trim() !== ''
			);
			if (stored.length > 0) return stored;
		}

		const legacy = [data?.bgImageV1, data?.bgImage].find(
			(value): value is string => typeof value === 'string' && value.trim() !== ''
		);
		return legacy ? [legacy] : defaultBgImages;
	});
	const bgIntervalMs = $derived(Math.min(300, Math.max(1, Number(data?.bgIntervalV1) || 5)) * 1000);
	let activeBgIndex = $state(0);
	let bgViewport = $state<HTMLDivElement>();
	let bgInViewport = $state(true);
	let pageVisible = $state(true);

	$effect(() => {
		if (activeBgIndex >= bgImages.length) activeBgIndex = 0;
	});

	$effect(() => {
		if (typeof window === 'undefined' || bgImages.length < 2 || !bgInViewport || !pageVisible)
			return;

		const timer = window.setInterval(() => {
			activeBgIndex = (activeBgIndex + 1) % bgImages.length;
		}, bgIntervalMs);
		return () => window.clearInterval(timer);
	});

	onMount(() => {
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
	const hasBrandMarquee = $derived(renderedBrands.length > 4);
	const brandMarqueeDuration = $derived(Math.max(25, renderedBrands.length * 5));
	const brandsBlockVisible = $derived(visibility.isVisible('brandsBlock'));

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

<section
	class="relative flex min-h-full w-full items-center justify-center overflow-hidden py-6 text-ink-900 md:py-8"
>
	<!-- Фоновое изображение -->
	<div class="absolute inset-0 z-0" bind:this={bgViewport}>
		{#each bgImages as bgImage, index (`${index}:${bgImage}`)}
			<div
				class="hero-bg-slide absolute inset-0 {index === activeBgIndex
					? 'hero-bg-slide-active'
					: ''}"
				aria-hidden={index === activeBgIndex ? undefined : 'true'}
			>
				<ImageFallback src={bgImage} alt="" class="h-full w-full object-cover" />
			</div>
		{/each}
		<div class="absolute inset-0 bg-linear-to-b from-scrim/20 via-scrim/10 to-scrim/30"></div>
	</div>

	{#if editingBrand && editContext}
		<BgImagePicker
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
	<div
		class="hero-shell relative z-10 w-full max-w-4xl px-4 py-6 md:px-8 md:py-10 xl:px-4 xl:py-12"
	>
		<!-- Стеклянная панель -->
		<div
			class="glass-panel flex w-full flex-col items-center overflow-hidden rounded-3xl border border-on-dark/40 shadow-2xl"
		>
			<!-- Контент -->
			<div
				class="hero-content mx-auto flex max-w-3xl flex-col items-center px-6 py-8 text-center md:px-12 md:py-10 {renderedBrands.length >
					0 && brandsBlockVisible
					? ''
					: 'hero-content-no-brands'}"
			>
				<!-- Логотип. Габариты ограничены и по ширине, и по высоте: панель живёт
				     в боксе фиксированной высоты (см. .hero-wrapper в ../index.svelte),
				     поэтому квадратный логотип без max-h выдавливал контент за нижний край. -->
				{#if (data?.logoUrl && visibility.isVisible('logo')) || isEditable}
					<div class="hero-logo w-[14.4rem] md:w-64 lg:w-[27.648rem]">
						<EditableField
							fieldKey="HeroMain.logoUrl"
							label="Логотип (URL)"
							value={String(data?.logoUrl ?? '')}
							{isEditable}
							visible={visibility.isVisible('logo')}
							visibilityLabel="логотип"
							visibilityPending={visibility.isPending('logo')}
							onToggleVisibility={(event) => visibility.toggle('logo', event)}
							onSave={(v) => saveField('logoUrl', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<ImageFallback
										src={displayValue ||
											'https://storage.yandexcloud.net/novostroy/logo/promo-1-logo.png'}
										alt={String(data?.logoAlt ?? 'Логотип')}
										class="relative mx-auto max-h-[9.6rem] w-full rounded-2xl object-contain md:max-h-40 lg:max-h-[17.28rem]"
									/>
								{:else if isEditable}
									<!-- Роль метки, а не три утилиты руками: кегль, начертание и
									     разрежение приходят из `--ds-font-label-*` через `p1-label`.
									     Раньше здесь стоял произвольный кегль ниже пола шкалы плюс
									     начертание и разрядка, набранные по месту, — тот самый приём,
									     из-за которого характер системы жил в разметке. -->
									<div
										class="p1-label rounded-2xl border-2 border-dashed border-ink-400/30 bg-on-dark/10 p-4 text-ink-500/50 uppercase backdrop-blur-sm"
									>
										Логотип
									</div>
								{/if}
							{/snippet}
						</EditableField>
					</div>
					<div
						aria-hidden="true"
						class="hero-logo-divider mt-4 mb-4 h-0.5 w-full max-w-md bg-ink-700/15"
					></div>
				{/if}

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
					class="block"
				>
					{#snippet children(displayValue)}
						<span
							class="mb-6 text-xs font-semibold tracking-[0.5em] text-ink-600 uppercase md:text-sm"
						>
							{displayValue}
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
						<h1 class="hero-title mb-6 text-3xl text-ink-900 md:text-5xl lg:text-7xl">
							{displayValue}
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
						<p
							class="hero-description mx-auto mb-8 max-w-2xl text-sm font-medium text-ink-800 md:mb-10 md:text-lg"
						>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- Кнопки. Направление не reverse: пока кнопка была одна, порядок
				     ничего не значил, а со вторым CTA он стал смыслом — основной
				     остаётся первым и на мобильном, и на десктопе. -->
				<div
					class="flex w-full flex-col items-center justify-center gap-4 md:w-auto md:flex-row md:gap-6"
				>
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
								type="button"
								onclick={() => serviceOrderStore.open('consultation')}
								class="group cursor-pointer rounded-xl border border-ink-900/40 bg-transparent px-10 py-4 text-center text-base font-semibold text-ink-900 shadow-sm transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:border-ink-900/60 hover:shadow-xl"
							>
								<HoverSwapLabel text={displayValue} disabled={isEditable} />
							</button>
						{/snippet}
					</EditableField>

					<!-- Второй CTA держится тише первого: тот уже контурный, поэтому
					     здесь остаётся только подпись с подчёркиванием — иерархия
					     читается без второй рамки рядом с первой. -->
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
								type="button"
								onclick={() => serviceOrderStore.open('promo')}
								class="cursor-pointer rounded-xl px-6 py-4 text-center text-base font-semibold text-ink-800 underline decoration-ink-900/25 underline-offset-8 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:text-ink-900 hover:decoration-ink-900/60 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
							>
								{displayValue}
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>

			{#if (renderedBrands.length > 0 && brandsBlockVisible) || isEditable}
				<!-- Разделитель входит в секцию брендов: когда скрыты все логотипы,
				     у посетителя не остаётся одинокая линия. -->
				<div
					class="flex w-full justify-center px-6 transition-opacity duration-[var(--ds-motion-duration-ui)] ease-ui md:px-12 {brandsBlockVisible
						? ''
						: 'opacity-45'}"
				>
					<div class="h-px w-full max-w-xl bg-ink-300/50"></div>
				</div>

				<!-- Секция брендов -->
				<div class="hero-brands flex w-full justify-center px-6 pt-6 pb-6 md:px-12 md:pt-8 md:pb-8">
					<div class="flex w-full flex-col items-center">
						<EditableField
							fieldKey="HeroMain.brandsTitle"
							label="Заголовок блока брендов"
							value={String(data?.brandsTitle ?? 'РАБОТАЕМ С ЛУЧШИМИ БРЕНДАМИ:')}
							{isEditable}
							visible={brandsBlockVisible}
							visibilityLabel="блок брендов"
							visibilityPending={visibility.isPending('brandsBlock')}
							onToggleVisibility={(event) => visibility.toggle('brandsBlock', event)}
							onSave={(v) => saveField('brandsTitle', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								<p
									class="hero-brands-label mb-6 min-h-4 text-xs font-semibold tracking-widest text-ink-700 uppercase {isEditable
										? 'block'
										: 'hidden md:block'}"
								>
									{displayValue}
								</p>
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
											{#each renderedBrands as { brand, index }}
												<div
													class="brand-item {hasBrandMarquee
														? 'brand-item-marquee'
														: 'brand-item-static'}"
												>
													{#if isEditable && editContext}
														<div class="brand-logo relative h-12 w-full">
															<button
																type="button"
																onclick={() => openBrandLogoPicker(index)}
																tabindex={copyIndex === 1 ? -1 : undefined}
																class="group flex h-full w-full cursor-pointer items-center justify-center rounded-lg border border-transparent px-2 opacity-90 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:border-ink-400/40 hover:bg-surface-raised/40 hover:opacity-100 focus-visible:border-link-500 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none {visibility.isVisible(
																	`brand:${index}`
																)
																	? ''
																	: 'opacity-45 grayscale'}"
																aria-label={`Заменить логотип «${brand.name}»`}
																title={`Заменить логотип «${brand.name}»`}
															>
																<ImageFallback
																	class="max-h-full max-w-full object-contain"
																	src={brand.logo}
																	alt={copyIndex === 1 ? '' : brand.name}
																/>
																<span
																	class="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border border-ink-300 bg-surface-raised text-ink-700 opacity-80 shadow-sm transition-opacity duration-[var(--ds-motion-duration-ui)] ease-ui group-hover:opacity-100 group-focus-visible:opacity-100"
																	aria-hidden="true"
																>
																	<svg
																		class="size-3.5"
																		fill="none"
																		viewBox="0 0 24 24"
																		stroke="currentColor"
																	>
																		<path
																			stroke-linecap="round"
																			stroke-linejoin="round"
																			stroke-width="1.75"
																			d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 3.75 19.5l1.037-4.5L16.862 3.487z"
																		/>
																	</svg>
																</span>
															</button>
															<button
																type="button"
																role="switch"
																aria-checked={visibility.isVisible(`brand:${index}`)}
																aria-busy={visibility.isPending(`brand:${index}`)}
																aria-label={`${visibility.isVisible(`brand:${index}`) ? 'Скрыть' : 'Показать'} логотип «${brand.name}»`}
																title={`${visibility.isVisible(`brand:${index}`) ? 'Скрыть' : 'Показать'} логотип «${brand.name}»`}
																tabindex={copyIndex === 1 ? -1 : undefined}
																disabled={visibility.isPending(`brand:${index}`)}
																onclick={(event) => visibility.toggle(`brand:${index}`, event)}
																class="absolute -top-2 right-8 inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-surface-raised/80 shadow-sm transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60 {visibility.isVisible(
																	`brand:${index}`
																)
																	? 'bg-link-500'
																	: 'bg-ink-400'}"
															>
																<span
																	class="pointer-events-none inline-block size-4 rounded-full bg-surface-raised shadow-sm transition-transform duration-[var(--ds-motion-duration-ui)] ease-ui {visibility.isVisible(
																		`brand:${index}`
																	)
																		? 'translate-x-4'
																		: 'translate-x-0'}"
																></span>
															</button>
														</div>
													{:else if brand.url}
														<a
															href={brand.url}
															target="_blank"
															rel="noopener noreferrer"
															tabindex={copyIndex === 1 ? -1 : undefined}
															class="brand-logo group flex h-10 w-full items-center justify-center px-2 opacity-90 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:opacity-100"
														>
															<ImageFallback
																class="max-h-full max-w-full object-contain"
																src={brand.logo}
																alt={copyIndex === 1 ? '' : brand.name}
															/>
														</a>
													{:else}
														<div
															class="brand-logo flex h-10 w-full items-center justify-center px-2"
														>
															<ImageFallback
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
	.hero-bg-slide {
		opacity: 0;
		transition-property: opacity;
		transition-duration: var(--ds-motion-duration-fast);
		transition-timing-function: var(--ds-motion-ease-soft);
	}

	.hero-bg-slide-active {
		opacity: 1;
	}

	.glass-panel {
		/* Достаточно плотный фон — работает как самостоятельный fallback
		   когда backdrop-filter недоступен (cross-origin изображение, старый браузер) */
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.72) 0%,
			rgba(255, 255, 255, 0.58) 100%
		);
		/* Не дублировать вручную через -webkit-: production CSS-оптимизатор
		   сам добавляет префикс, а при обратном порядке удаляет стандартное
		   свойство — в Chrome панель остаётся без blur. */
		backdrop-filter: blur(20px) saturate(180%);
	}

	/* Fallback: если backdrop-filter не поддерживается — делаем фон ещё плотнее */
	@supports not (backdrop-filter: blur(1px)) {
		.glass-panel {
			background: linear-gradient(
				145deg,
				rgba(255, 255, 255, 0.88) 0%,
				rgba(255, 255, 255, 0.8) 100%
			);
		}
	}

	.hero-description {
		line-height: 1.6;
	}

	/* Глобальный h1{font-weight: var(--ds-font-heading-weight)} в layout.css
	   объявлен вне @layer и перебивает утилиту font-bold на элементе —
	   переопределяем вес только для этого заголовка через scoped-класс. */
	.hero-title {
		font-weight: 700;
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

	@media (min-width: 768px) {
		.hero-description {
			line-height: 1.8;
		}
	}

	.hero-logo-divider {
		clip-path: polygon(0 50%, 12% 0, 88% 0, 100% 50%, 88% 100%, 12% 100%);
	}

	/* Когда секция брендов скрыта, контент становится последним элементом
	   стеклянной панели и сам отвечает за полноценный нижний воздух. */
	.hero-content-no-brands {
		padding-bottom: 3rem;
	}

	@media (min-width: 768px) {
		.hero-content-no-brands {
			padding-bottom: 4rem;
		}
	}

	/* ── Компактный режим для невысоких десктопов ────────────────────────────
	   На lg+ компонент живёт в боксе фиксированной высоты
	   (.hero-wrapper: 100dvh − баннер − хедер, overflow-hidden), поэтому панель
	   не может «растечься» вниз — при нехватке места её низ обрезается.
	   Порог 920px — с него панель с крупным логотипом начинает помещаться
	   в доступную высоту с симметричными полями; ниже поджимаем вертикальный
	   ритм и потолок логотипа, иначе панель прижимается к низу и обрезается.
	   Свойства не в @layer, поэтому перекрывают Tailwind-утилиты на элементах. */
	@media (min-width: 1024px) and (max-height: 920px) {
		.hero-shell {
			padding-top: 1rem;
			padding-bottom: 1rem;
		}

		.hero-content {
			padding-top: 2rem;
			padding-bottom: 2rem;
		}

		.hero-content.hero-content-no-brands {
			padding-bottom: 3rem;
		}

		.hero-logo {
			width: 15.552rem;
		}

		.hero-logo-divider {
			margin-top: 0.5rem;
			margin-bottom: 0.5rem;
		}

		.hero-logo :global(img),
		.hero-logo :global([role='img']) {
			max-height: 9.3312rem;
		}

		.hero-title {
			/* Та же ступень, что `md:text-5xl` на самом элементе: компактный режим
			   откатывает заголовок с lg-ступени на md-ю, а не заводит свой кегль.
			   Ключ шкалы, а не 3rem, — размер остаётся одним значением в одном
			   месте. Размер заголовка системе не принадлежит намеренно (DESIGN.md,
			   Hierarchy: «компонент задаёт только размер»), поэтому шкала здесь
			   тейлвиндовская — но та же самая, что у утилиты рядом. */
			font-size: var(--text-5xl);
			margin-bottom: 1rem;
		}

		.hero-description {
			line-height: 1.6;
			margin-bottom: 1.5rem;
		}

		.hero-brands {
			padding-top: 1rem;
			padding-bottom: 1rem;
		}

		.hero-brands-label {
			margin-bottom: 1rem;
		}
	}
</style>
