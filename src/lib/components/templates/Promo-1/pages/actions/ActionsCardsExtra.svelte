<script lang="ts">
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
		await saveComponentData(editContext, 'ActionsCardsExtra', updatedData);
		data = updatedData;
	}

	const defaultCards = [
		{
			title: 'Особое предложение',
			description: 'Если вы приобретаете мебель повторно, то для вас будет особое предложение в виде скидки или подарка.',
			badge: 'Для постоянных клиентов',
			icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z'
		},
		{
			title: 'Скидки за большой заказ',
			description: 'Если вы заказываете несколько позиций мебели, то мы обязательно согласуем вам дополнительную скидку.',
			badge: 'Скидка',
			icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z'
		},
		{
			title: 'Такси до дома',
			description: 'После оформления договора вызовем вам такси в пределах города за счёт нашей компании.',
			badge: 'Бесплатно',
			icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12'
		}
	];

	const cards = $derived(
		Array.isArray(data?.cards) && (data.cards as unknown[]).length > 0
			? (data.cards as typeof defaultCards)
			: defaultCards
	);
</script>

<section class="bg-gray-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each cards as card, i}
				<div
					class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-200 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-amber-500"
				>
					<div
						class="absolute -right-4 -top-4 size-24 rounded-full bg-amber-500/10 transition duration-300 group-hover:scale-150"
					></div>
					<div class="relative">
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
								const updated = cards.map((c, idx) => idx === i ? { ...c, title: v } : c);
								await saveCards(updated);
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
								const updated = cards.map((c, idx) => idx === i ? { ...c, description: v } : c);
								await saveCards(updated);
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
									const updated = cards.map((c, idx) => idx === i ? { ...c, badge: v } : c);
									await saveCards(updated);
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
			{/each}
		</div>
	</div>
</section>
