<script lang="ts">
	// Артикул: 1.1.3.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Нейтральная палитра — из классов p1-*; акценты от темы не зависят.
	const isLight = $derived(isLightBlock(data, 'dark'));

	const features = $derived(
		Array.isArray(data?.features) && data.features.length > 0
			? (data.features as string[])
			: ['Бесплатная сборка', 'Акции по бытовой технике', 'Каменная столешница в подарок']
	);

	const activeImage = $derived(String(data?.imageV2 ?? data?.image ?? ''));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'PromoOffer', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface p1-title relative overflow-hidden py-section-sm font-sans select-none sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Вспомогательные светящиеся бэкдропы -->
	<div class="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-cat-8-500/10 blur-3xl"></div>
	<div class="absolute bottom-10 left-10 h-96 w-96 rounded-full bg-cat-3-600/10 blur-3xl"></div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
			<!-- Левая колонка: Текст и Оффер -->
			<div class="flex flex-col items-start text-left lg:col-span-7">
				<div class="mb-6">
					<span
						class="inline-flex items-center gap-2 border border-cat-8-500/30 bg-cat-8-500/10 {isLight
							? 'text-cat-8-600'
							: 'text-cat-8-400'} rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase shadow-[0_0_15px] shadow-cat-8-500/10 backdrop-blur-md md:text-sm"
					>
						<span class="h-1.5 w-1.5 animate-ping rounded-full bg-cat-8-400"></span>
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

				<h2 class="mb-6 text-3xl md:text-5xl lg:text-6xl">
					<EditableField
						fieldKey="PromoOffer.title"
						label="Заголовок"
						value={String(data?.title ?? '')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="inline"
					>
						{#snippet children(displayValue)}
							<span
								class="bg-gradient-to-r from-cat-8-400 via-cat-1-400 to-cat-13-400 bg-clip-text text-transparent"
								>{displayValue}</span
							>
						{/snippet}
					</EditableField>
				</h2>

				<!-- Основное и вторичное текстовое описание -->
				<div class="mb-8 max-w-2xl space-y-4">
					<EditableField
						fieldKey="PromoOffer.textPrimary"
						label="Основной текст"
						value={String(data?.textPrimary ?? '')}
						{isEditable}
						onSave={(v) => saveField('textPrimary', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="p1-body text-base leading-relaxed font-medium md:text-lg">{displayValue}</p>
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
							<p class="p1-muted text-sm leading-relaxed md:text-base">{displayValue}</p>
						{/snippet}
					</EditableField>
				</div>

				<!-- Список фич в виде горизонтального ряда стеклянных тегов -->
				<div class="mb-10 flex w-full flex-wrap gap-3">
					{#each features as feature}
						<div
							class="p1-border p1-card flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur-md transition-colors duration-300 hover:border-cat-8-500/20 hover:bg-cat-8-500/5 md:text-sm"
						>
							<div
								class="flex h-5 w-5 items-center justify-center rounded-lg bg-cat-8-500/10 {isLight
									? 'text-cat-8-600'
									: 'text-cat-8-400'}"
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="3"
								>
									<polyline points="20 6 9 17 4 12"></polyline>
								</svg>
							</div>
							<span>{feature}</span>
						</div>
					{/each}
				</div>

				<!-- Действия -->
				<div class="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
					<button
						type="button"
						onclick={() => serviceOrderStore.open('consultation')}
						class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cat-8-500 to-cat-1-600 px-10 py-4.5 text-center text-base font-bold text-on-accent shadow-lg transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-cat-8-500/20 active:scale-[0.98] sm:w-auto"
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
						<svg
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					</button>

					<a
						href={String(data?.secondaryHref ?? '/about')}
						class="p1-border p1-card p1-title hover:p1-card hover:p1-border flex w-full cursor-pointer items-center justify-center rounded-2xl border px-10 py-4.5 text-center text-base font-bold shadow-md transition-all duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
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
			<div class="relative flex w-full items-center justify-center lg:col-span-5">
				<div
					class="p1-border group relative aspect-square w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl transition-transform duration-500 hover:scale-[1.01]"
				>
					<ImageFallback
						src={activeImage}
						alt={String(data?.imageAlt ?? 'Промо изображение')}
						class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
					/>
				</div>

				<!-- Декоративные парящие круги/элементы (похожие на V1, но с V2 дизайном) -->
				<div
					class="absolute -top-4 -right-4 flex h-12 w-12 animate-[promo-float_6s_ease-in-out_infinite_delay-0s] items-center justify-center rounded-full bg-gradient-to-br from-cat-8-400 to-cat-13-500 text-lg font-bold text-on-accent shadow-lg"
				>
					★
				</div>
				<div
					class="absolute bottom-10 -left-4 flex h-10 w-10 animate-[promo-float_6s_ease-in-out_infinite_delay-2s] items-center justify-center rounded-full bg-gradient-to-br from-cat-7-500 to-cat-6-600 text-lg font-bold text-on-accent shadow-lg"
				>
					❤
				</div>
				<div
					class="absolute right-12 -bottom-4 flex h-9 w-9 animate-[promo-float_6s_ease-in-out_infinite_delay-4s] items-center justify-center rounded-full bg-gradient-to-br from-cat-12-400 to-cat-2-500 text-sm font-bold text-on-accent shadow-lg"
				>
					✓
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	@keyframes promo-float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}
</style>
