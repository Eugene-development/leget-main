<script lang="ts">
	// Артикул: 2.14.4.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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

	let visible = $state(false);
	let sectionEl: HTMLElement;

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

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => { entries.forEach((e) => { if (e.isIntersecting) visible = true; }); },
			{ threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative overflow-hidden py-section-sm lg:py-section" bind:this={sectionEl}>
	<div class="mx-auto max-w-7xl px-6 xl:px-1">
		<!-- Header -->
		<div class="mb-16 opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="Steps.label"
				label="Лейбл"
				value={String(data?.label ?? 'Как мы работаем')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
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
					<h2
						class="mt-3 max-w-xl text-4xl font-light text-primary lg:text-5xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Steps grid -->
		<div class="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">
			{#each steps as step, i}
				<div
					class="group relative border-b border-border-light py-10 opacity-0 transition-colors duration-300 hover:bg-surface-warm/50 sm:border-r sm:last:border-r-0 lg:border-b-0 lg:px-8 lg:first:pl-0 lg:last:pr-0"
					class:animate-fade-up={visible}
					style="animation-delay: {0.1 + i * 0.12}s"
				>
					<!-- Step number -->
					<div
						class="mb-6 text-5xl font-light text-border-medium transition-colors duration-300 group-hover:text-accent lg:text-6xl"
						style="font-family: var(--font-heading);"
					>
						{step.number}
					</div>

					<!-- Accent line -->
					<div class="mb-4 h-px w-8 bg-accent"></div>

					<h3 class="text-base font-medium text-primary transition-colors duration-300 group-hover:text-secondary">
						{step.title}
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-secondary">
						{step.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
