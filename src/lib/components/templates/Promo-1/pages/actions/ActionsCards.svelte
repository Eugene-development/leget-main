<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	interface Card {
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
			title: 'Консультация дизайнера',
			description:
				'Наш специалист бесплатно приедет к вам на объект в пределах города и даст подробную консультацию.',
			badge: 'Бесплатно',
			icon: 'M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155'
		},
		{
			title: 'Замер помещения',
			description:
				'Осуществим замер с указанием углов, розеток и вывода воды. Его стоимость вычтем из договора.',
			badge: 'В счёт договора',
			icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15'
		},
		{
			title: 'Установка техники',
			description:
				'При приобретении у нас бытовой техники мы подключим её к коммуникациям за счёт компании.',
			badge: 'Бесплатно',
			icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z'
		},
		{
			title: 'Дизайн-проект',
			description:
				'Дизайнер бесплатно составит проект мебели в соответствии с замером и вашими пожеланиями.',
			badge: 'Бесплатно',
			icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42'
		},
		{
			title: 'Техника в подарок',
			description:
				'Предложим вам в подарок каждую пятую позицию бытовой техники, приобретённую у нас с мебелью.',
			badge: 'Подарок',
			icon: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
		},
		{
			title: 'Сборка мебели',
			description: 'Осуществим сборку нашими квалифицированными специалистами и оплатим их работу.',
			badge: 'Бесплатно',
			icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9'
		}
	];

	let localCards = $state<Card[]>([]);

	$effect(() => {
		const cardsFromProps =
			Array.isArray(data?.cards) && (data.cards as unknown[]).length > 0
				? (data.cards as Card[])
				: defaultCards;

		if (JSON.stringify(localCards) !== JSON.stringify(cardsFromProps)) {
			localCards = JSON.parse(JSON.stringify(cardsFromProps));
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

	async function updateCardField(index: number, field: keyof Card, value: any) {
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
	<section class="bg-white py-24 sm:py-24">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
				{#each localCards as card, i}
					{#if isEditable || card.enabled !== false}
						<div
							class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-red-500 {isEditable &&
							card.enabled === false
								? 'opacity-60 brightness-95 contrast-75 grayscale'
								: ''}"
						>
							<div
								class="absolute -top-4 -right-4 size-24 rounded-full bg-red-500/10 transition duration-300 group-hover:scale-150"
							></div>
							<div class="relative">
								{#if isEditable}
									<div class="absolute top-0 right-0 z-10 flex items-center">
										<label
											class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-100 bg-gray-50/95 px-2.5 py-1 shadow-sm backdrop-blur transition duration-200 hover:bg-gray-100"
										>
											<input
												type="checkbox"
												checked={card.enabled !== false}
												onchange={(e) => toggleCard(i, e.currentTarget.checked)}
												class="peer sr-only"
											/>
											<div
												class="peer relative h-4 w-7 rounded-full bg-gray-200 peer-checked:bg-red-500 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
											></div>
											<span
												class="text-[10px] font-bold tracking-wider text-gray-500 uppercase select-none"
											>
												{card.enabled !== false ? 'Вкл' : 'Выкл'}
											</span>
										</label>
									</div>
								{/if}

								<div
									class="flex size-14 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/30"
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
										<h3 class="mt-6 text-xl font-semibold text-gray-900">{displayValue}</h3>
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
										<p class="mt-3 text-base/7 text-gray-600">{displayValue}</p>
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
												class="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700"
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
