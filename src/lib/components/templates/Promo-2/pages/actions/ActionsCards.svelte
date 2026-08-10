<script lang="ts">
	// Артикул: 2.8.3.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveCards(updated: typeof defaultCards) {
		if (!editContext) return;
		const updatedData = { ...data, cards: updated };
		await saveComponentData(editContext, 'ActionsCards', updatedData);
		data = updatedData;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;
	let activeFilter = $state('all');

	const defaultFilters = [
		{ key: 'all', label: 'Все акции' },
		{ key: 'furniture', label: 'Мебель' },
		{ key: 'service', label: 'Услуги' },
		{ key: 'tech', label: 'Техника' }
	];

	const defaultCards = [
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
		Array.isArray(data?.cards) && (data.cards as unknown[]).length > 0
			? (data.cards as typeof defaultCards)
			: defaultCards
	);

	const filteredCards = $derived(
		activeFilter === 'all' ? cards : cards.filter((c) => c.category === activeFilter)
	);

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
		return () => observer.disconnect();
	});
</script>

<section class="relative py-section-sm lg:py-section" bind:this={sectionEl}>
	<!-- Subtle Background Pattern -->
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232c2c2c\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="relative mx-auto max-w-screen-xl px-6 xl:px-1">
		<!-- Section Header -->
		<div
			class="mb-12 flex flex-col items-start justify-between gap-6 opacity-0 transition-all duration-700 md:flex-row md:items-end"
			class:animate-fade-up={visible}
		>
			<div>
				<EditableField
					fieldKey="ActionsCards.label"
					label="Лейбл"
					value={String(data?.label ?? 'Текущие предложения')}
					{isEditable}
					onSave={async (v) => {
						if (!editContext) return;
						const updated = { ...data, label: v };
						await saveComponentData(editContext, 'ActionsCards', updated);
						data = updated;
					}}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span
						>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ActionsCards.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Все акции')}
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
							class="mt-3 text-4xl text-primary lg:text-5xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>
			</div>

			<!-- Filter Tabs -->
			<div class="flex flex-wrap gap-2">
				{#each filters as filter}
					<button
						onclick={() => (activeFilter = filter.key)}
						class="border px-5 py-2.5 text-xs tracking-[0.12em] uppercase transition-all duration-300"
						class:border-primary={activeFilter === filter.key}
						class:bg-primary={activeFilter === filter.key}
						class:text-white={activeFilter === filter.key}
						class:border-border-medium={activeFilter !== filter.key}
						class:text-secondary={activeFilter !== filter.key}
						class:hover:border-secondary={activeFilter !== filter.key}
						class:hover:text-secondary={activeFilter !== filter.key}
					>
						{filter.label}
					</button>
				{/each}
			</div>
		</div>

		<!-- Cards Grid -->
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each filteredCards as card, i (card.id)}
				<div
					class="group relative flex flex-col overflow-hidden bg-white opacity-0 shadow-card transition-all duration-500 hover:-translate-y-2 hover:shadow-elevated"
					class:animate-fade-up={visible}
					style="animation-delay: {0.15 + i * 0.1}s"
				>
					<!-- Image -->
					<div class="relative aspect-[3/2] overflow-hidden">
						<img
							loading="lazy"
							src={card.image || undefined}
							alt={card.title}
							class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"
						></div>

						<!-- Tag badge -->
						<div class="absolute top-4 left-4">
							<span
								class="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium tracking-[0.2em] uppercase"
								class:bg-accent={card.tagColor === 'accent'}
								class:text-primary={card.tagColor === 'accent'}
								class:bg-secondary={card.tagColor === 'secondary'}
								class:text-white={card.tagColor === 'secondary' || card.tagColor === 'primary'}
								class:bg-primary={card.tagColor === 'primary'}
							>
								{card.tag}
							</span>
						</div>

						<!-- Discount badge -->
						<div class="absolute right-4 bottom-4">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/20 text-center text-xs font-medium text-white backdrop-blur-md"
							>
								<span class="leading-tight">{card.discount}</span>
							</div>
						</div>
					</div>

					<!-- Content -->
					<div class="flex flex-1 flex-col p-6 lg:p-8">
						<h3
							class="text-xl text-primary transition-colors duration-300 group-hover:text-secondary lg:text-2xl"
							style="font-family: var(--font-heading);"
						>
							{card.title}
						</h3>
						<p class="mt-3 text-sm leading-relaxed text-secondary">{card.description}</p>

						<!-- Price -->
						<div class="mt-auto pt-5">
							<div class="flex items-end justify-between">
								<div>
									{#if card.oldPrice}
										<p class="text-xs text-muted line-through">{card.oldPrice} ₽</p>
									{/if}
									<p
										class="text-2xl font-light text-primary"
										style="font-family: var(--font-heading);"
									>
										{card.newPrice}
										<span class="text-base"> ₽</span>
									</p>
								</div>
								<div class="text-right">
									<p class="text-[10px] tracking-[0.1em] text-muted uppercase">До</p>
									<p class="text-xs text-secondary">{card.until}</p>
								</div>
							</div>

							<!-- CTA -->
							<div class="mt-4">
								<a
									href={String(data?.consultLink ?? '/contact')}
									class="group/btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-primary bg-primary px-4 py-3 text-[10px] tracking-[0.12em] text-white uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
								>
									Консультация
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
								</a>
							</div>
						</div>
					</div>
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
				<p class="mt-4 text-base text-muted">Акций в этой категории пока нет</p>
			</div>
		{/if}
	</div>
</section>
