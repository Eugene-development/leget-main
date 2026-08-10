<script lang="ts">
	// Артикул: 2.3.1.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}

	let visible = $state(false);

	onMount(() => {
		visible = true;
	});
</script>

<section class="relative overflow-hidden bg-surface-warm pt-20 pb-16 lg:pt-28 lg:pb-20">
	<!-- Subtle geometric accents -->
	<div
		class="absolute top-0 right-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 border border-border-light opacity-40"
	></div>
	<div class="absolute bottom-0 left-16 h-40 w-40 border border-border-light opacity-20"></div>

	<div class="relative mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.2s">
			<EditableField
				fieldKey="Hero.label"
				label="Лейбл"
				value={String(data?.label ?? 'Мебельная фабрика')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span
						class="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] text-secondary uppercase"
					>
						<span class="h-px w-6 bg-secondary"></span>
						{displayValue}
					</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Hero.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Новости')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h1
						class="mt-4 text-5xl text-primary lg:text-6xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h1>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Hero.description"
				label="Описание"
				value={String(data?.description ?? 'События, обновления и достижения фабрики')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mt-4 max-w-lg text-base leading-relaxed text-secondary">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
