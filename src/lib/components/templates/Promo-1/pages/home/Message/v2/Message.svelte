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
					{ title: 'Дизайн-проект',    description: 'Бесплатный 3D-проект с визуализацией и точными замерами', image: null, alt: 'Дизайн-проект'    },
					{ title: 'Мебель',            description: 'Производство по точным размерам и вашим предпочтениям',   image: null,         alt: 'Мебель на заказ'  },
					{ title: 'Партнёрство',       description: 'Сотрудничаем с лучшими фабриками и поставщиками',         image: null,     alt: 'Партнёрство'      },
					{ title: 'Гарантия качества', description: 'Гарантия до 5 лет на мебель и полное сопровождение заказа', image: null,       alt: 'Гарантия качества' },
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

<section class="relative overflow-hidden bg-slate-900 py-24 sm:py-32 font-sans select-none">
	<!-- Декоративные фоновые круги -->
	<div class="absolute -left-32 -top-32 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl"></div>
	<div class="absolute -right-32 -bottom-32 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl"></div>

	<div class="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
			
			<!-- Левая колонка: Огромный логотип и блок-цитата -->
			<div class="lg:col-span-5 flex flex-col items-start text-left">
				{#if data?.logoUrl || isEditable}
					<div class="mb-10 w-32 md:w-40 hover:scale-105 transition-transform duration-300">
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
										class="w-full object-contain filter brightness-0 invert"
									/>
								{:else if isEditable}
									<div class="border border-dashed border-white/20 rounded-xl p-4 text-[10px] font-bold uppercase tracking-widest text-white/50 bg-white/5 backdrop-blur-md">
										Логотип
									</div>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				{/if}

				<!-- Премиальный блок цитаты -->
				<div class="relative p-8 rounded-3xl border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl">
					<div class="absolute -left-4 -top-6 text-6xl text-sky-500/20 font-serif leading-none select-none">“</div>
					<blockquote class="text-base md:text-lg font-medium leading-relaxed text-slate-200">
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
						<span class="w-8 h-px bg-gradient-to-r from-sky-400 to-indigo-400"></span>
						<span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Стремление к идеалу</span>
					</div>
				</div>
			</div>

			<!-- Правая колонка: Карусель/список преимуществ -->
			<div class="lg:col-span-7 grid gap-6 sm:grid-cols-2">
				{#each cards as card, i}
					<div class="message-card-v2 group relative overflow-hidden rounded-3xl border border-white/5 bg-slate-950/30 p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-sky-500/30 hover:bg-slate-950/60 hover:-translate-y-1 hover:shadow-sky-500/5">
						<div class="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						<div class="relative flex flex-col h-full justify-between">
							<div>
								<div class="mb-5 size-16 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 group-hover:border-sky-500/30 transition-colors duration-300">
									<ImageFallback src={card.image} alt={card.alt} class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
								</div>
								<h3 class="text-base font-bold text-white group-hover:text-sky-300 transition-colors duration-300">
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
								<p class="mt-2 text-xs md:text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors duration-300">
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
							<div class="mt-4 flex items-center gap-1.5 text-slate-500 group-hover:text-sky-400 transition-colors duration-300">
								<span class="text-[10px] font-bold uppercase tracking-widest">Подробнее</span>
								<svg class="w-3.5 h-3.5 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
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
	.message-card-v2:nth-child(1) { animation-delay: 0.1s; }
	.message-card-v2:nth-child(2) { animation-delay: 0.2s; }
	.message-card-v2:nth-child(3) { animation-delay: 0.3s; }
	.message-card-v2:nth-child(4) { animation-delay: 0.4s; }

	@keyframes message-fade-in-v2 {
		from { opacity: 0; transform: translateY(20px); }
		to   { opacity: 1; transform: translateY(0);    }
	}
</style>
