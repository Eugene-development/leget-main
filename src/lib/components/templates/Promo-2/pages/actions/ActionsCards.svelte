<script lang="ts">
	import { usePromotionClock } from '$lib/promotions/clock.svelte';
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	import { openPromo2Form } from '$lib/components/templates/Promo-2/forms/request';
	// Артикул: 2.8.3.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { getContext, onMount, tick } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { blockTheme } from '$lib/utils/block-theme';
	import { editStore } from '$lib/stores/edit.svelte';
	import PromotionCardEditor from './PromotionCardEditor.svelte';
	import {
		EDITABLE_VISIBILITY_CONTEXT,
		type EditableVisibility
	} from '$lib/utils/editable-visibility.svelte';
	import {
		formatPromotionDeadline,
		promotionDeadline,
		removePromotion,
		type PromotionCard,
		type PromotionCardFields
	} from './promotion-cards';
	import '../../../Promo-1/theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	let visible = $state(false);
	let sectionEl = $state<HTMLElement>();
	let activeFilter = $state('all');
	const theme = $derived(blockTheme(data));

	const defaultFilters = [
		{ key: 'all', label: 'Все акции' },
		{ key: 'furniture', label: 'Мебель' },
		{ key: 'service', label: 'Услуги' },
		{ key: 'tech', label: 'Техника' }
	];

	const defaultCards: PromotionCard[] = [
		{
			id: 1,
			category: 'furniture',
			tag: 'Главная акция',
			tagColor: 'accent',
			discount: '−30%',
			title: 'Кухня мечты',
			description: 'Наша самая популярная акция. Кухонный гарнитур с премиум скидкой 30%',
			oldPrice: '600 000',
			newPrice: '420 000',
			image: null,
			until: '31 мая 2026'
		},
		{
			id: 2,
			category: 'service',
			tag: 'Сервис',
			tagColor: 'secondary',
			discount: 'В подарок',
			title: 'Бесплатная доставка',
			description: 'Бесплатная доставка и подъём грузчиками на любой заказ в черте города',
			oldPrice: '7 000',
			newPrice: '0',
			image: null,
			until: '31 мая 2026'
		},
		{
			id: 3,
			category: 'tech',
			tag: 'В подарок',
			tagColor: 'primary',
			discount: '−100%',
			title: 'Техника в подарок',
			description: 'Получите в подарок бытовую технику при заказе кухонного гарнитура',
			oldPrice: null,
			newPrice: '0',
			image: null,
			until: '31 мая 2026'
		}
	];

	const filters = $derived(
		Array.isArray(data?.filters) && (data.filters as unknown[]).length > 0
			? (data.filters as typeof defaultFilters)
			: defaultFilters
	);

	const cards = $derived(
		Array.isArray(data?.cards) ? (data.cards as PromotionCard[]) : defaultCards
	);

	const promotionEntries = $derived(
		cards.map((card, index) => ({
			card,
			index,
			deadline: promotionDeadline(card)
		}))
	);
	const now = usePromotionClock(() => promotionEntries.map(({ deadline }) => deadline));
	const filteredCards = $derived(
		promotionEntries.filter(
			({ card, deadline }) =>
				(isEditable || (card.enabled !== false && (deadline === null || deadline > now()))) &&
				(activeFilter === 'all' || card.category === activeFilter)
		)
	);

	type ManagementAction = { mode: 'add' | 'edit' | 'remove'; id: PromotionCard['id'] };
	const visibilityEditor = getContext<EditableVisibility | null>(EDITABLE_VISIBILITY_CONTEXT);
	const canManage = $derived(isEditable && !!editContext);
	const managementBusy = $derived(
		editStore.activeField !== null || visibilityEditor?.isPending('cards') === true
	);
	const categories = $derived(filters.filter(({ key }) => key !== 'all'));
	let addButton: HTMLButtonElement;
	let management = $state<ManagementAction | null>(null);
	const selectedCard = $derived(cards.find(({ id }) => id === management?.id));
	const managementButton =
		'p1-border p1-title min-h-10 rounded-sm border px-3 py-1.5 text-sm font-medium hover:border-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600 disabled:opacity-50';
	function openManagement(mode: ManagementAction['mode'], card?: PromotionCard) {
		if (!canManage || managementBusy || management) return;
		management = { mode, id: card?.id ?? crypto.randomUUID() };
	}

	async function closeManagement(saved = false) {
		const restoreToAdd = saved && management?.mode === 'remove';
		management = null;
		if (restoreToAdd) {
			await tick();
			addButton?.focus();
		}
	}

	async function saveManagement(values: PromotionCardFields) {
		if (!canManage || !editContext || !management) throw new Error('Редактирование недоступно.');
		const { mode, id } = management;
		const index = cards.findIndex((card) => card.id === id);
		if (mode !== 'add' && index === -1) {
			throw new Error('Акция уже удалена. Закройте окно и обновите страницу.');
		}

		const { title, category, expiresAt } = values;
		let updatedData: Record<string, unknown>;
		if (mode === 'remove') {
			updatedData = removePromotion(data, cards, index);
		} else if (mode === 'add') {
			updatedData = { ...data, cards: [...cards, { id, title, category, expiresAt }] };
		} else {
			const updatedCards = cards.map((card, i) =>
				i === index
					? { ...card, category, ...(expiresAt !== undefined ? { expiresAt } : {}) }
					: card
			);
			updatedData = { ...data, cards: updatedCards };
		}

		const componentId = await saveComponentData(editContext, 'ActionsCards', updatedData);
		if (!componentId) throw new Error('Не удалось сохранить изменения. Повторите попытку.');
		data = updatedData;
		if (mode === 'add' || (mode === 'edit' && activeFilter !== category)) activeFilter = 'all';
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => {
			observer.disconnect();
		};
	});
