<script lang="ts">
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
		await saveComponentData(editContext, 'USP', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	const defaultItems = [
		{
			number: '01',
			title: 'Индивидуальный проект',
			description: 'Каждое изделие проектируется под ваши размеры и пожелания. Никаких стандартных решений'
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
	<!-- Subtle pattern -->
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232c2c2c\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="relative mx-auto max-w-7xl px-6 xl:px-1">
		<!-- Header -->
		<div class="mb-16 opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="USP.label"
				label="Лейбл"
				value={String(data?.label ?? 'Почему мы')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
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
					<h2
						class="mt-3 max-w-xl text-4xl font-light text-primary lg:text-5xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="USP.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'То, что отличает нас от конкурентов и делает сотрудничество выгодным для вас')}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mt-4 max-w-lg text-base leading-relaxed text-secondary">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<!-- Items list -->
		<div class="flex flex-col gap-0">
			{#each items as item, i}
				<div
					class="group flex gap-6 rounded-sm border-b border-border-light py-8 opacity-0 transition-colors duration-300 first:border-t hover:bg-surface-warm/50 lg:px-6 xl:px-1"
					class:animate-slide-right={visible}
					style="animation-delay: {0.1 + i * 0.12}s"
				>
					<span class="mt-0.5 shrink-0 text-xs font-medium text-accent">{item.number}</span>
					<div>
						<h3 class="text-lg font-medium text-primary transition-colors duration-300 group-hover:text-secondary">
							{item.title}
						</h3>
						<p class="mt-2 text-sm leading-relaxed text-secondary">{item.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
