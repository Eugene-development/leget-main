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
					{ num: '01', title: 'Концепция и стиль', desc: 'Мудборды, цветовые палитры, подбор материалов и общая стилистика интерьера.', icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42' },
					{ num: '02', title: 'Планировочные решения', desc: 'Обмерный план, планировка мебели, план демонтажа и монтажа перегородок.', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
					{ num: '03', title: 'Электрика и освещение', desc: 'План розеток и выключателей, схема освещения, расположение светильников.', icon: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18' }
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'DesignProjectFeatures', updated);
		data = updated;
	}

	async function saveFeature(index: number, field: string, value: string) {
		if (!editContext) return;
		const newFeatures = [...features];
		newFeatures[index] = { ...newFeatures[index], [field]: value };
		const updated = { ...data, features: newFeatures };
		await saveComponentData(editContext, 'DesignProjectFeatures', updated);
		data = updated;
	}
</script>

<section class="bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="max-w-2xl">
			<EditableField
				fieldKey="DesignProjectFeatures.badge"
				label="Метка"
				value={String(data?.badge ?? 'Состав проекта')}
				{isEditable}
				onSave={(v) => saveField('badge', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="text-base/7 font-bold uppercase tracking-widest text-emerald-600">{displayValue}</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="DesignProjectFeatures.title"
				label="Заголовок"
				value={String(data?.title ?? 'Полный комплект документации')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-pretty text-4xl font-black tracking-tight text-slate-900 sm:text-5xl leading-tight">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as item, i}
				<div class="group relative bg-slate-50/50 rounded-[2.5rem] p-10 transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2 border border-slate-100">
					<div class="absolute top-8 right-8 text-6xl font-black text-slate-100 group-hover:text-emerald-50">{item.num}</div>
					<div class="relative">
						<div class="flex size-16 items-center justify-center rounded-2xl bg-slate-900 text-white transition-all duration-500 group-hover:bg-emerald-500 shadow-xl shadow-slate-900/10">
							<svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
							</svg>
						</div>
						<EditableField
							fieldKey={`DesignProjectFeatures.feature_${i}_title`}
							label="Заголовок карточки"
							value={item.title}
							{isEditable}
							onSave={(v) => saveFeature(i, 'title', v)}
							class="mt-10 block"
						>
							{#snippet children(displayValue)}
								<h3 class="text-2xl font-black text-slate-900 leading-tight">{displayValue}</h3>
							{/snippet}
						</EditableField>

						<EditableField
							fieldKey={`DesignProjectFeatures.feature_${i}_desc`}
							label="Описание карточки"
							value={item.desc}
							{isEditable}
							multiline
							onSave={(v) => saveFeature(i, 'desc', v)}
							class="mt-4 block"
						>
							{#snippet children(displayValue)}
								<p class="text-base/7 text-slate-600 font-medium">{displayValue}</p>
							{/snippet}
						</EditableField>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
