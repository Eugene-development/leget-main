<script lang="ts">
	// Артикул: 1.14.2.1 — см. docs/architecture/component-articles-map.md
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

	const features = $derived(
		Array.isArray(data?.features) && data.features.length > 0
			? (data.features as { num: string; title: string; desc: string; icon: string }[])
			: [
					{
						num: '01',
						title: 'Эскизы и концепция',
						desc: 'Разработка внешнего вида мебели с учётом стиля интерьера и ваших пожеланий.',
						icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42'
					},
					{
						num: '02',
						title: '3D-модель',
						desc: 'Объёмная визуализация мебели в интерьере для согласования до производства.',
						icon: 'M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3'
					},
					{
						num: '03',
						title: 'Деталировка',
						desc: 'Полный перечень деталей с размерами, кромкой и направлением текстуры.',
						icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
					},
					{
						num: '04',
						title: 'Сборочные чертежи',
						desc: 'Схемы сборки с указанием крепежа и последовательности монтажа.',
						icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z'
					},
					{
						num: '05',
						title: 'Спецификация фурнитуры',
						desc: 'Список всей фурнитуры с артикулами: петли, направляющие, ручки, крепёж.',
						icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z'
					},
					{
						num: '06',
						title: 'Расчёт материалов',
						desc: 'Карты раскроя и расчёт необходимого количества материалов для заказа.',
						icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'FurnitureProjectFeatures', updated);
		data = updated;
	}

	async function saveFeature(index: number, field: string, value: string) {
		if (!editContext) return;
		const newFeatures = [...features];
		newFeatures[index] = { ...newFeatures[index], [field]: value };
		const updated = { ...data, features: newFeatures };
		await saveComponentData(editContext, 'FurnitureProjectFeatures', updated);
		data = updated;
	}
</script>

<section class="bg-surface-raised py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="max-w-2xl">
			<EditableField
				fieldKey="FurnitureProjectFeatures.badge"
				label="Метка"
				value={String(data?.badge ?? 'Состав проекта')}
				{isEditable}
				onSave={(v) => saveField('badge', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="text-base/7 font-semibold text-cat-8-600">{displayValue}</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="FurnitureProjectFeatures.title"
				label="Заголовок"
				value={String(data?.title ?? 'Полный комплект для производства')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="mt-2 block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl tracking-tight text-pretty text-ink-900 sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as item, i}
				<div
					class="group relative overflow-hidden rounded-3xl border border-ink-100 bg-ink-50/50 p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-surface-raised hover:shadow-2xl"
				>
					<div
						class="absolute top-6 right-6 text-7xl font-black text-ink-100 transition-colors duration-300 group-hover:text-cat-8-50"
					>
						{item.num}
					</div>
					<div class="relative">
						<div
							class="flex size-14 items-center justify-center rounded-2xl bg-ink-900 text-on-dark transition-all duration-300 group-hover:bg-cat-8-500"
						>
							<svg
								class="size-7"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
							</svg>
						</div>
						<EditableField
							fieldKey={`FurnitureProjectFeatures.feature_${i}_title`}
							label="Заголовок карточки"
							value={item.title}
							{isEditable}
							onSave={(v) => saveFeature(i, 'title', v)}
							class="mt-8 block"
						>
							{#snippet children(displayValue)}
								<h3 class="p1-title-sub text-xl text-ink-900">{displayValue}</h3>
							{/snippet}
						</EditableField>

						<EditableField
							fieldKey={`FurnitureProjectFeatures.feature_${i}_desc`}
							label="Описание карточки"
							value={item.desc}
							{isEditable}
							multiline
							onSave={(v) => saveFeature(i, 'desc', v)}
							class="mt-4 block"
						>
							{#snippet children(displayValue)}
								<p class="text-base/7 text-ink-600">{displayValue}</p>
							{/snippet}
						</EditableField>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
