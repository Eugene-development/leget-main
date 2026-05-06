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
					{ num: '01', title: 'Анализ пространства', desc: 'Оценка планировки, освещения и функциональных зон. Выявление потенциала помещения.', icon: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z' },
					{ num: '02', title: 'Концепция стиля', desc: 'Подбор уникального стилистического направления, цветовой палитры и материалов.', icon: 'M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z' },
					{ num: '03', title: 'План действий', desc: 'Пошаговые экспертные рекомендации по реализации проекта с учётом вашего бюджета.', icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z' }
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ConsultationFeatures', updated);
		data = updated;
	}

	async function saveFeature(index: number, field: string, value: string) {
		if (!editContext) return;
		const newFeatures = [...features];
		newFeatures[index] = { ...newFeatures[index], [field]: value };
		const updated = { ...data, features: newFeatures };
		await saveComponentData(editContext, 'ConsultationFeatures', updated);
		data = updated;
	}
</script>

<section class="bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="max-w-2xl">
			<EditableField
				fieldKey="ConsultationFeatures.badge"
				label="Метка"
				value={String(data?.badge ?? 'Что вы получите')}
				{isEditable}
				onSave={(v) => saveField('badge', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="text-base/7 font-semibold text-sky-600">{displayValue}</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ConsultationFeatures.title"
				label="Заголовок"
				value={String(data?.title ?? 'Комплексный подход к вашему интерьеру')}
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
					<div class="absolute right-6 top-6 text-7xl font-black text-slate-100 transition-colors duration-300 group-hover:text-sky-50">{item.num}</div>
					<div class="relative">
						<div class="flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-white transition-all duration-300 group-hover:bg-sky-500">
							<svg class="size-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
							</svg>
						</div>
						<EditableField
							fieldKey={`ConsultationFeatures.feature_${i}_title`}
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
							fieldKey={`ConsultationFeatures.feature_${i}_desc`}
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
