<script lang="ts">
	// Артикул: 1.15.2.1 — см. docs/architecture/component-articles-map.md
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
						title: 'Корпусная мебель',
						desc: 'Сборка шкафов, комодов, стеллажей, тумб и другой корпусной мебели.',
						icon: 'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819'
					},
					{
						num: '02',
						title: 'Кухонные гарнитуры',
						desc: 'Монтаж кухонь с подключением техники, установкой мойки и столешницы.',
						icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z'
					},
					{
						num: '03',
						title: 'Встроенная мебель',
						desc: 'Установка встроенных шкафов-купе, гардеробных систем и ниш.',
						icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9'
					},
					{
						num: '04',
						title: 'Регулировка фурнитуры',
						desc: 'Настройка петель, доводчиков, направляющих для идеальной работы.',
						icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z'
					},
					{
						num: '05',
						title: 'Подключение подсветки',
						desc: 'Монтаж LED-подсветки в шкафах, витринах и на кухне.',
						icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
					},
					{
						num: '06',
						title: 'Вывоз упаковки',
						desc: 'Уборка после сборки и вывоз всей упаковки и строительного мусора.',
						icon: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'AssemblyFeatures', updated);
		data = updated;
	}

	async function saveFeature(index: number, field: string, value: string) {
		if (!editContext) return;
		const newFeatures = [...features];
		newFeatures[index] = { ...newFeatures[index], [field]: value };
		const updated = { ...data, features: newFeatures };
		await saveComponentData(editContext, 'AssemblyFeatures', updated);
		data = updated;
	}
</script>

<section class="bg-surface-raised py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="max-w-2xl">
			<EditableField
				fieldKey="AssemblyFeatures.badge"
				label="Метка"
				value={String(data?.badge ?? 'Наши услуги')}
				{isEditable}
				onSave={(v) => saveField('badge', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="text-base/7 font-semibold text-cat-6-600">{displayValue}</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="AssemblyFeatures.title"
				label="Заголовок"
				value={String(data?.title ?? 'Полный комплекс работ')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="mt-2 block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl text-pretty text-ink-900 sm:text-4xl">
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
						class="absolute top-6 right-6 text-7xl font-black text-ink-100 transition-colors duration-300 group-hover:text-cat-6-50"
					>
						{item.num}
					</div>
					<div class="relative">
						<div
							class="flex size-14 items-center justify-center rounded-2xl bg-ink-900 text-on-dark transition-all duration-300 group-hover:bg-cat-6-500"
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
							fieldKey={`AssemblyFeatures.feature_${i}_title`}
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
							fieldKey={`AssemblyFeatures.feature_${i}_desc`}
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
