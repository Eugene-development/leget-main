<script lang="ts">
	// Артикул: 1.1.2.1 — см. docs/architecture/component-articles-map.md
	//
	// Опись выполненных работ: заголовок, пояснение и сетка превью, каждое
	// открывает свой проект. Роль блока и контракт данных — в ../data.ts.
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import {
		MESSAGE_DEFAULT_TEXT,
		MESSAGE_DEFAULT_TITLE,
		MESSAGE_PROJECT_LINK_LABEL,
		isExternalProjectLink,
		resolveMessageProjects,
		type MessageProject
	} from '../data';
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
	const isLight = $derived(isLightBlock(data, 'light'));

	const projects = $derived<MessageProject[]>(resolveMessageProjects(data?.cards));

	let editingCardImageIndex = $state<number | null>(null);
	const editingCard = $derived(
		editingCardImageIndex === null ? null : (projects[editingCardImageIndex] ?? null)
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Message', updated);
		data = updated;
	}

	async function saveCardField(
		index: number,
		field: 'title' | 'description' | 'link',
		value: string
	) {
		if (!editContext) return;
		const updatedCards = [...projects];
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
		const updatedCards = projects.map((card, index) =>
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
		title={`Фотография проекта «${editingCard.title}»`}
		cropUploads
		aspectRatio={4 / 3}
		previewFit="cover"
		maxUploadBytes={20 * 1024 * 1024}
		cropMaxWidth={1600}
		cropMaxHeight={1200}
		cropOutputMimeType="image/webp"
		cropOutputQuality={0.86}
		cropMaxOutputBytes={2 * 1024 * 1024}
		onApprove={handleCardImageApprove}
		onRemove={handleCardImageRemove}
		onClose={closeCardImagePicker}
	/>
{/if}

<!-- Выполненные проекты (Message) -->
<section class="p1-surface-alt" data-p1-theme={isLight ? 'light' : 'dark'}>
	<div class="py-section-sm sm:py-section">
		<div class="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 lg:px-8">
			<div class="w-full max-w-3xl text-center">
				<EditableField
					fieldKey="Message.title"
					label="Заголовок"
					value={String(data?.title ?? MESSAGE_DEFAULT_TITLE)}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="p1-title text-4xl sm:text-5xl">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="p1-body mt-6 text-base leading-relaxed sm:text-lg">
					<EditableField
						fieldKey="Message.text"
						label="Текст"
						value={String(data?.text ?? MESSAGE_DEFAULT_TEXT)}
						{isEditable}
						multiline
						onSave={(v) => saveField('text', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p>{displayValue}</p>
						{/snippet}
					</EditableField>
				</div>

				<div class="mx-auto mt-8 h-px w-24 bg-linear-to-r from-link-300 to-cat-5-300"></div>
			</div>
		</div>

		<!-- Опись работ -->
		<div class="mx-auto mt-14 max-w-7xl px-6 lg:px-8">
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each projects as card, i}
					<!-- `relative` здесь несущий: по нему растягивается зона нажатия
					     ссылки (`after:inset-0`), поэтому кликабельна вся карточка,
					     а ссылка в разметке остаётся одна. -->
					<article
						class="group p1-card p1-border relative flex animate-fade-up-in flex-col overflow-hidden rounded-2xl border shadow-sm transition duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-1 hover:shadow-lg"
						style="animation-delay: var(--ds-motion-stagger-{Math.min(i + 1, 5)})"
					>
						{#if isEditable && editContext}
							<button
								type="button"
								onclick={() => openCardImagePicker(i)}
								class="group/image p1-body relative block aspect-[4/3] w-full cursor-pointer overflow-hidden text-left focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none focus-visible:ring-inset"
								aria-label={`${card.image ? 'Заменить' : 'Добавить'} фотографию проекта «${card.title}»`}
								title={`${card.image ? 'Заменить' : 'Добавить'} фотографию проекта «${card.title}»`}
							>
								<ImageFallback
									src={card.image}
									alt={card.alt}
									class="h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui group-hover/image:scale-105"
								/>
								<span
									class="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full border border-ink-300 bg-surface-raised text-ink-700 shadow-sm transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui group-hover/image:border-link-500 group-hover/image:text-link-600"
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
							<div class="p1-body aspect-[4/3] w-full overflow-hidden">
								<ImageFallback
									src={card.image}
									alt={card.alt}
									class="h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui group-hover:scale-105"
								/>
							</div>
						{/if}

						<div class="flex flex-1 flex-col p-5">
							<h3 class="p1-title p1-title-sub text-base">
								<EditableField
									fieldKey={`Message.cards.${i}.title`}
									label="Название проекта"
									value={card.title}
									{isEditable}
									inline
									onSave={(v) => saveCardField(i, 'title', v)}
									class="inline"
								>
									{#snippet children(displayValue)}{displayValue}{/snippet}
								</EditableField>
							</h3>
							<!-- Описание работы — роль `p1-body`, а не `p1-muted`: это содержание
						     карточки, а не подпись к ней, и на тёмной половине `p1-muted`
						     по составной подложке карточки (4% белого над секцией) даёт
						     4,15:1 — ниже порога 1.4.3 для кегля 12–14px. `p1-body` там же
						     держит около 7:1. -->
							<p class="p1-body mt-2 text-xs leading-relaxed sm:text-sm">
								<EditableField
									fieldKey={`Message.cards.${i}.description`}
									label="Описание проекта"
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

							{#if isEditable}
								<EditableField
									fieldKey={`Message.cards.${i}.link`}
									label="Ссылка на проект"
									value={card.link}
									{isEditable}
									onSave={(v) => saveCardField(i, 'link', v)}
									class="mt-auto block pt-4"
								>
									{#snippet children(displayValue)}
										<span class="p1-muted block truncate text-[11px]">
											{displayValue || 'Ссылка на проект не задана'}
										</span>
									{/snippet}
								</EditableField>
							{:else if card.link}
								<a
									href={card.link}
									target={isExternalProjectLink(card.link) ? '_blank' : null}
									rel={isExternalProjectLink(card.link) ? 'noopener noreferrer' : null}
									aria-label={`${MESSAGE_PROJECT_LINK_LABEL}: ${card.title}`}
									class="p1-accent mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-[11px] font-bold tracking-widest uppercase transition-colors duration-[var(--ds-motion-duration-ui)] ease-ui after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
								>
									{MESSAGE_PROJECT_LINK_LABEL}
									<svg
										class="size-3.5 transition-transform duration-[var(--ds-motion-duration-ui)] ease-ui group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2.5"
											d="M9 5l7 7-7 7"
										/>
									</svg>
								</a>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		</div>
	</div>
</section>
