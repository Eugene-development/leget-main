<script lang="ts">
	// Артикул: 3.9.2.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'USP', updated);
		data = updated;
	}

	const defaultItems = [
		{
			number: '01',
			title: 'Индивидуальный проект',
			description:
				'Каждое изделие проектируется под ваши размеры и пожелания. Никаких стандартных решений'
		},
		{
			number: '02',
			title: 'Гарантия качества',
			description: 'Используем фурнитуру Hettich и Blum. Гарантия на все изделия — 5 лет'
		},
		{
			number: '03',
			title: 'Срок 14 дней',
			description: 'От замера до установки — 14 рабочих дней. Соблюдаем сроки или делаем скидку'
		},
		{
			number: '04',
			title: 'Рассрочка 0%',
			description: 'Оформляем рассрочку без переплат на срок до 24 месяцев. Первый взнос от 0%'
		}
	];

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);
</script>

<section class="relative py-24 lg:py-32">
	<!-- Subtle grid -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.02]"
		style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 60px 60px;"
	></div>

	<div class="relative px-10 lg:px-24 xl:px-32">
		<!-- Header -->
		<div class="mb-16">
			<EditableField
				fieldKey="USP.label"
				label="Лейбл"
				value={String(data?.label ?? 'Почему мы')}
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
				fieldKey="USP.title"
				label="Заголовок"
				value={String(data?.title ?? 'Уникальное торговое предложение')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="mt-3 text-4xl text-white lg:text-5xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="USP.subtitle"
				label="Подзаголовок"
				value={String(
					data?.subtitle ??
						'То, что отличает нас от конкурентов и делает сотрудничество выгодным для вас'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mt-4 max-w-2xl text-lg leading-relaxed text-surface-300">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<!-- Items grid -->
		<div class="grid grid-cols-1 gap-px bg-surface-700/30 sm:grid-cols-2 lg:grid-cols-4">
			{#each items as item, i}
				<div
					class="group relative bg-surface-900 p-8 transition-all duration-500 hover:bg-surface-800/60"
				>
					<!-- Top accent line on hover -->
					<div
						class="absolute top-0 left-0 h-px w-0 bg-linear-to-r from-accent-500 to-transparent transition-all duration-500 group-hover:w-full"
					></div>

					<div
						class="ds-numeric mb-6 text-5xl text-accent-500/20 transition-colors duration-300 group-hover:text-accent-500/40"
					>
						{item.number}
					</div>
					<h3 class="text-lg text-white">{item.title}</h3>
					<p class="mt-3 text-sm leading-relaxed text-surface-300">{item.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
