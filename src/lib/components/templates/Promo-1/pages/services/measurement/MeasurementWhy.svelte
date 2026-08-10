<script lang="ts">
	// Артикул: 1.13.3.1 — см. docs/architecture/component-articles-map.md
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

	const reasons = $derived(
		Array.isArray(data?.reasons) && data.reasons.length > 0
			? (data.reasons as { num: string; title: string; desc: string }[])
			: [
					{
						num: '01',
						title: 'Точность до миллиметра',
						desc: 'Используем лазерное оборудование для максимальной точности измерений'
					},
					{
						num: '02',
						title: 'Учёт всех нюансов',
						desc: 'Фиксируем коммуникации, неровности стен и все особенности помещения'
					},
					{
						num: '03',
						title: 'Готовый обмерный план',
						desc: 'Получаете оформленный чертёж для дальнейшей работы над проектом'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MeasurementWhy', updated);
		data = updated;
	}

	async function saveReason(index: number, field: string, value: string) {
		if (!editContext) return;
		const newReasons = [...reasons];
		newReasons[index] = { ...newReasons[index], [field]: value };
		const updated = { ...data, reasons: newReasons };
		await saveComponentData(editContext, 'MeasurementWhy', updated);
		data = updated;
	}
</script>

<section class="bg-ink-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid items-center gap-16 lg:grid-cols-2">
			<!-- Изображение с геометрией -->
			<div class="relative">
				<div
					class="absolute -right-6 -bottom-6 size-48 rounded-[2.5rem] bg-cat-3-500 lg:size-64"
				></div>
				<div class="absolute -top-4 -left-4 size-32 rounded-full bg-cat-3-500/30 blur-2xl"></div>
				<div
					class="relative overflow-hidden rounded-[2.5rem] border border-on-dark/20 shadow-2xl transition duration-500 hover:scale-105"
				>
					<img
						loading="lazy"
						src={String(
							data?.imageUrl ??
								'https://storage.yandexcloud.net/leget-main/templates/promo-1/measurement_process.png'
						)}
						alt="Замер помещения"
						class="aspect-square w-full object-cover"
					/>
				</div>
			</div>

			<!-- Преимущества -->
			<div>
				<EditableField
					fieldKey="MeasurementWhy.title"
					label="Заголовок"
					value={String(data?.title ?? 'Зачем нужен профессиональный замер?')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="text-4xl leading-tight tracking-tight text-pretty text-ink-900 sm:text-5xl">
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<dl class="mt-12 space-y-10">
					{#each reasons as item, i}
						<div class="group flex gap-8">
							<dt
								class="text-5xl font-black text-cat-3-500/20 transition-colors duration-300 group-hover:text-cat-3-500"
							>
								{item.num}
							</dt>
							<dd class="pt-1">
								<EditableField
									fieldKey={`MeasurementWhy.reason_${i}_title`}
									label="Заголовок преимущества"
									value={item.title}
									{isEditable}
									onSave={(v) => saveReason(i, 'title', v)}
									class="block"
								>
									{#snippet children(displayValue)}
										<p class="text-xl font-bold text-ink-900">{displayValue}</p>
									{/snippet}
								</EditableField>

								<EditableField
									fieldKey={`MeasurementWhy.reason_${i}_desc`}
									label="Описание преимущества"
									value={item.desc}
									{isEditable}
									multiline
									onSave={(v) => saveReason(i, 'desc', v)}
									class="mt-2 block"
								>
									{#snippet children(displayValue)}
										<p class="text-base/7 font-medium text-ink-600">
											{displayValue}
										</p>
									{/snippet}
								</EditableField>
							</dd>
						</div>
					{/each}
				</dl>
			</div>
		</div>
	</div>
</section>
