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
		await saveComponentData(editContext, 'WardrobesCTA', updated);
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

<section bind:this={sectionEl} class="border-t border-border-light bg-surface-warm px-6 py-section-sm xl:px-1 lg:py-section">
	<div class="mx-auto max-w-4xl text-center opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
		<EditableField
			fieldKey="WardrobesCTA.heading"
			label="Заголовок"
			value={String(data?.heading ?? 'Закажите расчет стоимости')}
			{isEditable}
			onSave={(v) => saveField('heading', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2
					class="mb-8 text-3xl font-light tracking-wide text-primary lg:text-5xl"
					style="font-family: var(--font-heading);"
				>
					{displayValue}
				</h2>
			{/snippet}
		</EditableField>

		<a
			href={String(data?.ctaLink ?? '/contact')}
			class="group inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:bg-transparent hover:text-primary"
		>
			<EditableField
				fieldKey="WardrobesCTA.ctaText"
				label="Кнопка"
				value={String(data?.ctaText ?? 'Запись в салон')}
				{isEditable}
				onSave={(v) => saveField('ctaText', v)}
			>
				{#snippet children(displayValue)}
					{displayValue}
				{/snippet}
			</EditableField>
			<svg
				class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
			</svg>
		</a>
	</div>
</section>
