<script lang="ts">
	// Артикул: 1.1.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';

	type MessageCard = {
		title: string;
		description: string;
		image: string | null;
		alt: string;
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

	// Нейтральная палитра — из классов p1-*; акценты от темы не зависят.
	const isLight = $derived(isLightBlock(data, 'light'));

	const cards = $derived<MessageCard[]>(
		Array.isArray(data?.cards) && data.cards.length > 0
			? (data.cards as MessageCard[])
			: [
					{
						title: 'Дизайн-проект',
						description: '3D-проект с визуализацией и точными замерами',
						image: null,
						alt: 'Дизайн-проект'
					},
					{
						title: 'Мебель',
						description: 'Производство по точным размерам и вашим предпочтениям',
						image: null,
						alt: 'Мебель на заказ'
					},
					{
						title: 'Партнёрство',
						description: 'Сотрудничаем с лучшими фабриками и поставщиками',
						image: null,
						alt: 'Партнёрство'
					},
					{
						title: 'Гарантия качества',
						description: 'Гарантия до 5 лет и полное сопровождение заказа',
						image: null,
						alt: 'Гарантия качества'
					}
				]
	);
	let editingCardImageIndex = $state<number | null>(null);
	const editingCard = $derived(
		editingCardImageIndex === null ? null : (cards[editingCardImageIndex] ?? null)
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Message', updated);
		data = updated;
	}

	async function saveCardField(index: number, field: 'title' | 'description', value: string) {
		if (!editContext) return;
		const updatedCards = [...cards];
		updatedCards[index] = { ...updatedCards[index], [field]: value };
		const updated = { ...data, cards: updatedCards };
		await saveComponentData(editContext, 'Message', updated);
		data = updated;
	}

	function openCardImagePicker(index: number) {
		editingCardImageIndex = index;
	}

	function closeCardImagePicker() {
		editingCardImageIndex = null;
	}

	async function handleCardImageApprove(url: string) {
		if (!editContext || editingCardImageIndex === null) return;

		const targetIndex = editingCardImageIndex;
		const updatedCards = cards.map((card, index) =>
			index === targetIndex ? { ...card, image: url } : card
		);
		const updated = { ...data, cards: updatedCards };
		await saveComponentData(editContext, 'Message', updated);
		data = updated;
		closeCardImagePicker();
	}

	async function handleCardImageRemove() {
		await handleCardImageApprove('');
	}
</script>

{#if editingCard && editContext}
	<BgImagePicker
		{editContext}
		currentImage={editingCard.image ?? ''}
		folder="message"
		title={`Изображение блока «${editingCard.title}»`}
		cropUploads
		aspectRatio={1}
		previewFit="cover"
		maxUploadBytes={20 * 1024 * 1024}
		cropMaxWidth={1024}
		cropMaxHeight={1024}
		cropOutputMimeType="image/webp"
		cropOutputQuality={0.86}
		cropMaxOutputBytes={2 * 1024 * 1024}
		onApprove={handleCardImageApprove}
		onRemove={handleCardImageRemove}
		onClose={closeCardImagePicker}
	/>
{/if}

<!-- О компании (Message) -->
<section class="p1-surface-alt" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div class="py-16 sm:py-28">
		<div class="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 lg:px-8">
			<!-- Логотип -->
			{#if data?.logoUrl || isEditable}
				<div class="w-full max-w-xs sm:max-w-sm">
					<EditableField
						fieldKey="Message.logoUrl"
						label="Логотип (URL)"
						value={String(data?.logoUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('logoUrl', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<div class="relative">
								{#if displayValue}
									<div
										class="absolute -inset-4 rounded-3xl bg-linear-to-r from-link-100 to-cat-5-100 opacity-50 blur-xl"
									></div>
									<ImageFallback
										src={displayValue ||
											'https://storage.yandexcloud.net/novostroy/logo/promo-1-logo.png'}
										alt={String(data?.logoAlt ?? 'Логотип')}
										class="relative w-full rounded-2xl object-contain"
									/>
								{:else if isEditable}
									<div
										class="p1-border p1-card p1-muted hover:p1-card relative flex aspect-[4/1] w-full items-center justify-center rounded-2xl border-2 border-dashed transition-colors"
									>
										<div class="flex flex-col items-center gap-2">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="h-8 w-8"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="1.5"
													d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
											<span class="text-xs font-semibold tracking-wider uppercase"
												>Логотип (URL)</span
											>
										</div>
									</div>
								{/if}
							</div>
						{/snippet}
					</EditableField>
				</div>
			{/if}

			<!-- Текст -->
			<div class="w-full max-w-3xl text-center">
				<figure class="relative">
					<blockquote class="p1-title relative text-lg leading-relaxed font-medium sm:text-xl">
						<EditableField
							fieldKey="Message.text"
							label="Текст"
							value={String(data?.text ?? '')}
							{isEditable}
							multiline
							onSave={(v) => saveField('text', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								<p>{displayValue}</p>
							{/snippet}
						</EditableField>
					</blockquote>
					<div class="mx-auto mt-8 h-px w-24 bg-linear-to-r from-link-300 to-cat-5-300"></div>
				</figure>
			</div>
		</div>

		<!-- Карточки преимуществ -->
		<div class="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
			<div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
				{#each cards as card, i}
					<div
						class="message-card group p1-card p1-border relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:ring-ink-300"
					>
						<div
							class="absolute -top-4 -right-4 h-24 w-24 rounded-full transition-transform duration-500 group-hover:scale-125 {isLight
								? 'bg-link-50/80'
								: 'bg-link-500/10'}"
						></div>
						<div class="relative">
							{#if isEditable && editContext}
								<button
									type="button"
									onclick={() => openCardImagePicker(i)}
									class="group/image relative mb-4 block size-24 cursor-pointer rounded-xl text-left focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
									aria-label={`${card.image ? 'Заменить' : 'Добавить'} изображение блока «${card.title}»`}
									title={`${card.image ? 'Заменить' : 'Добавить'} изображение блока «${card.title}»`}
								>
									<span
										class="p1-border p1-card flex size-full overflow-hidden rounded-xl border transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui group-hover/image:border-link-500/50"
									>
										{#if card.image}
											<ImageFallback
												src={card.image}
												alt={card.alt}
												class="h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui)] ease-ui group-hover/image:scale-105"
											/>
										{:else}
											<span
												class="p1-muted flex size-full flex-col items-center justify-center gap-1.5"
											>
												<svg
													class="size-5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
													aria-hidden="true"
												>
													<path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="1.5"
														d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2Z"
													/>
												</svg>
												<span class="text-xs font-semibold">Добавить</span>
											</span>
										{/if}
									</span>
									<span
										class="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border border-ink-300 bg-surface-raised text-ink-700 shadow-sm transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui group-hover/image:border-link-500 group-hover/image:text-link-600"
										aria-hidden="true"
									>
										<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="1.75"
												d="M16.862 3.487a2.25 2.25 0 113.182 3.182L8.25 18.463 3.75 19.5l1.037-4.5L16.862 3.487z"
											/>
										</svg>
									</span>
								</button>
							{:else}
								<div class="mb-4 size-24 overflow-hidden rounded-xl">
									<ImageFallback
										src={card.image}
										alt={card.alt}
										class="h-full w-full object-cover"
									/>
								</div>
							{/if}
							<h3 class="p1-title p1-title-sub text-sm sm:text-base">
								<EditableField
									fieldKey={`Message.cards.${i}.title`}
									label="Заголовок"
									value={card.title}
									{isEditable}
									inline
									onSave={(v) => saveCardField(i, 'title', v)}
									class="inline"
								>
									{#snippet children(displayValue)}{displayValue}{/snippet}
								</EditableField>
							</h3>
							<p class="p1-muted mt-1.5 text-xs leading-relaxed sm:text-sm">
								<EditableField
									fieldKey={`Message.cards.${i}.description`}
									label="Описание"
									value={card.description}
									{isEditable}
									multiline
									inline
									onSave={(v) => saveCardField(i, 'description', v)}
									class="block"
								>
									{#snippet children(displayValue)}{displayValue}{/snippet}
								</EditableField>
							</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.message-card {
		animation: message-fade-in 0.6s ease-out both;
	}
	.message-card:nth-child(1) {
		animation-delay: 0.1s;
	}
	.message-card:nth-child(2) {
		animation-delay: 0.2s;
	}
	.message-card:nth-child(3) {
		animation-delay: 0.3s;
	}
	.message-card:nth-child(4) {
		animation-delay: 0.4s;
	}

	@keyframes message-fade-in {
		from {
			opacity: 0;
			transform: translateY(16px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
