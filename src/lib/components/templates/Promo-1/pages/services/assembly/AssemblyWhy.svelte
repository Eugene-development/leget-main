<script lang="ts">
	// Артикул: 1.15.3.1 — см. docs/architecture/component-articles-map.md
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
						title: 'Опытные мастера',
						desc: 'Сборщики с опытом работы от 5 лет, знающие все нюансы'
					},
					{
						num: '02',
						title: 'Профессиональный инструмент',
						desc: 'Работаем качественным инструментом для идеального результата'
					},
					{
						num: '03',
						title: 'Гарантия на работы',
						desc: 'Даём гарантию на все выполненные работы по сборке'
					}
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'AssemblyWhy', updated);
		data = updated;
	}

	async function saveReason(index: number, field: string, value: string) {
		if (!editContext) return;
		const newReasons = [...reasons];
		newReasons[index] = { ...newReasons[index], [field]: value };
		const updated = { ...data, reasons: newReasons };
		await saveComponentData(editContext, 'AssemblyWhy', updated);
		data = updated;
	}
</script>

<section class="bg-ink-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid items-center gap-16 lg:grid-cols-2">
			<!-- Изображение с геометрией -->
			<div class="relative">
				<div
					class="absolute -right-6 -bottom-6 size-48 rounded-[2.5rem] bg-cat-6-500 lg:size-64"
				></div>
				<div class="absolute -top-4 -left-4 size-32 rounded-full bg-cat-6-500/30 blur-2xl"></div>
				<div
					class="relative overflow-hidden rounded-[2.5rem] border border-on-dark/20 shadow-2xl transition duration-500 hover:scale-105"
				>
					<img
						loading="lazy"
						src={String(
							data?.imageUrl ??
								'https://storage.yandexcloud.net/leget-main/templates/promo-1/furniture_assembly_process.png'
						)}
						alt="Сборка мебели"
						class="aspect-square w-full object-cover"
					/>
				</div>
			</div>

			<!-- Преимущества -->
			<div>
				<EditableField
					fieldKey="AssemblyWhy.title"
					label="Заголовок"
					value={String(data?.title ?? 'Почему выбирают нас?')}
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
								class="text-5xl font-black text-cat-6-500/20 transition-colors duration-300 group-hover:text-cat-6-500"
							>
								{item.num}
							</dt>
							<dd class="pt-1">
								<EditableField
									fieldKey={`AssemblyWhy.reason_${i}_title`}
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
									fieldKey={`AssemblyWhy.reason_${i}_desc`}
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
