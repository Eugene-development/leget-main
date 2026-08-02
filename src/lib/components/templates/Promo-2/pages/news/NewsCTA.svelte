<script lang="ts">
	// Артикул: 2.3.3.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'NewsCTA', updated);
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
	class="relative overflow-hidden border-t border-border-light bg-surface-warm py-16 lg:py-20"
	bind:this={sectionEl}
>
	<div
		class="absolute top-0 right-0 h-48 w-48 translate-x-1/3 -translate-y-1/3 border border-border-medium opacity-30"
	></div>

	<div class="relative mx-auto max-w-3xl px-6 text-center xl:px-1">
		<div class="opacity-0" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="NewsCTA.eyebrow"
				label="Надпись"
				value={String(data?.eyebrow ?? 'Хотите узнавать первыми?')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="NewsCTA.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Посетите наши салоны')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mt-4 text-3xl font-light text-primary lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="NewsCTA.description"
				label="Описание"
				value={String(data?.description ?? 'Наши дизайнеры всегда в курсе последних новинок и акций.')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-md text-sm leading-relaxed text-secondary">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>

			<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
				<a
					href={String(data?.ctaLink ?? '/showrooms')}
					class="group inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-3.5 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
				>
					<EditableField
						fieldKey="NewsCTA.ctaText"
						label="Кнопка"
						value={String(data?.ctaText ?? 'Найти ближайший салон')}
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
						<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
					</svg>
				</a>
				<a
					href="/actions"
					class="inline-flex items-center gap-2 rounded-sm border border-border-medium px-8 py-3.5 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-500 hover:border-secondary hover:text-secondary"
				>
					Смотреть акции
				</a>
			</div>
		</div>
	</div>
</section>
