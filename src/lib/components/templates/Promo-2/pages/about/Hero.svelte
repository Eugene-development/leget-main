<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.2.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}

	let visible = $state(false);
	const theme = $derived(blockTheme(data));

	onMount(() => {
		visible = true;
	});
</script>

<section class="p1-surface relative min-h-[90vh] overflow-hidden" id="about-hero" data-p1-theme={theme}>
	<!-- Background Image -->
	<div class="absolute inset-0">
		<ImageFallback
			imagePath={['image']}
			src={String(
				data?.image ??
					'https://storage.yandexcloud.net/leget-main/templates/promo-2/about-factory-craftsman.webp'
			)}
			alt="Мастер мебельной фабрики за работой у станка"
			fetchpriority="high"
			class="h-full w-full object-cover object-[70%_center] transition-transform duration-[2s] md:object-center {visible
				? 'scale-105'
				: ''}"
		/>
		<div class="hero-veil pointer-events-none absolute inset-0" aria-hidden="true"></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 flex min-h-[90vh] items-center pb-24">
		<div class="p2-container mx-auto w-full">
			<div
				data-ds-surface={theme === 'light' ? 'white' : undefined}
				class="hero-glass relative isolate max-w-2xl rounded-2xl border p-6 backdrop-blur-xl md:p-10 {theme === 'light'
					? 'border-white/60 bg-white/70 shadow-[0_20px_60px] shadow-primary/10 supports-[backdrop-filter:blur(1px)]:bg-white/35'
					: 'p1-overlay p1-border'}"
			>
				{#if theme === 'light'}
					<div
						class="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-linear-to-br from-white/50 via-white/10 to-transparent"
						aria-hidden="true"
					></div>
				{/if}
				<!-- Heading -->
				<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.5s">
					<EditableField
						fieldKey="Hero.title"
						label="Заголовок"
						value={editableText(data?.title, 'От нашей фабрики для вашей семьи')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h1
								class="p1-title text-page-title"
								style="font-family: var(--font-heading);"
							>
								<RichText value={displayValue} />
							</h1>
						{/snippet}
					</EditableField>
				</div>

				<!-- Description -->
				<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.7s">
					<EditableField
						fieldKey="Hero.description"
						label="Описание"
						value={editableText(
							data?.description,
							'Наша фабрика располагает самой крупной сетью мебельных салонов. Предлагаем отличный сервис и доступные цены на мебель премиального качества.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('description', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p
								class="p1-title mt-8 max-w-lg text-prose font-medium"
							>
								<RichText value={displayValue} />
							</p>
						{/snippet}
					</EditableField>
				</div>

				<!-- CTA -->
				<div
					class="mt-10 flex flex-wrap items-center gap-4 opacity-0"
					class:animate-fade-up={visible}
					style="animation-delay: 0.9s"
				>
					<a
						href={String(data?.ctaPrimaryLink ?? '/showrooms')}
						class="group inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
					>
						<EditableField
							fieldKey="Hero.ctaPrimary"
							label="Кнопка"
							value={editableText(data?.ctaPrimary, 'Найти ближайший салон')}
							{isEditable}
							onSave={(v) => saveField('ctaPrimary', v)}
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
					</a>
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div
		class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
		class:animate-fade-in={visible}
		style="animation-delay: 1.3s"
	>
		<div class="flex flex-col items-center gap-2">
			<span class="text-xs tracking-[0.3em] text-muted uppercase"
				><ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="Hero"
					path={['copy', 'scrollHint']}
					fallback={'Листайте'}
					label="Листайте"
				/></span
			>
			<div class="h-10 w-px bg-gradient-to-b from-border-medium to-transparent"></div>
		</div>
	</div>
</section>

<style>
	.hero-veil {
		background:
			linear-gradient(
				to right,
				color-mix(in srgb, var(--p1-surface) 65%, transparent),
				color-mix(in srgb, var(--p1-surface) 35%, transparent),
				transparent
			),
			linear-gradient(to top, color-mix(in srgb, var(--p1-surface) 20%, transparent), transparent);
	}

	@media (prefers-reduced-transparency: reduce) {
		.hero-glass {
			background: var(--p1-surface);
			backdrop-filter: none;
		}
	}
</style>
