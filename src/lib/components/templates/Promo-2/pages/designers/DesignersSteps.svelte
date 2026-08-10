<script lang="ts">
	// Артикул: 2.13.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'DesignersSteps', updated);
		data = updated;
	}

	const defaultSteps = [
		{
			num: '01',
			title: 'Заполните заявку',
			text: 'Оставьте контактные данные и расскажите о своей деятельности. Это займёт не более 3 минут.'
		},
		{
			num: '02',
			title: 'Согласование условий',
			text: 'Менеджер свяжется с вами в течение одного рабочего дня и подберёт оптимальную программу.'
		},
		{
			num: '03',
			title: 'Подписание договора',
			text: 'Оформляем партнёрский договор: для студий — очно или через ЭДО, для фрилансеров — онлайн.'
		},
		{
			num: '04',
			title: 'Начало работы',
			text: 'Получаете доступ к личному кабинету, образцам и персональному менеджеру — и можно начинать.'
		}
	];

	const steps = $derived(
		Array.isArray(data?.steps) && (data.steps as unknown[]).length > 0
			? (data.steps as typeof defaultSteps)
			: defaultSteps
	);

	let visible = $state(false);
	let sectionEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section bind:this={sectionEl} class="py-section-sm lg:py-section" id="how-it-works-steps">
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="mb-14 opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="DesignersSteps.label"
				label="Лейбл"
				value={String(data?.label ?? 'Просто и быстро')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="DesignersSteps.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Как стать партнёром')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mt-3 text-4xl text-primary lg:text-5xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
			{#each steps as step, i}
				<div
					class="opacity-0"
					class:animate-fade-up={visible}
					style="animation-delay: {0.1 + i * 0.1}s"
				>
					<div class="mb-6 flex items-center gap-3">
						<span
							class="text-5xl leading-none font-light text-border-medium"
							style="font-family: var(--font-heading);"
						>
							{step.num}
						</span>
						{#if i < steps.length - 1}
							<div class="hidden h-px flex-1 bg-border-light lg:block"></div>
						{/if}
					</div>
					<h3 class="text-lg text-primary" style="font-family: var(--font-heading);">
						{step.title}
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-secondary">{step.text}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