</script>

{#snippet addPromotionSettings()}
	<button
		bind:this={addButton}
		type="button"
		class={managementButton}
		disabled={managementBusy}
		data-goal-ignore="Добавление акции в редакторе сайта"
		onclick={() => openManagement('add')}>Добавить акцию</button
	>
{/snippet}

{#snippet cardSettings(card: PromotionCard, deadline: number | null)}
	<div class="p1-body p1-border flex flex-wrap items-center gap-2 border-t p-4">
		<button
			type="button"
			class={managementButton}
			disabled={managementBusy}
			data-goal-ignore="Изменение категории и срока акции в редакторе сайта"
			onclick={() => openManagement('edit', card)}>Настройки акции</button
		>
		<button
			type="button"
			class={managementButton}
			disabled={managementBusy}
			data-goal-ignore="Удаление акции в редакторе сайта"
			onclick={() => openManagement('remove', card)}>Удалить</button
		>
		{#if deadline !== null && deadline <= now()}
			<span class="text-xs font-medium">Акция завершена</span>
		{/if}
	</div>
{/snippet}

<section
	id="actions-cards"
	class="relative py-section-sm lg:py-section"
	class:p1-surface={theme === 'dark'}
	data-p1-theme={theme}
	bind:this={sectionEl}
>
	<!-- Subtle Background Pattern -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232c2c2c\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="relative p2-container mx-auto">
		<!-- Section Header -->
		<div
			class="mb-12 flex flex-col items-start justify-between gap-6 opacity-0 transition-all duration-700 md:flex-row md:items-end"
			class:animate-fade-up={visible}
		>
			<div>
				<EditableField
					fieldKey="ActionsCards.label"
					label="Лейбл"
					value={editableText(data?.label, 'Текущие предложения')}
					{isEditable}
					onSave={async (v) => {
						if (!editContext) return;
						const updated = { ...data, label: v };
						await saveComponentData(editContext, 'ActionsCards', updated);
						data = updated;
					}}
				>
					{#snippet children(displayValue)}
						<span class="p1-body text-[11px] tracking-[0.3em] uppercase"
							><RichText value={displayValue} /></span
						>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ActionsCards.heading"
					label="Заголовок"
					value={editableText(data?.heading, 'Все акции')}
					{isEditable}
					onSave={async (v) => {
						if (!editContext) return;
						const updated = { ...data, heading: v };
						await saveComponentData(editContext, 'ActionsCards', updated);
						data = updated;
					}}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="p1-title mt-3 text-section-title"
							style="font-family: var(--font-heading);"
						>
							<RichText value={displayValue} />
						</h2>
					{/snippet}
				</EditableField>
			</div>

			<!-- Filter Tabs -->
			<div class="flex flex-wrap gap-2">
				{#each filters as filter, filterIndex (filter.key)}
					<button
						onclick={() => (activeFilter = filter.key)}
						class="border px-5 py-2.5 text-xs tracking-[0.12em] uppercase transition-all duration-300"
						class:border-primary={activeFilter === filter.key}
						class:bg-primary={activeFilter === filter.key}
						class:text-inverse={activeFilter === filter.key}
						class:p1-border={activeFilter !== filter.key}
						class:p1-body={activeFilter !== filter.key}
						class:hover:border-secondary={activeFilter !== filter.key}
					>
						<ContentText
							bind:data
							{editContext}
							{isEditable}
							componentType="ActionsCards"
							path={['filters', filterIndex, 'label']}
							fallback={filter.label}
							label="Текст"
							defaults={{ filters }}
							richText={false}
						/>
					</button>
				{/each}
			</div>
		</div>

		<!-- Cards Grid -->
		{#if canManage}
			<div class="mb-6">{@render addPromotionSettings()}</div>
		{/if}
		{#if canManage && management}
			<PromotionCardEditor
				mode={management.mode}
				card={selectedCard}
				{categories}
				onSave={saveManagement}
				onClose={closeManagement}
			/>
		{/if}
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredCards as { card, index, deadline }, i (card.id)}
				<div
					class="p1-card group relative flex flex-col overflow-hidden opacity-0 shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated"
					class:animate-fade-up={visible}
					style="animation-delay: {0.15 + i * 0.1}s"
				>
					<!-- Image -->
					<div class="relative aspect-[3/2] overflow-hidden">
						<ImageFallback
							imagePath={['cards', index, 'image']}
							imageDefaults={{ cards }}
							loading="lazy"
							src={card.image || undefined}
							alt={card.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
						></div>

						<!-- Tag badge -->
						{#if card.tag || canManage}
							<div class="absolute top-4 left-4">
								<span
									class="inline-flex items-center gap-1.5 bg-accent px-3 py-1.5 text-xs font-medium tracking-[0.2em] text-on-accent uppercase"
								>
									<ContentText
										bind:data
										{editContext}
										{isEditable}
										componentType="ActionsCards"
										path={['cards', index, 'tag']}
										fallback={card.tag}
										label="Метка акции"
										placeholder="Метка"
										defaults={{ cards }}
									/>
								</span>
							</div>
						{/if}

						<!-- Discount badge -->
						{#if card.discount || canManage}
							<div class="absolute right-4 bottom-4">
								<div
									class="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 text-center text-xs font-medium text-white backdrop-blur-md"
								>
									<span class="leading-tight"
										><ContentText
											bind:data
											{editContext}
											{isEditable}
											componentType="ActionsCards"
											path={['cards', index, 'discount']}
											fallback={card.discount}
											label="Размер скидки"
											placeholder="Скидка"
											defaults={{ cards }}
										/></span
									>
								</div>
							</div>
						{/if}
					</div>

					<!-- Content -->
					<div class="flex flex-1 flex-col p-6 lg:p-8">
						<h3 class="p1-title text-card-title" style="font-family: var(--font-heading);">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="ActionsCards"
								path={['cards', index, 'title']}
								fallback={card.title}
								label="Заголовок"
								placeholder="Название акции"
								defaults={{ cards }}
							/>
						</h3>
						<p class="p1-body mt-3 text-prose">
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="ActionsCards"
								path={['cards', index, 'description']}
								fallback={card.description}
								label="Описание"
								placeholder="Добавить описание"
								defaults={{ cards }}
								multiline
							/>
						</p>

						<!-- Price -->
						<div class="mt-auto pt-5">
							<div class="flex items-end justify-between">
								<div>
									{#if card.oldPrice || canManage}
										<p class="p1-muted text-xs" class:line-through={!!card.oldPrice}>
											<ContentText
												bind:data
												{editContext}
												{isEditable}
												componentType="ActionsCards"
												path={['cards', index, 'oldPrice']}
												fallback={card.oldPrice}
												label="Старая цена"
												placeholder="Старая цена"
												defaults={{ cards }}
												richText={false}
												multiline
											/>
											{#if card.oldPrice}<ContentText
													bind:data
													{editContext}
													{isEditable}
													componentType="ActionsCards"
													path={['copy', 'currencyText']}
													fallback={'₽'}
													label="₽"
													multiline
												/>{/if}
										</p>
									{/if}
									{#if card.newPrice || canManage}
										<p
											class="p1-title text-2xl font-light"
											style="font-family: var(--font-heading);"
										>
											<ContentText
												bind:data
												{editContext}
												{isEditable}
												componentType="ActionsCards"
												path={['cards', index, 'newPrice']}
												fallback={card.newPrice}
												label="Цена по акции"
												placeholder="Цена по акции"
												defaults={{ cards }}
												richText={false}
												multiline
											/>
											{#if card.newPrice}<span class="text-base">
													<ContentText
														bind:data
														{editContext}
														{isEditable}
														componentType="ActionsCards"
														path={['copy', 'currencyText']}
														fallback={'₽'}
														label="₽"
													/></span
												>{/if}
										</p>
									{/if}
								</div>
								{#if (card.expiresAt === undefined && card.until) || deadline !== null}
									<div class="text-right">
										<p class="p1-muted text-xs tracking-[0.1em] uppercase">
											<ContentText
												bind:data
												{editContext}
												{isEditable}
												componentType="ActionsCards"
												path={['copy', 'untilPrefix']}
												fallback={'До'}
												label="До"
												multiline
											/>
										</p>
										<p class="p1-body text-xs">
											{#if card.expiresAt && deadline !== null}
												<time datetime={card.expiresAt}>{formatPromotionDeadline(deadline)}</time>
											{:else}
												<ContentText
													bind:data
													{editContext}
													{isEditable}
													componentType="ActionsCards"
													path={['cards', index, 'until']}
													fallback={card.until}
													label="Подпись срока действия"
													defaults={{ cards }}
													richText={false}
													multiline
												/>
											{/if}
										</p>
									</div>
								{/if}
							</div>

							<!-- CTA -->
							<div class="mt-4">
								<button
									class="group/btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-primary bg-primary px-4 py-3 text-xs tracking-[0.12em] text-inverse uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary hover:text-on-accent"
									type="button"
									data-metrika-goal="pages_actions_actionscards_open"
									data-goal-action="open"
									onclick={() => {
										if (!isEditable) openPromo2Form('action-consultation', card.title);
									}}
								>
									<ContentText
										bind:data
										{editContext}
										{isEditable}
										componentType="ActionsCards"
										path={['copy', 'consultationText']}
										fallback={'Консультация'}
										label="Консультация"
										richText={false}
									/>
									<svg
										class="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
										/>
									</svg>
								</button>
							</div>
						</div>
					</div>
					{#if canManage}
						{@render cardSettings(card, deadline)}
					{/if}
				</div>
			{/each}
		</div>

		<!-- Empty state -->
		{#if filteredCards.length === 0}
			<div class="flex flex-col items-center py-24 text-center">
				<svg
					class="h-12 w-12 text-border-medium"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
					/>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z" />
				</svg>
				<p class="p1-body mt-4 text-prose">
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="ActionsCards"
						path={['copy', 'body1']}
						fallback={'Акций в этой категории пока нет'}
						label="Акций в этой категории пока нет"
						multiline
					/>
				</p>
			</div>
		{/if}
	</div>
</section>
