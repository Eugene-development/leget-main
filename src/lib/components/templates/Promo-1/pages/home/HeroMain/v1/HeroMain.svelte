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
	let reducedMotion = $state(false);
	let glassPanel = $state<HTMLDivElement>();

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

<section class="hero-stage relative flex min-h-full w-full items-end overflow-hidden text-ink-900">
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
	<div class="hero-shell relative z-10 w-full">
		<!-- Стеклянная панель -->
		<div
			bind:this={glassPanel}
			class="glass-panel relative flex w-full flex-col rounded-3xl border border-on-dark/40"
		>
			<!-- Контент -->
			<div class="hero-content relative flex min-w-0 flex-col items-start text-left">
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
						<span class="ds-label text-ink-700">
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
						<h1 class="hero-title text-4xl text-ink-900 md:text-5xl">
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
						<p class="hero-description text-sm text-ink-900 md:text-base">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- Кнопки. Направление не reverse: пока кнопка была одна, порядок
				     ничего не значил, а со вторым CTA он стал смыслом — основной
				     остаётся первым и на мобильном, и на десктопе. -->
				<div class="hero-actions flex w-full flex-wrap items-center gap-x-4 gap-y-1">
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
								class="hero-primary group cursor-pointer rounded-xl border border-ink-900 bg-ink-900 px-5 py-3 text-left text-sm font-semibold text-on-dark shadow-sm transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:bg-ink-800 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
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
								type="button"
								onclick={() => serviceOrderStore.open('promo')}
								class="cursor-pointer rounded-xl px-1 py-3 text-left text-sm font-semibold text-ink-900 underline decoration-ink-900/25 underline-offset-8 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:text-ink-900 hover:decoration-ink-900/60 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
							>
								{displayValue}
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>

			{#if (renderedBrands.length > 0 && brandsBlockVisible) || isEditable}
				<!-- Секция брендов -->
				<div class="hero-brands relative flex w-full justify-center px-6 pt-4 pb-6">
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
										{displayValue}
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
														<div class="brand-logo relative h-10 w-full">
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
															class="brand-logo group flex h-8 w-full items-center justify-center px-2 opacity-90 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:opacity-100"
														>
															<ImageFallback
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

	.hero-stage {
		padding: clamp(1rem, 3vw, 3rem);
		padding-top: clamp(10rem, 23vh, 16rem);
	}

	.hero-shell {
		max-width: 29rem;
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

	@media (prefers-reduced-motion: no-preference) {
		.hero-shell {
			animation: glass-arrive var(--ds-motion-duration-ui-slow) var(--ds-motion-ease-soft);
		}
	}

	@keyframes glass-arrive {
		from {
			opacity: 0.5;
			transform: translateY(1.5rem) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
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
			padding: 12rem 1rem 1rem;
		}
		.hero-shell {
			max-width: 29rem;
		}
		.hero-content {
			padding: 1.25rem;
			gap: 0.875rem;
		}
	}
</style>
