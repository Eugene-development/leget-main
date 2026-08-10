<script lang="ts">
	// Артикул: 2.4.1.1 — см. docs/architecture/component-articles-map.md
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

<section
	class="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden border-b border-border-light px-4 py-20 text-center sm:px-6 xl:px-1"
>
	<!-- Background Image with fixed attachment -->
	<div class="absolute inset-0 bg-cover bg-fixed bg-center" style=""></div>

	<!-- Light Overlay -->
	<div class="absolute inset-0 bg-surface-warm/90 backdrop-blur-[2px]"></div>

	<div
		class="relative z-10 mx-auto max-w-4xl opacity-0"
		class:animate-fade-up={visible}
		style="animation-delay: 0.2s"
	>
		<EditableField
			fieldKey="Hero.label"
			label="Лейбл"
			value={String(data?.label ?? 'Коллекции')}
			{isEditable}
			onSave={(v) => saveField('label', v)}
		>
			{#snippet children(displayValue)}
				<span class="mb-4 block text-sm font-medium tracking-[0.2em] text-secondary uppercase">
					{displayValue}
				</span>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="Hero.heading"
			label="Заголовок"
			value={String(data?.heading ?? 'Стили кухонь')}
			{isEditable}
			onSave={(v) => saveField('heading', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h1
					class="mb-8 text-6xl text-primary md:text-8xl"
					style="font-family: var(--font-heading);"
				>
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="Hero.description"
			label="Описание"
			value={String(
				data?.description ?? 'Откройте для себя наше портфолио. От строгой классики до минимализма.'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p
					class="mx-auto mt-8 max-w-2xl text-lg leading-relaxed font-light text-secondary md:text-xl"
				>
					{displayValue}
				</p>
			{/snippet}
		</EditableField>

		<div class="mt-12">
			<a
				href="#styles-grid"
				class="group inline-flex items-center justify-center gap-3 rounded-sm border border-border-medium bg-transparent px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-300 hover:border-secondary hover:text-secondary"
			>
				Выбрать стиль
				<svg
					class="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
			</a>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div
		class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
		class:animate-fade-in={visible}
		style="animation-delay: 1s"
	>
		<div class="flex flex-col items-center gap-2">
			<span class="text-[10px] tracking-[0.3em] text-muted uppercase">Вниз</span>
			<div class="h-10 w-px bg-gradient-to-b from-border-medium to-transparent"></div>
		</div>
	</div>
</section>
