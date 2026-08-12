<script lang="ts">
	// Артикул: 2.6.2.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'FurnitureIntro', updated);
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

<section
	class="relative bg-white py-section-sm lg:py-section"
	id="intro-section"
	bind:this={sectionEl}
>
	<div class="mx-auto max-w-screen-xl px-6 text-center xl:px-1">
		<div class="opacity-0" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="FurnitureIntro.eyebrow"
				label="Надпись"
				value={String(data?.eyebrow ?? 'Качество в деталях')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="FurnitureIntro.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Надежность, которую вы чувствуете каждый день')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mx-auto mt-6 max-w-3xl text-3xl text-primary lg:text-5xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="FurnitureIntro.description"
				label="Описание"
				value={String(
					data?.description ??
						'Фурнитура — это невидимое сердце любой мебели. От нее зависит, насколько плавно будут открываться дверцы, как тихо будут закрываться ящики и сколько лет мебель прослужит без единого скрипа.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-secondary">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
