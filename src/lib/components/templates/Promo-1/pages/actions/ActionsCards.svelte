<script lang="ts">
	// Артикул: 1.4.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	// Дефолты и слияние переехали в общий модуль: тот же список читает полоса
	// акций (layout/PromoStrip), и разойтись они не вправе.
	import { mergeActionCards, type ActionCard } from './actionCards';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Тема блока: нейтральная палитра идёт из семантических классов p1-*,
	// акценты (красный/янтарный) от темы не зависят.
	const isLight = $derived(isLightBlock(data, 'light'));

	// Начальное значение считаем ПРИ ИНИЦИАЛИЗАЦИИ, а не только в $effect: на сервере
	// эффекты не выполняются, и с пустым localCards hasVisibleCards давал false —
	// вся секция выпадала из SSR-разметки. $effect ниже оставлен для синхронизации
	// с обновлённым пропсом (например, invalidateAll после сброса блока).
	// svelte-ignore state_referenced_locally — начальный SSR-снимок намеренный.
	let localCards = $state<ActionCard[]>(mergeActionCards(data?.cards));

	$effect(() => {
		const merged = mergeActionCards(data?.cards);
		if (JSON.stringify(localCards) !== JSON.stringify(merged)) {
			localCards = JSON.parse(JSON.stringify(merged));
		}
	});

	async function toggleCard(index: number, enabled: boolean) {
		localCards[index] = { ...localCards[index], enabled };
		const updatedData = { ...data, cards: $state.snapshot(localCards) };
		data = updatedData;
		if (!editContext) return;
		try {
			await saveComponentData(editContext, 'ActionsCards', updatedData);
		} catch (err) {
			console.error('Не удалось сохранить карточки:', err);
		}
	}

	async function updateCardField(index: number, field: keyof ActionCard, value: any) {
		localCards[index] = { ...localCards[index], [field]: value };
		const updatedData = { ...data, cards: $state.snapshot(localCards) };
		data = updatedData;
		if (!editContext) return;
		try {
			await saveComponentData(editContext, 'ActionsCards', updatedData);
		} catch (err) {
			console.error('Не удалось сохранить карточки:', err);
		}
	}

	const hasVisibleCards = $derived(isEditable || localCards.some((c) => c.enabled !== false));
</script>

{#if hasVisibleCards}
	<section class="p1-surface relative py-section-sm" data-p1-theme={isLight ? 'light' : 'dark'}>
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each localCards as card, i}
					{#if isEditable || card.enabled !== false}
						<div
							class="p1-card group relative overflow-hidden rounded-2xl border p-8 transition duration-300 hover:-translate-y-2 hover:border-brand-500 {isEditable &&
							card.enabled === false
								? 'opacity-60 brightness-95 contrast-75 grayscale'
								: ''}"
						>
							<div
								class="absolute -top-4 -right-4 size-24 rounded-full bg-brand-500/10 transition duration-300 group-hover:scale-150"
							></div>
							<div class="relative">
								{#if isEditable}
									<div class="absolute top-0 right-0 z-10 flex items-center">
										<label
											class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-100 bg-ink-50/95 px-2.5 py-1 shadow-sm backdrop-blur transition duration-200 hover:bg-ink-100"
										>
											<input
												type="checkbox"
												checked={card.enabled !== false}
												onchange={(e) => toggleCard(i, e.currentTarget.checked)}
												class="peer sr-only"
											/>
											<div
												class="peer relative h-4 w-7 rounded-full bg-ink-200 peer-checked:bg-brand-500 peer-focus-visible:ring-2 peer-focus-visible:ring-link-600 peer-focus-visible:ring-offset-2 after:absolute after:start-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-ink-300 after:bg-surface-raised after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-on-dark"
											></div>
											<span
												class="p1-muted text-[10px] font-bold tracking-wider uppercase select-none"
											>
												{card.enabled !== false ? 'Вкл' : 'Выкл'}
											</span>
										</label>
									</div>
								{/if}

								<div
									class="flex size-14 items-center justify-center rounded-2xl bg-brand-500 text-on-accent shadow-lg shadow-brand-500/30"
								>
									<svg
										class="size-7"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d={card.icon} />
									</svg>
								</div>

								<EditableField
									fieldKey="ActionsCards.cards.{i}.title"
									label="Заголовок карточки"
									value={card.title}
									{isEditable}
									onSave={async (v) => {
										await updateCardField(i, 'title', v);
									}}
									class="mt-6 block"
								>
									{#snippet children(displayValue)}
										<h3 class="p1-title p1-title-sub mt-6 text-xl">{displayValue}</h3>
									{/snippet}
								</EditableField>

								<EditableField
									fieldKey="ActionsCards.cards.{i}.description"
									label="Описание"
									value={card.description}
									{isEditable}
									multiline
									onSave={async (v) => {
										await updateCardField(i, 'description', v);
									}}
									class="mt-3 block"
								>
									{#snippet children(displayValue)}
										<p class="p1-body mt-3 text-base/7">{displayValue}</p>
									{/snippet}
								</EditableField>

								<div class="mt-6">
									<EditableField
										fieldKey="ActionsCards.cards.{i}.badge"
										label="Бейдж"
										value={card.badge}
										{isEditable}
										onSave={async (v) => {
											await updateCardField(i, 'badge', v);
										}}
										class="inline-block"
									>
										{#snippet children(displayValue)}
											<span
												class="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700"
											>
												{displayValue}
											</span>
										{/snippet}
									</EditableField>
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</section>
{/if}
