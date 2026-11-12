<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.4.1.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import RichText from '$lib/components/RichText.svelte';
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
	<div class="absolute inset-0">
		<ImageFallback
			imagePath={['image']}
			src={String(
				data?.image ??
					'https://storage.yandexcloud.net/leget-main/templates/promo-2/styles-hero-20261105.webp'
			)}
			alt="Интерьер кухни"
			class="h-full w-full object-cover"
		/>
	</div>

	<!-- Light Overlay -->
	<div class="pointer-events-none absolute inset-0 bg-surface-warm/25"></div>

	<div
		class="hero-glass relative isolate z-10 mx-auto max-w-4xl rounded-2xl border border-white/60 bg-white/70 p-6 opacity-0 shadow-[0_20px_60px] shadow-primary/10 backdrop-blur-xl supports-[backdrop-filter:blur(1px)]:bg-white/35 md:p-10"
		class:animate-fade-up={visible}
		style="animation-delay: 0.2s"
	>
		<div
			class="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-linear-to-br from-white/50 via-white/10 to-transparent"
			aria-hidden="true"
		></div>
		<EditableField
			fieldKey="Hero.label"
			label="Лейбл"
			value={editableText(data?.label, 'Коллекции')}
			{isEditable}
			onSave={(v) => saveField('label', v)}
		>
			{#snippet children(displayValue)}
				<span class="mb-4 block text-sm font-medium tracking-[0.2em] text-primary uppercase">
					<RichText value={displayValue} />
				</span>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="Hero.heading"
			label="Заголовок"
			value={editableText(data?.heading, 'Стили кухонь')}
			{isEditable}
			onSave={(v) => saveField('heading', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h1
					class="mb-8 text-6xl text-primary md:text-8xl"
					style="font-family: var(--font-heading);"
				>
					<RichText value={displayValue} />
				</h1>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="Hero.description"
			label="Описание"
			value={editableText(
				data?.description,
				'Откройте для себя наше портфолио. От строгой классики до минимализма.'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p
					class="mx-auto mt-8 max-w-2xl text-lg leading-relaxed font-normal text-primary md:text-xl"
				>
					<RichText value={displayValue} />
				</p>
			{/snippet}
		</EditableField>

		<div class="mt-12">
			<a
				href="#styles-grid"
				class="group inline-flex items-center justify-center gap-3 rounded-sm border border-primary bg-surface-warm px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-300 hover:bg-primary hover:text-surface-warm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
			>
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="Hero"
					path={['copy', 'stylesLinkText']}
					fallback={'Выбрать стиль'}
					label="Выбрать стиль"
					richText={false}
				/>
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
			<span class="text-xs tracking-[0.3em] text-primary uppercase"
				><ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="Hero"
					path={['copy', 'scrollHint']}
					fallback={'Вниз'}
					label="Вниз"
				/></span
			>
			<div class="h-10 w-px bg-gradient-to-b from-primary to-transparent"></div>
		</div>
	</div>
</section>

<style>
	@media (prefers-reduced-transparency: reduce) {
		.hero-glass {
			background: var(--color-surface);
			backdrop-filter: none;
		}
	}
</style>
