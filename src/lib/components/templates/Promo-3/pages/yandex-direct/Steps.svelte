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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Steps', updated);
		data = updated;
	}

	const defaultSteps = [
		{
			number: '01',
			title: 'Заявка и консультация',
			description: 'Оставьте заявку — мы перезвоним в течение 15 минут. Обсудим ваши пожелания и бюджет'
		},
		{
			number: '02',
			title: 'Бесплатный замер',
			description: 'Наш специалист приедет в удобное время, снимет точные размеры и предложит решения'
		},
		{
			number: '03',
			title: '3D дизайн-проект',
			description: 'Создадим реалистичную визуализацию вашей мебели. Вы увидите результат до начала производства'
		},
		{
			number: '04',
			title: 'Производство и монтаж',
			description: 'Изготовим мебель на собственном производстве и установим с гарантией качества'
		}
	];

	const steps = $derived(
		Array.isArray(data?.steps) && (data.steps as unknown[]).length > 0
			? (data.steps as typeof defaultSteps)
			: defaultSteps
	);
</script>

<section class="relative overflow-hidden py-24 lg:py-32">
	<div class="absolute inset-0 bg-linear-to-br from-accent-600/5 via-surface-900 to-surface-900"></div>
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 40px 40px;"
	></div>

	<div class="relative px-10 lg:px-24 xl:px-32">
		<!-- Header -->
		<div class="mb-16 text-center">
			<EditableField
				fieldKey="Steps.label"
				label="Лейбл"
				value={String(data?.label ?? 'Как мы работаем')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Steps.title"
				label="Заголовок"
				value={String(data?.title ?? '4 простых шага к вашей идеальной мебели')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="mt-3 font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Steps -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each steps as step, i}
				<div class="group relative rounded-2xl border border-surface-700/50 bg-surface-800/30 p-8 transition-all duration-500 hover:border-accent-500/20 hover:bg-surface-800/60">
					<!-- Connector arrow (desktop) -->
					{#if i < steps.length - 1}
						<div class="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 lg:block">
							<svg class="size-6 text-accent-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
							</svg>
						</div>
					{/if}

					<!-- Step number -->
					<div class="mb-6 font-display text-5xl font-bold text-accent-500/20 transition-colors duration-300 group-hover:text-accent-500/40">
						{step.number}
					</div>

					<!-- Accent dot -->
					<div class="mb-4 size-2 rounded-full bg-accent-500"></div>

					<h3 class="text-lg font-bold text-white">{step.title}</h3>
					<p class="mt-3 text-sm leading-relaxed text-surface-300">{step.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
