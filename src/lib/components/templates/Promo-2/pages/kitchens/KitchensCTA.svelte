<script lang="ts">
	// Артикул: 2.9.5.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'KitchensCTA', updated);
		data = updated;
	}

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

<section bind:this={sectionEl} class="bg-primary px-6 py-section-sm text-center text-white xl:px-1 lg:py-section">
	<div class="mx-auto max-w-4xl opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
		<EditableField
			fieldKey="KitchensCTA.heading"
			label="Заголовок"
			value={String(data?.heading ?? 'Хотите заказать кухню?')}
			{isEditable}
			onSave={(v) => saveField('heading', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2
					class="mb-8 text-3xl font-light tracking-wide uppercase lg:text-4xl"
					style="font-family: var(--font-heading);"
				>
					{displayValue}
				</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="KitchensCTA.description"
			label="Описание"
			value={String(data?.description ?? 'Запишитесь в наши салоны для бесплатной консультации с дизайнером.')}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mb-10 max-w-2xl text-lg font-light text-white/70">
					{displayValue}
				</p>
			{/snippet}
		</EditableField>

		<a
			href={String(data?.ctaLink ?? '/contact')}
			class="group inline-flex items-center gap-2 rounded-sm border border-accent bg-accent px-8 py-4 text-sm tracking-wider text-white transition-all duration-300 hover:bg-transparent hover:text-accent"
		>
			<EditableField
				fieldKey="KitchensCTA.ctaText"
				label="Кнопка"
				value={String(data?.ctaText ?? 'Записаться в салон')}
				{isEditable}
				onSave={(v) => saveField('ctaText', v)}
			>
				{#snippet children(displayValue)}
					{displayValue}
				{/snippet}
			</EditableField>
			<svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
			</svg>
		</a>
	</div>
</section>
