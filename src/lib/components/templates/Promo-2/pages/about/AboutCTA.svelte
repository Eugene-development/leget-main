<script lang="ts">
	import { reveal } from '$lib/components/templates/Promo-2/reveal';
	import { editableText } from '$lib/utils/editable-text';
	import { openPromo2Form } from '$lib/components/templates/Promo-2/forms/request';
	// Артикул: 2.2.7.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { blockTheme } from '$lib/utils/block-theme';
	import '../../../Promo-1/theme.css';

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
	const theme = $derived(blockTheme(data, 'dark'));

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
	class="relative overflow-hidden py-section-sm lg:py-section {theme === 'dark'
		? 'bg-primary'
		: 'p1-surface'}"
	data-p1-theme={theme}
	bind:this={sectionEl}
>
	<!-- Decorative Elements -->
	<div class="p1-border absolute top-0 left-0 h-32 w-32 border lg:h-64 lg:w-64"></div>
	<div class="p1-border absolute right-0 bottom-0 h-48 w-48 border lg:h-80 lg:w-80"></div>

	<div class="relative mx-auto max-w-3xl px-6 text-center xl:px-1">
		<div class="opacity-0" use:reveal={"animate-fade-up"}>
			<EditableField
				fieldKey="AboutCTA.eyebrow"
				label="Надпись"
				value={editableText(data?.eyebrow, 'Бесплатная услуга')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-accent uppercase"
						><RichText value={displayValue} /></span
					>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="AboutCTA.heading"
				label="Заголовок"
				value={editableText(data?.heading, 'Закажите дизайн-проект')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="p1-title mt-4 text-section-title"
						style="font-family: var(--font-heading);"
					>
						<RichText value={displayValue} />
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="AboutCTA.description"
				label="Описание"
				value={editableText(
					data?.description,
					'Запишитесь на бесплатную консультацию. Наш дизайнер поможет подобрать идеальное решение.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="p1-body mx-auto mt-6 max-w-lg text-prose">
						<RichText value={displayValue} />
					</p>
				{/snippet}
			</EditableField>

			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<button
					class="group inline-flex items-center gap-3 rounded-sm border border-accent bg-accent px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-500 hover:border-accent-light hover:bg-accent-light"
					type="button"
					data-metrika-goal="pages_about_aboutcta_open"
					data-goal-action="open"
					onclick={() => {
						if (!isEditable) openPromo2Form('design-project', '');
					}}
				>
					<EditableField
						fieldKey="AboutCTA.ctaText"
						label="Кнопка"
						value={editableText(data?.ctaText, 'Заказать дизайн-проект')}
						{isEditable}
						onSave={(v) => saveField('ctaText', v)}
					>
						{#snippet children(displayValue)}
							<RichText value={displayValue} />
						{/snippet}
					</EditableField>
					<svg
						class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
						/>
					</svg>
				</button>
			</div>
		</div>
	</div>
</section>
