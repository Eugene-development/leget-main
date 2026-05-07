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

	const features = $derived(
		Array.isArray(data?.features) && data.features.length > 0
			? (data.features as { num: string; title: string; desc: string; icon: string }[])
			: [
					{ 
						num: '01', 
						title: 'Габариты помещений', 
						desc: 'Точные размеры стен, высота потолков, ниши, выступы и все архитектурные особенности.', 
						icon: 'M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15' 
					},
					{ 
						num: '02', 
						title: 'Окна и двери', 
						desc: 'Размеры и расположение оконных и дверных проёмов, направление открывания.', 
						icon: 'M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M5.25 6h.008v.008H5.25V6zM7.5 6h.008v.008H7.5V6zm2.25 0h.008v.008H9.75V6z' 
					},
					{ 
						num: '03', 
						title: 'Электрика', 
						desc: 'Расположение розеток, выключателей, электрощитка и точек подключения.', 
						icon: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' 
					},
					{ 
						num: '04', 
						title: 'Вентиляция и отопление', 
						desc: 'Вентиляционные каналы, радиаторы, стояки и точки подключения климатической техники.', 
						icon: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' 
					},
					{ 
						num: '05', 
						title: 'Водоснабжение', 
						desc: 'Точки подвода воды, канализационные выводы, расположение стояков.', 
						icon: 'M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5' 
					},
					{ 
						num: '06', 
						title: 'Фотофиксация', 
						desc: 'Детальная фотосъёмка всех помещений, узлов и особенностей для работы над проектом.', 
						icon: 'M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z' 
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MeasurementFeatures', updated);
		data = updated;
	}

	async function saveFeature(index: number, field: string, value: string) {
		if (!editContext) return;
		const newFeatures = [...features];
		newFeatures[index] = { ...newFeatures[index], [field]: value };
		const updated = { ...data, features: newFeatures };
		await saveComponentData(editContext, 'MeasurementFeatures', updated);
		data = updated;
	}
</script>

<section class="bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="max-w-2xl">
			<EditableField
				fieldKey="MeasurementFeatures.badge"
				label="Метка"
				value={String(data?.badge ?? 'Что мы фиксируем')}
				{isEditable}
				onSave={(v) => saveField('badge', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="text-base/7 font-semibold text-violet-600">{displayValue}</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="MeasurementFeatures.title"
				label="Заголовок"
				value={String(data?.title ?? 'Детальный обмер помещения')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="mt-2 block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-pretty text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as item, i}
				<div class="group relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/50 p-8 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-2xl">
					<div class="absolute right-6 top-6 text-7xl font-black text-slate-100 transition-colors duration-300 group-hover:text-violet-50">{item.num}</div>
					<div class="relative">
						<div class="flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-white transition-all duration-300 group-hover:bg-violet-500">
							<svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
							</svg>
						</div>
						<EditableField
							fieldKey={`MeasurementFeatures.feature_${i}_title`}
							label="Заголовок карточки"
							value={item.title}
							{isEditable}
							onSave={(v) => saveFeature(i, 'title', v)}
							class="mt-8 block"
						>
							{#snippet children(displayValue)}
								<h3 class="text-xl font-bold text-slate-900">{displayValue}</h3>
							{/snippet}
						</EditableField>

						<EditableField
							fieldKey={`MeasurementFeatures.feature_${i}_desc`}
							label="Описание карточки"
							value={item.desc}
							{isEditable}
							multiline
							onSave={(v) => saveFeature(i, 'desc', v)}
							class="mt-4 block"
						>
							{#snippet children(displayValue)}
								<p class="text-base/7 text-slate-600">{displayValue}</p>
							{/snippet}
						</EditableField>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
