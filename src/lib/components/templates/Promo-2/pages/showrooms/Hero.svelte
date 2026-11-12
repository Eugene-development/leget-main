<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.11.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { onMount } from 'svelte';
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
	bind:this={sectionEl}
	class="relative min-h-[90vh] overflow-hidden bg-surface"
	id="showrooms-hero"
>
	<!-- Background Image -->
	<div class="absolute inset-0">
		<ImageFallback
			imagePath={['image']}
			src={String(
				data?.image ??
					'https://storage.yandexcloud.net/leget-main/templates/promo-2/showrooms-hero-20261105.webp'
			)}
			alt="Интерьер салона"
			class="h-full w-full object-cover transition-transform duration-[2s] {visible
				? 'scale-105'
				: ''}"
		/>
		<div
			class="absolute inset-0 bg-linear-to-r from-primary/90 via-primary/60 to-transparent"
		></div>
	</div>

	<!-- Content -->
	<div class="relative z-10 flex min-h-[90vh] items-center py-24">
		<div class="p2-container mx-auto w-full">
			<div
				class="hero-glass relative isolate max-w-xl rounded-2xl border border-white/25 bg-primary/90 p-6 shadow-[0_20px_60px] shadow-primary/20 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter:blur(1px)]:bg-primary/45 md:p-10"
			>
				<div
					class="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-linear-to-br from-white/20 via-white/5 to-transparent"
					aria-hidden="true"
				></div>
				<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.5s">
					<EditableField
						fieldKey="Hero.title"
						label="Заголовок"
						value={editableText(data?.title, 'Наши салоны')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h1
								class="text-5xl text-white md:text-6xl lg:text-7xl"
								style="font-family: var(--font-heading);"
							>
								<RichText value={displayValue} />
							</h1>
						{/snippet}
					</EditableField>
				</div>

				<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.7s">
					<EditableField
						fieldKey="Hero.description"
						label="Описание"
						value={editableText(
							data?.description,
							'Посетите один из наших фирменных салонов. Оцените качество материалов вживую.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('description', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="mt-6 text-base leading-relaxed text-white/90 md:text-lg">
								<RichText value={displayValue} />
							</p>
						{/snippet}
					</EditableField>
				</div>

				<div class="mt-10 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.9s">
					<a
						href={String(data?.ctaLink ?? '#network-section')}
						class="group inline-flex items-center gap-3 rounded-sm border border-secondary bg-secondary px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:bg-transparent"
					>
						<EditableField
							fieldKey="Hero.ctaText"
							label="Кнопка"
							value={editableText(data?.ctaText, 'Посмотреть карту')}
							{isEditable}
							onSave={(v) => saveField('ctaText', v)}
						>
							{#snippet children(displayValue)}
								<RichText value={displayValue} />
							{/snippet}
						</EditableField>
						<svg
							class="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
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
		class:animate-fade-up={visible}
		style="animation-delay: 1.3s"
	>
		<div class="flex flex-col items-center gap-2">
			<span class="text-xs tracking-[0.3em] text-white/50 uppercase"
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
			<div class="h-10 w-px bg-gradient-to-b from-white/50 to-transparent"></div>
		</div>
	</div>
</section>

<style>
	@media (prefers-reduced-transparency: reduce) {
		.hero-glass {
			background: var(--color-primary);
			backdrop-filter: none;
		}
	}
</style>
