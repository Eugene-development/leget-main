<script lang="ts">
	// Артикул: 1.1.2.2 — см. docs/architecture/component-articles-map.md
	//
	// «Паспорт работы»: та же опись выполненных проектов, что и в v1, но каждая
	// работа развёрнута в запись — кадр с именем НА нём и колонка измеримых
	// величин рядом. Роль блока и контракт данных — в ../data.ts.
	//
	// Версия переписана 19.08.2026 прогоном /ds-loop. До неё это была сетка
	// одинаковых карточек «фото + подпись» — то же решение, что у v1, только
	// в две колонки; описи величин в шаблоне не было ни одной, и три роли
	// системы (`p1-numeric`, `--ds-text-shadow-media`, скрим) оставались
	// без живого потребителя. Здесь они получают его разом.
	//
	// ⚠️ Всё, что лежит НА кадре, теме блока не подчиняется: под текстом
	// фотография, а не поверхность секции. Поэтому там роли `p1-scrim`,
	// `text-on-dark`, `text-shadow-media`, а не `p1-title` / `p1-border`.
	// Правило впервые записано в `Direction/v2`, с 19.08.2026 — роль в theme.css.
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
	const isLight = $derived(isLightBlock(data, 'dark'));

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

	async function saveCards(updatedCards: MessageProject[]) {
		if (!editContext) return;
		const updated = { ...data, cards: updatedCards };
		await saveComponentData(editContext, 'Message', updated);
		data = updated;
	}

	async function saveCardField(
		index: number,
		field: 'title' | 'description' | 'link',
		value: string
	) {
		const updatedCards = [...projects];
		updatedCards[index] = { ...updatedCards[index], [field]: value };
		await saveCards(updatedCards);
	}

	async function saveSpecField(
		cardIndex: number,
		specIndex: number,
		field: 'label' | 'value',
		value: string
	) {
		const updatedCards = projects.map((card, index) =>
			index === cardIndex
				? {
						...card,
						specs: card.specs.map((spec, i) =>
							i === specIndex ? { ...spec, [field]: value } : spec
						)
					}
				: card
		);
		await saveCards(updatedCards);
	}

	function openCardImagePicker(index: number) {
		editingCardImageIndex = index;
	}

	function closeCardImagePicker() {
		editingCardImageIndex = null;
	}

	async function handleCardImageApprove(url: string) {
		if (editingCardImageIndex === null) return;

		const targetIndex = editingCardImageIndex;
		await saveCards(
			projects.map((card, index) => (index === targetIndex ? { ...card, image: url } : card))
		);
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
		aspectRatio={16 / 9}
		previewFit="cover"
		maxUploadBytes={20 * 1024 * 1024}
		cropMaxWidth={1800}
		cropMaxHeight={1013}
		cropOutputMimeType="image/webp"
		cropOutputQuality={0.86}
		cropMaxOutputBytes={2 * 1024 * 1024}
		onApprove={handleCardImageApprove}
		onRemove={handleCardImageRemove}
		onClose={closeCardImagePicker}
	/>
{/if}

<!-- Выполненные проекты (Message) -->
<section
	class="p1-surface py-section-sm font-sans sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<!-- Шапка: мера абзаца ограничена, опись ниже идёт во всю ширину -->
		<div class="max-w-2xl">
			<EditableField
				fieldKey="Message.title"
				label="Заголовок"
				value={String(data?.title ?? MESSAGE_DEFAULT_TITLE)}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title text-4xl sm:text-5xl lg:text-6xl">{displayValue}</h2>
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
		</div>

		<!-- Опись работ: запись на строку, разделены волосяной линией -->
		<div class="mt-14 sm:mt-20">
			{#each projects as card, i}
				<!-- `relative` несущий: по нему растягивается зона нажатия ссылки
				     (`after:inset-0`), поэтому нажимается вся запись целиком. -->
				<article
					class="record p1-line group relative animate-fade-up-in"
					style="animation-delay: var(--ds-motion-stagger-{Math.min(i + 1, 5)})"
				>
					<!-- Кадр. Имя работы лежит на нём, а не под ним: подпись под
					     фотографией читается как её описание, надпись на кадре —
					     как имя предмета. Ради этого блоку и понадобились скрим
					     и тень текста. -->
					<div class="record-frame p1-body relative overflow-hidden rounded-2xl">
						{#if isEditable && editContext}
							<button
								type="button"
								onclick={() => openCardImagePicker(i)}
								class="group/image block h-full w-full cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:outline-none focus-visible:ring-inset"
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
							<ImageFallback
								src={card.image}
								alt={card.alt}
								class="h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui group-hover:scale-105"
							/>
						{/if}

						<!-- Скрим — роль системы, а не самодельный градиент: плотность
						     и протяжённость приходят из `--ds-scrim-*`. -->
						<div class="p1-scrim pointer-events-none absolute inset-0"></div>

						<h3
							class="p1-title-sub pointer-events-none absolute inset-x-0 bottom-0 p-6 text-xl text-on-dark text-shadow-media sm:text-2xl"
						>
							<EditableField
								fieldKey={`Message.cards.${i}.title`}
								label="Название проекта"
								value={card.title}
								{isEditable}
								inline
								onSave={(v) => saveCardField(i, 'title', v)}
								class="pointer-events-auto inline"
							>
								{#snippet children(displayValue)}{displayValue}{/snippet}
							</EditableField>
						</h3>
					</div>

					<!-- Паспорт работы -->
					<div class="record-body">
						<p class="p1-body text-sm leading-relaxed sm:text-base">
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

						{#if card.specs.length > 0}
							<!-- Опись величин. `p1-label` на мере, `p1-numeric` на
							     величине: колонка чисел обязана выровняться по
							     разрядам, иначе «23 дня» и «41 день» едут друг
							     относительно друга. -->
							<dl class="specs mt-6">
								{#each card.specs as spec, s}
									<div class="spec p1-line">
										<dt class="p1-label p1-muted">
											<EditableField
												fieldKey={`Message.cards.${i}.specs.${s}.label`}
												label="Мера"
												value={spec.label}
												{isEditable}
												inline
												onSave={(v) => saveSpecField(i, s, 'label', v)}
												class="inline"
											>
												{#snippet children(displayValue)}{displayValue}{/snippet}
											</EditableField>
										</dt>
										<dd class="p1-numeric p1-title mt-1 text-lg">
											<EditableField
												fieldKey={`Message.cards.${i}.specs.${s}.value`}
												label="Величина"
												value={spec.value}
												{isEditable}
												inline
												onSave={(v) => saveSpecField(i, s, 'value', v)}
												class="inline"
											>
												{#snippet children(displayValue)}{displayValue}{/snippet}
											</EditableField>
										</dd>
									</div>
								{/each}
							</dl>
						{/if}

						{#if isEditable}
							<EditableField
								fieldKey={`Message.cards.${i}.link`}
								label="Ссылка на проект"
								value={card.link}
								{isEditable}
								onSave={(v) => saveCardField(i, 'link', v)}
								class="mt-6 block"
							>
								{#snippet children(displayValue)}
									<span class="p1-muted block truncate text-xs">
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
								class="p1-accent p1-label mt-6 inline-flex items-center gap-1.5 after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 focus-visible:outline-none"
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
</section>

<style>
	/* Мера колонок записи — частное этой версии: сколько места отдать кадру,
	   а сколько паспорту, система не решает. Всё остальное здесь — роли. */
	/* Разделители описи — роль `p1-line` классом на самой строке; здесь только
	   толщина и сторона. Роль стала границей 19.08.2026 ровно из-за этого
	   блока: до неё она красила фон, годилась лишь отдельному элементу
	   толщиной в пиксель, и опись брала вместо неё `p1-border` — рамку
	   карточки, 0,1 против 0,07 у линии. */
	.record {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.5rem;
		padding-block: 2.5rem;
		border-block-start-width: 1px;
		border-block-start-style: solid;
	}

	.record:last-child {
		border-block-end-width: 1px;
		border-block-end-style: solid;
	}

	.record-body {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.record-frame {
		aspect-ratio: 16 / 9;
	}

	@media (min-width: 1024px) {
		.record {
			grid-template-columns: 7fr 5fr;
			gap: 3rem;
			/* Паспорт растягивается на высоту кадра и разносит содержимое по
			   краям: описание встаёт вровень с верхом снимка, колонка величин —
			   вровень с именем работы в его левом нижнем углу. Две высоты
			   связывают колонки, тогда как выключка по центру (и по низу)
			   оставляла между ними ~300px пустоты и связи не давала. */
			align-items: stretch;
		}
	}

	/* Опись величин. Колонки равной ширины, а не auto: меры разной длины
	   («Срок» против «Длина гарнитура») иначе двигали бы величины, и колонка
	   чисел, ради которой берётся `tabular-nums`, теряла бы смысл. */
	.specs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}

	.spec {
		border-block-start-width: 1px;
		border-block-start-style: solid;
		padding-block-start: 0.75rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.record {
			animation: none;
		}
	}
</style>
