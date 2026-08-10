<script lang="ts">
	// Артикул: 2.4.3.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'StylesCTA', updated);
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

<section class="border-t border-border-light bg-white py-24" bind:this={sectionEl}>
	<div class="mx-auto max-w-4xl px-4 text-center">
		<div class="opacity-0" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="StylesCTA.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Поможем с выбором')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mb-6 text-4xl text-primary md:text-5xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="StylesCTA.description"
				label="Описание"
				value={String(
					data?.description ??
						'Запишитесь на встречу с нашим дизайнером. Мы подберем идеальный стиль, материалы и фурнитуру, учитывая архитектуру вашего пространства.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mb-10 max-w-2xl text-lg font-light text-secondary">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>

			<a
				href={String(data?.ctaLink ?? '/contact')}
				class="group inline-flex items-center justify-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-sm tracking-wider text-white uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
			>
				<EditableField
					fieldKey="StylesCTA.ctaText"
					label="Кнопка"
					value={String(data?.ctaText ?? 'Записаться в салон')}
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
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
				</svg>
			</a>
		</div>
	</div>
</section>
