<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';

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
		String(data?.bgImageV2 ?? data?.bgImage ?? 'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg')
	);

	async function handleImageApprove(url: string) {
		if (!editContext) return;
		const updated = { ...data, bgImageV2: url };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
		previewBgImage = null;
		showImagePicker = false;
	}

	const brands = $derived(
		Array.isArray(data?.brands)
			? (data.brands as { name: string; logo: string; url: string }[])
			: [
					{ name: 'Hettich', logo: 'https://storage.yandexcloud.net/novostroy/logo/hettich-Logo.png', url: 'https://www.hettich.com' },
					{ name: 'Egger',   logo: 'https://storage.yandexcloud.net/novostroy/logo/egger-Logo.png',   url: 'https://www.egger.com'   },
					{ name: 'Аристо',  logo: 'https://storage.yandexcloud.net/novostroy/logo/aristo-Logo.png',  url: 'https://www.aristo.ru'   },
					{ name: 'Blum',    logo: 'https://storage.yandexcloud.net/novostroy/logo/blum-Logo.png',    url: 'https://www.blum.com'    },
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'HeroMain', updated);
		data = updated;
	}
</script>

<section class="relative w-full min-h-screen flex items-center justify-start overflow-hidden bg-slate-950 text-white font-sans">
	<!-- Фоновое изображение (с глубоким боковым градиентом) -->
	<div class="absolute inset-0 z-0">
		<img
			src={activeBgImage}
			alt="Фоновое изображение"
			class="w-full h-full object-cover transition-all duration-500 scale-105"
		/>
		<!-- Градиент затемнения (кинематографичный эффект с левым фокусом) -->
		<div class="absolute inset-0 bg-overlay"></div>

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
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				<span>Сменить фото</span>
			</button>
		{/if}
	</div>

	<!-- Picker модалка -->
	{#if showImagePicker && editContext}
		<BgImagePicker
			{editContext}
			currentImage={String(data?.bgImageV2 ?? data?.bgImage ?? '')}
			defaultImage="https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg"
			onApprove={handleImageApprove}
			onClose={() => {
				previewBgImage = null;
				showImagePicker = false;
			}}
		/>
	{/if}

	<!-- Основной контент -->
	<div class="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 md:px-12 md:py-28 lg:px-16 flex flex-col justify-between min-h-screen">
		<!-- Верхняя панель (Логотип) -->
		<div class="w-full flex items-center justify-between">
			{#if data?.logoUrl || isEditable}
				<div class="w-28 md:w-36 transition-transform duration-300 hover:scale-105">
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
								<img
									src={displayValue}
									alt={String(data?.logoAlt ?? 'Логотип')}
									class="relative w-full object-contain filter brightness-0 invert"
								/>
							{:else if isEditable}
								<div class="border border-dashed border-white/20 rounded-xl p-3 text-[10px] font-bold uppercase tracking-widest text-white/50 backdrop-blur-md bg-white/5">
									Логотип
								</div>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			{/if}
		</div>

		<!-- Главный блок с текстом -->
		<div class="max-w-3xl my-auto pt-10 pb-8 flex flex-col items-start select-none">
			<!-- Название компании (Pill Badge с эффектом свечения) -->
			<div class="mb-6">
				<EditableField
					fieldKey="HeroMain.companyName"
					label="Название компании"
					value={String(data?.companyName ?? '')}
					{isEditable}
					onSave={(v) => saveField('companyName', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<span class="inline-flex items-center gap-2 border border-sky-400/30 bg-sky-500/10 text-sky-300 font-bold px-4 py-1.5 rounded-full text-xs md:text-sm tracking-wider uppercase backdrop-blur-md shadow-glow">
							<span class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
							{displayValue}
						</span>
					{/snippet}
				</EditableField>
			</div>

			<!-- Заголовок (Массивный, градиентный, с тенью) -->
			<EditableField
				fieldKey="HeroMain.title"
				label="Заголовок"
				value={String(data?.title ?? '')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block w-full"
			>
				{#snippet children(displayValue)}
					<h1 class="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tight leading-[1.05] mb-6 font-display hero-title">
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
				class="block max-w-2xl"
			>
				{#snippet children(displayValue)}
					<p class="text-sm md:text-lg text-slate-300 max-w-xl font-normal leading-relaxed mb-10 hero-description">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>

			<!-- Кнопка с градиентом и интерактивным эффектом -->
			<div class="flex items-center w-full sm:w-auto">
				<EditableField
					fieldKey="HeroMain.buttonText"
					label="Текст кнопки"
					value={String(data?.buttonText ?? 'Бесплатный дизайн-проект с расчётом стоимости')}
					{isEditable}
					onSave={(v) => saveField('buttonText', v)}
					class="block w-full sm:w-auto"
				>
					{#snippet children(displayValue)}
						<button
							type="button"
							onclick={() => serviceOrderStore.open('design-project')}
							class="w-full sm:w-auto bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white font-bold text-base md:text-lg py-5 px-12 rounded-2xl cursor-pointer shadow-lg hover:shadow-sky-500/25 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 ease-out text-center"
						>
							{displayValue}
						</button>
					{/snippet}
				</EditableField>
			</div>
		</div>

		<!-- Нижний блок (Бренды с монохромным эффектом на стеклянной подложке) -->
		<div class="w-full pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
			<span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
				Наши ключевые партнеры:
			</span>
			<div class="flex flex-wrap items-center justify-center gap-6 md:gap-12">
				{#each brands as brand}
					<a
						href={brand.url}
						target="_blank"
						rel="noopener noreferrer"
						class="brand-link h-8 flex items-center justify-center opacity-60 hover:opacity-100 transition-all duration-300 hover:-translate-y-0.5"
					>
						<img class="max-w-[100px] max-h-full object-contain filter brightness-0 invert" src={brand.logo} alt={brand.name} />
					</a>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	/* Кастомные шрифты и эффекты */
	@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');

	.font-display {
		font-family: 'Outfit', sans-serif;
	}

	.bg-overlay {
		background: linear-gradient(
			to right,
			rgba(15, 23, 42, 0.95) 0%,
			rgba(15, 23, 42, 0.8) 35%,
			rgba(15, 23, 42, 0.45) 70%,
			rgba(15, 23, 42, 0.2) 100%
		);
	}

	@media (max-width: 768px) {
		.bg-overlay {
			background: linear-gradient(
				to bottom,
				rgba(15, 23, 42, 0.95) 0%,
				rgba(15, 23, 42, 0.85) 60%,
				rgba(15, 23, 42, 0.6) 100%
			);
		}
	}

	.shadow-glow {
		box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
	}

	.hero-title {
		text-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
	}

	.hero-description {
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	/* Бренды */
	.brand-link img {
		transition: filter 0.3s, transform 0.3s;
	}
	
	.brand-link:hover img {
		filter: brightness(0) invert(1) drop-shadow(0 0 8px rgba(56, 189, 248, 0.4));
	}

	/* ── Background image picker button ─────────────────────────────────────── */
	.bg-picker-btn {
		position: absolute;
		bottom: 1.5rem;
		left: 1.5rem;
		z-index: 20;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: rgba(15, 23, 42, 0.7);
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
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
	}

	.bg-picker-btn svg {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
	}

	.bg-picker-btn:hover {
		background: rgba(56, 189, 248, 0.25);
		border-color: rgba(56, 189, 248, 0.5);
		transform: translateY(-1px);
		box-shadow: 0 6px 20px rgba(56, 189, 248, 0.25);
	}

	.bg-picker-btn:active {
		transform: translateY(0);
	}
</style>
