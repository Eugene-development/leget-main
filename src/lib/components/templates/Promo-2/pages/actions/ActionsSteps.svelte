<script lang="ts">
	// Артикул: 2.8.5.1 — см. docs/architecture/component-articles-map.md
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

	async function saveSteps(updated: typeof defaultSteps) {
		if (!editContext) return;
		const updatedData = { ...data, steps: updated };
		await saveComponentData(editContext, 'ActionsSteps', updatedData);
		data = updatedData;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	const defaultSteps = [
		{
			num: '01',
			title: 'Выберите акцию',
			text: 'Изучите текущие предложения и выберите подходящую для вашего проекта. Позвоните нам или запишитесь онлайн.'
		},
		{
			num: '02',
			title: 'Получите консультацию',
			text: 'Наш дизайнер приедет к вам и разработает проект с учётом всех пожеланий. Бесплатно и в удобное время.'
		},
		{
			num: '03',
			title: 'Оформите заказ',
			text: 'Подпишите договор, и мы приступим к производству. Гарантированная цена, никаких скрытых доплат.'
		}
	];

	const steps = $derived(
		Array.isArray(data?.steps) && (data.steps as unknown[]).length > 0
			? (data.steps as typeof defaultSteps)
			: defaultSteps
	);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.2 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section
	class="relative -mt-12 bg-surface-warm pt-28 pb-section-sm lg:-mt-20 lg:pt-40 lg:pb-section"
	bind:this={sectionEl}
>
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<!-- Header -->
		<div
			class="mb-16 text-center opacity-0 transition-all duration-700"
			class:animate-fade-up={visible}
		>
			<EditableField
				fieldKey="ActionsSteps.label"
				label="Лейбл"
				value={String(data?.label ?? 'Просто')}
				{isEditable}
				onSave={async (v) => {
					if (!editContext) return;
					const updated = { ...data, label: v };
					await saveComponentData(editContext, 'ActionsSteps', updated);
					data = updated;
				}}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ActionsSteps.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Как получить скидку')}
				{isEditable}
				onSave={async (v) => {
					if (!editContext) return;
					const updated = { ...data, heading: v };
					await saveComponentData(editContext, 'ActionsSteps', updated);
					data = updated;
				}}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mt-3 text-4xl font-light text-primary lg:text-5xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ActionsSteps.description"
				label="Описание"
				value={String(data?.description ?? 'Воспользоваться акцией легко — всего 3 шага до вашей новой мебели по выгодной цене')}
				{isEditable}
				multiline
				onSave={async (v) => {
					if (!editContext) return;
					const updated = { ...data, description: v };
					await saveComponentData(editContext, 'ActionsSteps', updated);
					data = updated;
				}}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-lg text-base leading-relaxed text-secondary">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>

		<!-- Steps -->
		<div class="grid gap-8 md:grid-cols-3">
			{#each steps as step, i}
				<div
					class="group relative flex flex-col gap-6 border border-border-light bg-white p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated lg:p-10 opacity-0"
					class:animate-fade-up={visible}
					style="animation-delay: {0.15 + i * 0.15}s"
				>
					<!-- Step number -->
					<span
						class="text-6xl font-light text-border-medium lg:text-7xl"
						style="font-family: var(--font-heading);"
					>
						{step.num}
					</span>
					<div>
						<h3
							class="text-xl font-medium text-primary transition-colors duration-300 group-hover:text-secondary"
							style="font-family: var(--font-heading);"
						>
							{step.title}
						</h3>
						<p class="mt-3 text-sm leading-relaxed text-secondary">{step.text}</p>
					</div>
					<!-- Connector arrow -->
					{#if i < steps.length - 1}
						<div
							class="absolute top-1/2 -right-4 hidden -translate-y-1/2 text-border-medium md:block"
						>
							<svg
								class="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
							</svg>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
