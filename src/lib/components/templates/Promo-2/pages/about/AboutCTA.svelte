<script lang="ts">
	// Артикул: 2.2.7.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'AboutCTA', updated);
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
	class="relative overflow-hidden bg-primary py-section-sm lg:py-section"
	bind:this={sectionEl}
>
	<!-- Decorative Elements -->
	<div class="absolute top-0 left-0 h-32 w-32 border border-white/5 lg:h-64 lg:w-64"></div>
	<div class="absolute right-0 bottom-0 h-48 w-48 border border-white/5 lg:h-80 lg:w-80"></div>

	<div class="relative mx-auto max-w-3xl px-6 text-center xl:px-1">
		<div class="opacity-0" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="AboutCTA.eyebrow"
				label="Надпись"
				value={String(data?.eyebrow ?? 'Бесплатная услуга')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-accent uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="AboutCTA.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Закажите дизайн-проект')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mt-4 text-4xl font-light text-white lg:text-6xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="AboutCTA.description"
				label="Описание"
				value={String(data?.description ?? 'Запишитесь на бесплатную консультацию. Наш дизайнер поможет подобрать идеальное решение.')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/60">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>

			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a
					href={String(data?.ctaLink ?? '/contact')}
					class="group inline-flex items-center gap-3 rounded-sm border border-accent bg-accent px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-500 hover:border-accent-light hover:bg-accent-light"
				>
					<EditableField
						fieldKey="AboutCTA.ctaText"
						label="Кнопка"
						value={String(data?.ctaText ?? 'Заказать дизайн-проект')}
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
			</div>
		</div>
	</div>
</section>
