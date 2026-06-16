<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	interface Card {
		id: string;
		title: string;
		description: string;
		badge: string;
		icon: string;
		enabled?: boolean;
	}

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const defaultCards: Card[] = [
		{
			id: 'repeat',
			title: 'Особое предложение',
			description: 'Если вы приобретаете мебель повторно, то для вас будет особое предложение в виде скидки или подарка.',
			badge: 'Для постоянных клиентов',
			icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z'
		},
		{
			id: 'bulk',
			title: 'Скидки за большой заказ',
			description: 'Если вы заказываете несколько позиций мебели, то мы обязательно согласуем вам дополнительную скидку.',
			badge: 'Скидка',
			icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z'
		},
		{
			id: 'taxi',
			title: 'Такси до дома',
			description: 'После оформления договора вызовем вам такси в пределах города за счёт нашей компании.',
			badge: 'Бесплатно',
			icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12'
		},
		{
			id: 'sink',
			title: 'Каменная мойка в подарок',
			description: 'При заказе кухонного гарнитура дарим стильную и долговечную мойку из искусственного камня в цвет выбранной столешницы.',
			badge: 'Подарок',
			icon: 'M2.25 12c0-3.578 2.893-6.5 6.45-6.5h6.6c3.557 0 6.45 2.922 6.45 6.5m-19.5 0h19.5M2.25 12v6a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-6'
		},
		{
			id: 'delivery',
			title: 'Доставка и подъём',
			description: 'Вам не придется думать о транспортировке: мы бережно доставим готовую мебель и бесплатно поднимем ее прямо в вашу квартиру.',
			badge: 'Бесплатно',
			icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75'
		}
	];

	let localCards = $state<Card[]>([]);

	function mergeCards(propsCards: any[] | undefined): Card[] {
		if (!Array.isArray(propsCards) || propsCards.length === 0) {
			return defaultCards;
		}

		const savedMap = new Map<string, Card>();
		propsCards.forEach((card: any) => {
			let id = card.id;
			if (!id) {
				const matchedDefault = defaultCards.find((d) => d.title === card.title);
				id = matchedDefault ? matchedDefault.id : card.title;
			}
			savedMap.set(id, { ...card, id });
		});

		const result: Card[] = [];
		savedMap.forEach((card) => {
			result.push(card);
		});

		defaultCards.forEach((defaultCard) => {
			const hasSaved = savedMap.has(defaultCard.id) || 
				Array.from(savedMap.values()).some((s) => s.title === defaultCard.title);
			
			if (!hasSaved) {
				result.push({
					...defaultCard,
					enabled: false
				});
			}
		});

		return result;
	}

	$effect(() => {
		const merged = mergeCards(data?.cards as any[] | undefined);
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
			await saveComponentData(editContext, 'ActionsCardsExtra', updatedData);
		} catch (err) {
			console.error("Не удалось сохранить карточки:", err);
		}
	}

	async function updateCardField(index: number, field: keyof Card, value: any) {
		localCards[index] = { ...localCards[index], [field]: value };
		const updatedData = { ...data, cards: $state.snapshot(localCards) };
		data = updatedData;
		if (!editContext) return;
		try {
			await saveComponentData(editContext, 'ActionsCardsExtra', updatedData);
		} catch (err) {
			console.error("Не удалось сохранить карточки:", err);
		}
	}

	const hasVisibleCards = $derived(
		isEditable || localCards.some((c) => c.enabled !== false)
	);
</script>

{#if hasVisibleCards}
	<section class="bg-gray-50 py-24 sm:py-32">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each localCards as card, i}
					{#if isEditable || card.enabled !== false}
						<div
							class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-amber-500 {isEditable && card.enabled === false ? 'grayscale contrast-75 brightness-95 opacity-60' : ''}"
						>
							<div
								class="absolute -right-4 -top-4 size-24 rounded-full bg-amber-500/10 transition duration-300 group-hover:scale-150"
							></div>
							<div class="relative">
								{#if isEditable}
									<div class="absolute top-0 right-0 z-10 flex items-center">
										<label class="inline-flex items-center gap-1.5 cursor-pointer bg-gray-50/95 backdrop-blur px-2.5 py-1 rounded-full border border-gray-100 shadow-sm hover:bg-gray-100 transition duration-200">
											<input
												type="checkbox"
												checked={card.enabled !== false}
												onchange={(e) => toggleCard(i, e.currentTarget.checked)}
												class="sr-only peer"
											/>
											<div
												class="relative w-7 h-4 bg-gray-200 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"
											></div>
											<span class="text-[10px] font-bold tracking-wider uppercase text-gray-500 select-none">
												{card.enabled !== false ? 'Вкл' : 'Выкл'}
											</span>
										</label>
									</div>
								{/if}

								<div
									class="flex size-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30"
								>
									<svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
										<path stroke-linecap="round" stroke-linejoin="round" d={card.icon} />
									</svg>
								</div>

								<EditableField
									fieldKey="ActionsCardsExtra.cards.{i}.title"
									label="Заголовок карточки"
									value={card.title}
									{isEditable}
									onSave={async (v) => {
										await updateCardField(i, 'title', v);
									}}
									class="mt-6 block"
								>
									{#snippet children(displayValue)}
										<h3 class="mt-6 text-xl font-semibold text-gray-900">{displayValue}</h3>
									{/snippet}
								</EditableField>

								<EditableField
									fieldKey="ActionsCardsExtra.cards.{i}.description"
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
										<p class="mt-3 text-base/7 text-gray-600">{displayValue}</p>
									{/snippet}
								</EditableField>

								<div class="mt-6">
									<EditableField
										fieldKey="ActionsCardsExtra.cards.{i}.badge"
										label="Бейдж"
										value={card.badge}
										{isEditable}
										onSave={async (v) => {
											await updateCardField(i, 'badge', v);
										}}
										class="inline-block"
									>
										{#snippet children(displayValue)}
											<span class="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
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
