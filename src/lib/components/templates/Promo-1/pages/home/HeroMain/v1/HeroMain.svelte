<script lang="ts">
	// Артикул: 1.1.1.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';

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

	// ─── Bg image picker ──────────────────────────────────────────────────────
	let showImagePicker = $state(false);
	/** Live preview URL — перекрывает сохранённое только пока picker открыт. */
	let previewBgImage = $state<string | null>(null);

	const activeBgImage = $derived(
		previewBgImage ??
			String(
				data?.bgImageV1 ??
					data?.bgImage ??
					'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg'
			)
	);

	async function handleImageApprove(url: string) {
		if (!editContext) return;
		const updated = { ...data, bgImageV1: url };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
		previewBgImage = null;
		showImagePicker = false;
	}

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
	const hasBrandMarquee = $derived(brands.length > 4);
	const brandMarqueeDuration = $derived(Math.max(25, brands.length * 5));

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
	<div class="absolute inset-0 z-0">
		<ImageFallback
			src={activeBgImage}
			alt="Фоновое изображение"
			class="h-full w-full object-cover transition-all duration-500"
		/>
		<div class="absolute inset-0 bg-linear-to-b from-scrim/20 via-scrim/10 to-scrim/30"></div>

		<!-- Кнопка смены фото (только в режиме редактирования) -->
		{#if isEditable && editContext}
			<button
				type="button"
				class="bg-picker-btn"
				onclick={() => {
					previewBgImage = null;
					showImagePicker = true;
				}}
				aria-label="Сменить фоновое изображение"
				title="Сменить фоновое изображение"
			>
				<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<span>Сменить фото</span>
			</button>
		{/if}
	</div>

	<!-- Picker модалка -->
	{#if showImagePicker && editContext}
		<BgImagePicker
			{editContext}
			currentImage={String(data?.bgImageV1 ?? data?.bgImage ?? '')}
			defaultImage="https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg"
			onApprove={handleImageApprove}
			onClose={() => {
				previewBgImage = null;
				showImagePicker = false;
			}}
		/>
	{/if}

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
				class="hero-content mx-auto flex max-w-3xl flex-col items-center px-6 py-8 text-center md:px-12 md:py-10"
			>
				<!-- Логотип. Габариты ограничены и по ширине, и по высоте: панель живёт
				     в боксе фиксированной высоты (см. .hero-wrapper в ../index.svelte),
				     поэтому квадратный логотип без max-h выдавливал контент за нижний край. -->
				{#if data?.logoUrl || isEditable}
					<div class="hero-logo mb-6 w-24 md:w-32">
						<EditableField
							fieldKey="HeroMain.logoUrl"
							label="Логотип (URL)"
							value={String(data?.logoUrl ?? '')}
							{isEditable}
							onSave={(v) => saveField('logoUrl', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<ImageFallback
										src={displayValue ||
											'https://storage.yandexcloud.net/novostroy/logo/promo-1-logo.png'}
										alt={String(data?.logoAlt ?? 'Логотип')}
										class="relative mx-auto max-h-16 w-full rounded-2xl object-contain md:max-h-20"
									/>
								{:else if isEditable}
									<div
										class="rounded-2xl border-2 border-dashed border-ink-400/30 bg-on-dark/10 p-4 text-[10px] font-bold tracking-widest text-ink-500/50 uppercase backdrop-blur-sm"
									>
										Логотип
									</div>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				{/if}

				<!-- Название компании -->
				<EditableField
					fieldKey="HeroMain.companyName"
					label="Название компании"
					value={String(data?.companyName ?? '')}
					{isEditable}
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

				<!-- Кнопка -->
				<div
					class="flex w-full flex-col-reverse items-center justify-center gap-6 md:w-auto md:flex-row md:gap-16"
				>
					<EditableField
						fieldKey="HeroMain.buttonText"
						label="Текст кнопки"
						value={String(data?.buttonText ?? 'Дизайн-проект с расчётом стоимости')}
						{isEditable}
						onSave={(v) => saveField('buttonText', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<button
								type="button"
								onclick={() => serviceOrderStore.open('design-project')}
								class="cursor-pointer rounded-xl border border-ink-900/40 bg-transparent px-10 py-4 text-center text-base font-semibold text-ink-900 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-transparent hover:bg-surface-raised/80 hover:shadow-xl"
							>
								{displayValue}
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>

			<!-- Разделитель -->
			<div class="flex w-full justify-center px-6 md:px-12">
				<div class="h-px w-full max-w-xl bg-ink-300/50"></div>
			</div>

			<!-- Секция брендов -->
			<div class="hero-brands flex w-full justify-center px-6 pt-6 pb-6 md:px-12 md:pt-8 md:pb-8">
				<div class="flex w-full flex-col items-center">
					<p
						class="hero-brands-label mb-6 hidden text-xs font-semibold tracking-widest text-ink-700 uppercase md:block"
					>
						РАБОТАЕМ С ЛУЧШИМИ БРЕНДАМИ:
					</p>
					<div class="flex w-full items-center gap-3 md:gap-5">
						<div
							class="brand-viewport {hasBrandMarquee ? 'brand-viewport-scroll' : ''}"
							bind:this={brandsViewport}
						>
							<div
								class="brand-track {hasBrandMarquee ? 'brand-track-marquee' : ''} {!isBrandsVisible
									? 'brand-track-paused'
									: ''}"
								style={`--brand-duration: ${brandMarqueeDuration}s`}
							>
								{#each Array(hasBrandMarquee ? 2 : 1) as _, copyIndex}
									<div
										class="brand-group {hasBrandMarquee
											? 'brand-group-marquee'
											: 'brand-group-static'} {copyIndex === 1 ? 'brand-group-copy' : ''}"
										aria-hidden={copyIndex === 1 ? 'true' : undefined}
									>
										{#each brands as brand, i}
											<div
												class="brand-item {hasBrandMarquee
													? 'brand-item-marquee'
													: 'brand-item-static'}"
											>
												{#if isEditable && editContext}
													<button
														type="button"
														onclick={() => openBrandLogoPicker(i)}
														tabindex={copyIndex === 1 ? -1 : undefined}
														class="brand-logo group relative flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-transparent px-2 opacity-90 transition-all duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-0.5 hover:border-ink-400/40 hover:bg-surface-raised/40 hover:opacity-100 focus-visible:border-link-500 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
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
													<div class="brand-logo flex h-10 w-full items-center justify-center px-2">
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
		</div>
	</div>
</section>

<style>
	.glass-panel {
		/* Достаточно плотный фон — работает как самостоятельный fallback
		   когда backdrop-filter недоступен (cross-origin изображение, старый браузер) */
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.72) 0%,
			rgba(255, 255, 255, 0.58) 100%
		);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
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

	.brand-viewport {
		width: 100%;
		min-width: 0;
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

	/* ── Компактный режим для невысоких десктопов ────────────────────────────
	   На lg+ компонент живёт в боксе фиксированной высоты
	   (.hero-wrapper: 100dvh − баннер − хедер, overflow-hidden), поэтому панель
	   не может «растечься» вниз — при нехватке места её низ обрезается.
	   Порог 920px — с него панель с логотипом (≈660px) начинает помещаться
	   в доступную высоту с симметричными полями; ниже поджимаем вертикальный
	   ритм и потолок логотипа, иначе панель прижимается к низу и обрезается.
	   Свойства не в @layer, поэтому перекрывают Tailwind-утилиты на элементах. */
	@media (min-width: 1024px) and (max-height: 920px) {
		.hero-shell {
			padding-top: 1rem;
			padding-bottom: 1rem;
		}

		.hero-content {
			padding-top: 1.5rem;
			padding-bottom: 1.5rem;
		}

		.hero-logo {
			width: 5rem;
			margin-bottom: 0.75rem;
		}

		.hero-logo :global(img),
		.hero-logo :global([role='img']) {
			max-height: 3rem;
		}

		.hero-title {
			font-size: 3rem;
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

	/* ── Background image picker button ─────────────────────────────────────── */
	.bg-picker-btn {
		position: absolute;
		bottom: 1rem;
		left: 1rem;
		z-index: 20;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.45rem 0.9rem;
		border-radius: 0.625rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(15, 23, 42, 0.55);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: #f1f5f9;
		font-size: 0.8125rem;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.2s,
			border-color 0.2s,
			transform 0.2s,
			box-shadow 0.2s;
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
	}

	.bg-picker-btn svg {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.bg-picker-btn:hover {
		background: rgba(56, 189, 248, 0.25);
		border-color: rgba(56, 189, 248, 0.55);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(56, 189, 248, 0.2);
	}

	.bg-picker-btn:active {
		transform: translateY(0);
	}
</style>
