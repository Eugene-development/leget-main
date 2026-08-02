<script lang="ts">
	// Артикул: 1.1.2.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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

	const cards = $derived(
		Array.isArray(data?.cards) && data.cards.length > 0
			? (data.cards as { title: string; description: string; image: string; alt: string }[])
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
</script>

<section class="relative overflow-hidden bg-slate-900 py-24 font-sans select-none sm:py-32">
	<!-- Декоративные фоновые круги -->
	<div class="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl"></div>
	<div class="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"></div>

	<div class="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
			<!-- Левая колонка: Огромный логотип и блок-цитата -->
			<div class="flex flex-col items-start text-left lg:col-span-5">
				{#if data?.logoUrl || isEditable}
					<div class="mb-10 w-32 transition-transform duration-300 hover:scale-105 md:w-40">
						<EditableField
							fieldKey="Message.logoUrl"
							label="Логотип (URL)"
							value={String(data?.logoUrl ?? '')}
							{isEditable}
							onSave={(v) => saveField('logoUrl', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<ImageFallback
										src={displayValue}
										alt={String(data?.logoAlt ?? 'Логотип')}
										class="w-full object-contain brightness-0 invert filter"
									/>
								{:else if isEditable}
									<div
										class="rounded-xl border border-dashed border-white/20 bg-white/5 p-4 text-[10px] font-bold tracking-widest text-white/50 uppercase backdrop-blur-md"
									>
										Логотип
									</div>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				{/if}

				<!-- Премиальный блок цитаты -->
				<div
					class="relative rounded-3xl border border-white/10 bg-slate-950/40 p-8 shadow-2xl backdrop-blur-xl"
				>
					<div
						class="absolute -top-6 -left-4 font-serif text-6xl leading-none text-sky-500/20 select-none"
					>
						“
					</div>
					<blockquote class="text-base leading-relaxed font-medium text-slate-200 md:text-lg">
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
								<p class="relative z-10">{displayValue}</p>
							{/snippet}
						</EditableField>
					</blockquote>
					<div class="mt-6 flex items-center gap-3">
						<span class="h-px w-8 bg-gradient-to-r from-sky-400 to-indigo-400"></span>
						<span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
							>Стремление к идеалу</span
						>
					</div>
				</div>
			</div>

			<!-- Правая колонка: Карусель/список преимуществ -->
			<div class="grid gap-6 sm:grid-cols-2 lg:col-span-7">
				{#each cards as card, i}
					<div
						class="message-card-v2 group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-950/30 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/30 hover:bg-slate-950/60 hover:shadow-sky-500/5"
					>
						<div
							class="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
						<div class="relative flex h-full flex-col justify-between">
							<div>
								<div
									class="mb-5 size-16 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 transition-colors duration-300 group-hover:border-sky-500/30"
								>
									<ImageFallback
										src={card.image}
										alt={card.alt}
										class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
									/>
								</div>
								<h3
									class="text-base font-bold text-white transition-colors duration-300 group-hover:text-sky-300"
								>
									<EditableField
										fieldKey={`Message.cards.${i}.title`}
										label="Заголовок"
										value={card.title}
										{isEditable}
										onSave={(v) => saveCardField(i, 'title', v)}
										class="inline"
									>
										{#snippet children(displayValue)}{displayValue}{/snippet}
									</EditableField>
								</h3>
								<p
									class="mt-2 text-xs leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300 md:text-sm"
								>
									<EditableField
										fieldKey={`Message.cards.${i}.description`}
										label="Описание"
										value={card.description}
										{isEditable}
										multiline
										onSave={(v) => saveCardField(i, 'description', v)}
										class="block"
									>
										{#snippet children(displayValue)}{displayValue}{/snippet}
									</EditableField>
								</p>
							</div>
							<div
								class="mt-4 flex items-center gap-1.5 text-slate-500 transition-colors duration-300 group-hover:text-sky-400"
							>
								<span class="text-[10px] font-bold tracking-widest uppercase">Подробнее</span>
								<svg
									class="h-3.5 w-3.5 translate-x-0 transform transition-transform duration-300 group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2.5"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	/* Outfit font is loaded once in Promo-1 layout/Header.svelte */

	blockquote {
		font-family: 'Outfit', sans-serif;
	}

	.message-card-v2 {
		animation: message-fade-in-v2 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.message-card-v2:nth-child(1) {
		animation-delay: 0.1s;
	}
	.message-card-v2:nth-child(2) {
		animation-delay: 0.2s;
	}
	.message-card-v2:nth-child(3) {
		animation-delay: 0.3s;
	}
	.message-card-v2:nth-child(4) {
		animation-delay: 0.4s;
	}

	@keyframes message-fade-in-v2 {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
