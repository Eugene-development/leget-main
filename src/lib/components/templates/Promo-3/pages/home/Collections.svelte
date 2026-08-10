<script lang="ts">
	// Артикул: 3.1.4.1 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Collections', updated);
		data = updated;
	}

	const defaultCollections = [
		{
			name: 'Nero Marquina',
			brand: 'Kerama Marazzi',
			price: 'от 2 890 ₽/м²',
			image: null,
			tag: 'Хит продаж'
		},
		{
			name: 'Calacatta Oro',
			brand: 'Atlas Concorde',
			price: 'от 4 150 ₽/м²',
			image: null,
			tag: 'Люкс'
		},
		{ name: 'Urban Craft', brand: 'Italon', price: 'от 1 990 ₽/м²', image: null, tag: 'Новинка' },
		{ name: 'Royal Deco', brand: 'Laparet', price: 'от 3 490 ₽/м²', image: null, tag: 'Эксклюзив' },
		{
			name: 'Emerald Kitchen',
			brand: 'Cersanit',
			price: 'от 1 690 ₽/м²',
			image: null,
			tag: 'Популярное'
		},
		{ name: 'Hex Terracotta', brand: 'Estima', price: 'от 2 340 ₽/м²', image: null, tag: 'Тренд' }
	];

	const collections = $derived(
		Array.isArray(data?.collections) && (data.collections as unknown[]).length > 0
			? (data.collections as typeof defaultCollections)
			: defaultCollections
	);
</script>

<section class="relative bg-surface-800/30 py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16 text-center">
			<EditableField
				fieldKey="Collections.label"
				label="Лейбл"
				value={String(data?.label ?? 'Популярное')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase"
						>{displayValue}</span
					>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="Collections.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Бестселлеры коллекций')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="font-display mt-3 text-4xl text-white lg:text-5xl">{displayValue}</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="Collections.description"
				label="Описание"
				value={String(
					data?.description ??
						'Самые востребованные коллекции плитки, выбранные нашими клиентами и профессиональными дизайнерами'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-2xl text-surface-300">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each collections as item}
				<div
					class="group relative overflow-hidden rounded-2xl border border-surface-700/50 bg-surface-800/80 transition-all duration-500 hover:border-accent-500/20 hover:shadow-2xl hover:shadow-accent-500/5"
				>
					<div class="relative aspect-[4/3] overflow-hidden">
						<img
							loading="lazy"
							src={item.image || undefined}
							alt={item.name}
							class="size-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
						></div>
						<div class="absolute top-4 left-4">
							<span
								class="bg-highlight rounded-lg px-3 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg"
								>{item.tag}</span
							>
						</div>
					</div>
					<div class="p-5">
						<div class="text-[11px] font-medium tracking-wider text-surface-300 uppercase">
							{item.brand}
						</div>
						<h3 class="mt-1 text-lg text-white transition-colors group-hover:text-accent-500">
							{item.name}
						</h3>
						<div class="mt-3 flex items-center justify-between">
							<span class="font-display text-lg font-bold text-accent-500">{item.price}</span>
							<button
								class="flex items-center gap-2 rounded-lg border border-surface-600 bg-surface-700/50 px-4 py-2 text-xs font-medium text-surface-300 transition-all duration-300 hover:border-accent-500/40 hover:text-accent-500"
							>
								Подробнее
								<svg viewBox="0 0 20 20" class="size-3.5 fill-current"
									><path
										fill-rule="evenodd"
										d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
										clip-rule="evenodd"
									/></svg
								>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
