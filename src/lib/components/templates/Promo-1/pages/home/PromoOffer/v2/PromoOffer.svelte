<script lang="ts">
	// Артикул: 1.1.3.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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

	let showImagePicker = $state(false);

	const features = $derived(
		Array.isArray(data?.features) && data.features.length > 0
			? (data.features as string[])
			: ['Бесплатная сборка', 'Акции по бытовой технике', 'Каменная столешница в подарок']
	);

	const activeImage = $derived(
		String(data?.imageV2 ?? data?.image ?? '')
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'PromoOffer', updated);
		data = updated;
	}

	async function handleImageApprove(url: string) {
		showImagePicker = false;
		await saveField('imageV2', url);
	}
</script>

<section class="relative overflow-hidden bg-slate-950 py-24 sm:py-32 font-sans select-none text-white">
	<!-- Вспомогательные светящиеся бэкдропы -->
	<div class="absolute right-0 top-1/4 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl"></div>
	<div class="absolute left-10 bottom-10 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl"></div>

	<div class="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
			
			<!-- Левая колонка: Текст и Оффер -->
			<div class="lg:col-span-7 flex flex-col items-start text-left">
				<div class="mb-6">
					<span class="inline-flex items-center gap-2 border border-orange-500/30 bg-orange-500/10 text-orange-400 font-bold px-4 py-1.5 rounded-full text-xs md:text-sm tracking-wider uppercase backdrop-blur-md shadow-[0_0_15px_rgba(249,115,22,0.1)]">
						<span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
						<EditableField
							fieldKey="PromoOffer.badge"
							label="Метка"
							value={String(data?.badge ?? 'Эксклюзивное предложение')}
							{isEditable}
							onSave={(v) => saveField('badge', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</span>
				</div>

				<h2 class="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none mb-6">
					<EditableField
						fieldKey="PromoOffer.title"
						label="Заголовок"
						value={String(data?.title ?? '')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="inline"
					>
						{#snippet children(displayValue)}
							<span class="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">{displayValue}</span>
						{/snippet}
					</EditableField>
				</h2>

				<!-- Основное и вторичное текстовое описание -->
				<div class="space-y-4 max-w-2xl mb-8">
					<EditableField
						fieldKey="PromoOffer.textPrimary"
						label="Основной текст"
						value={String(data?.textPrimary ?? '')}
						{isEditable}
						onSave={(v) => saveField('textPrimary', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="text-base md:text-lg text-slate-200 font-medium leading-relaxed">{displayValue}</p>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="PromoOffer.textSecondary"
						label="Дополнительный текст"
						value={String(data?.textSecondary ?? '')}
						{isEditable}
						onSave={(v) => saveField('textSecondary', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="text-sm md:text-base text-slate-400 leading-relaxed">{displayValue}</p>
						{/snippet}
					</EditableField>
				</div>

				<!-- Список фич в виде горизонтального ряда стеклянных тегов -->
				<div class="flex flex-wrap gap-3 mb-10 w-full">
					{#each features as feature}
						<div class="flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 rounded-2xl text-xs md:text-sm font-semibold tracking-wide backdrop-blur-md transition-colors duration-300 hover:border-orange-500/20 hover:bg-orange-500/5">
							<div class="flex h-5 w-5 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							</div>
							<span>{feature}</span>
						</div>
					{/each}
				</div>

				<!-- Действия -->
				<div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
					<button
						type="button"
						onclick={() => serviceOrderStore.open('consultation')}
						class="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-base py-4.5 px-10 rounded-2xl cursor-pointer shadow-lg hover:shadow-orange-500/20 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 ease-out text-center flex items-center justify-center gap-2"
					>
						<EditableField
							fieldKey="PromoOffer.primaryButton"
							label="Кнопка (основная)"
							value={String(data?.primaryButton ?? 'Получить предложение')}
							{isEditable}
							onSave={(v) => saveField('primaryButton', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
						<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					</button>

					<a
						href={String(data?.secondaryHref ?? '/about')}
						class="w-full sm:w-auto border border-white/10 bg-white/5 text-white font-bold text-base py-4.5 px-10 rounded-2xl cursor-pointer shadow-md hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 ease-out text-center flex items-center justify-center"
					>
						<EditableField
							fieldKey="PromoOffer.secondaryButton"
							label="Кнопка (вторичная)"
							value={String(data?.secondaryButton ?? 'Узнать больше')}
							{isEditable}
							onSave={(v) => saveField('secondaryButton', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</a>
				</div>
			</div>

			<!-- Правая колонка: Изображение и декоративные элементы -->
			<div class="lg:col-span-5 relative w-full flex justify-center items-center">
				<div class="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl group transition-transform duration-500 hover:scale-[1.01]">
					<ImageFallback
						src={activeImage}
						alt={String(data?.imageAlt ?? 'Промо изображение')}
						class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>
					
					{#if isEditable}
						<button
							type="button"
							onclick={() => showImagePicker = true}
							class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-none cursor-pointer flex items-center justify-center"
							aria-label="Изменить изображение"
						>
							<span class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm shadow-lg transform scale-95 group-hover:scale-100 transition-transform duration-300">
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
									<path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								Изменить фото
							</span>
						</button>
					{/if}
				</div>

				<!-- Декоративные парящие круги/элементы (похожие на V1, но с V2 дизайном) -->
				<div class="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 shadow-lg text-white font-bold text-lg flex items-center justify-center animate-[promo-float_6s_ease-in-out_infinite_delay-0s]">★</div>
				<div class="absolute -left-4 bottom-10 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg text-white font-bold text-lg flex items-center justify-center animate-[promo-float_6s_ease-in-out_infinite_delay-2s]">❤</div>
				<div class="absolute right-12 -bottom-4 w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg text-white font-bold text-sm flex items-center justify-center animate-[promo-float_6s_ease-in-out_infinite_delay-4s]">✓</div>
			</div>

		</div>
	</div>

	{#if showImagePicker && editContext}
		<BgImagePicker
			editContext={editContext}
			currentImage={String(data?.imageV2 ?? data?.image ?? '')}
			defaultImage=""
			aspectRatio={1}
			onApprove={handleImageApprove}
			onClose={() => showImagePicker = false}
		/>
	{/if}
</section>

<style>
	/* Outfit font is loaded once in Promo-1 layout/Header.svelte */

	h2 {
		font-family: 'Outfit', sans-serif;
	}

	@keyframes promo-float {
		0%, 100% { transform: translateY(0px); }
		50%       { transform: translateY(-10px); }
	}
</style>
