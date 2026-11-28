<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.8.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	const furniturePromotionsBackground = 'https://storage.yandexcloud.net/leget-main/templates/promo-2/actions/hero/furniture-promotions-edee6835cfb0.webp';

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

	function scrollToNextBlock(event: MouseEvent) {
		if (isEditable) return;
		const block = (event.currentTarget as HTMLElement).closest('[data-field-toolbar-scope]');
		let next = block?.nextElementSibling as HTMLElement | null;
		while (next && next.getClientRects().length === 0) next = next.nextElementSibling as HTMLElement | null;
		if (!next) return;
		// Компенсируем общий зазор якорей, сохраняя отступ под закреплённой шапкой.
		const previousMargin = next.style.scrollMarginTop;
		next.style.scrollMarginTop = '-1.5rem';
		next.scrollIntoView({
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
			block: 'start'
		});
		next.style.scrollMarginTop = previousMargin;
	}

	let heroVisible = $state(false);

	onMount(() => {
		heroVisible = true;
	});
</script>

<section class="relative min-h-[90vh] overflow-hidden bg-surface" id="promo-hero">
	<!-- Background Image with Overlay -->
	<div class="absolute inset-0">
		<ImageFallback
			imagePath={['image']}
			src={String(data?.image ?? furniturePromotionsBackground)}
			alt={editableText(data?.title, 'Акции')}
			class="h-full w-full object-cover object-top"
		/>
		<div class="absolute inset-0 bg-linear-to-r from-white/65 via-white/35 to-transparent"></div>
		<div class="absolute inset-0 bg-linear-to-t from-white/20 via-transparent to-transparent"></div>
	</div>

	<!-- Decorative vertical accent line -->
	<div
		class="absolute top-0 left-1/2 h-full w-px bg-linear-to-b from-transparent via-secondary/10 to-transparent opacity-0"
		class:animate-fade-in={heroVisible}
		style="animation-delay: 1.2s"
	></div>

	<!-- Content -->
	<div class="relative z-10 flex min-h-[90vh] items-center pt-40 pb-32 md:pt-24 md:pb-48">
		<div class="p2-container mx-auto w-full">
			<div
				data-ds-surface="white"
				class="hero-glass relative isolate max-w-xl rounded-2xl border border-white/60 bg-white/70 p-6 shadow-[0_20px_60px] shadow-primary/10 backdrop-blur-xl supports-[backdrop-filter:blur(1px)]:bg-white/35 md:p-10"
			>
				<div
					class="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-linear-to-br from-white/50 via-white/10 to-transparent"
					aria-hidden="true"
				></div>
				<!-- Heading -->
				<EditableField
					fieldKey="Hero.title"
					label="Заголовок"
					value={editableText(data?.title, 'Скидки & акции')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h1
							class="text-page-title text-primary opacity-0"
							style="font-family: var(--font-heading); animation-delay: 0.5s"
							class:animate-fade-up={heroVisible}
						>
							<RichText value={displayValue} />
						</h1>
					{/snippet}
				</EditableField>

				<!-- Description -->
				<EditableField
					fieldKey="Hero.description"
					label="Описание"
					value={editableText(
						data?.description,
						'Выберите подходящее предложение на мебель для вашего дома. Поможем разобраться в условиях акций и рассчитать стоимость вашего проекта.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p
							class="mt-6 max-w-lg text-prose font-medium text-primary opacity-0"
							class:animate-fade-up={heroVisible}
							style="animation-delay: 0.65s"
						>
							<RichText value={displayValue} />
						</p>
					{/snippet}
				</EditableField>

				<!-- Stats row -->
				<div
					class="mt-10 flex items-center gap-8 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.75s"
				>
					<div class="flex flex-col gap-1">
						<span
							class="text-2xl font-light text-primary"
							style="font-family: var(--font-heading);"
						>
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Hero"
								path={['statCount']}
								fallback={editableText(data?.statCount, '6+')}
								label="Текст"
							/>
						</span>
						<span class="text-xs tracking-[0.15em] text-secondary uppercase"
							><ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Hero"
								path={['copy', 'statCountLabel']}
								fallback={'акций сейчас'}
								label="акций сейчас"
							/></span
						>
					</div>
					<div class="h-8 w-px bg-border-medium"></div>
					<div class="flex flex-col gap-1">
						<span
							class="text-2xl font-light text-primary"
							style="font-family: var(--font-heading);"
						>
							<ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Hero"
								path={['statDiscount']}
								fallback={editableText(data?.statDiscount, '−30%')}
								label="Текст"
							/>
						</span>
						<span class="text-xs tracking-[0.15em] text-secondary uppercase"
							><ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Hero"
								path={['copy', 'statDiscountLabel']}
								fallback={'макс. скидка'}
								label="макс. скидка"
							/></span
						>
					</div>
					<div class="hidden h-8 w-px bg-border-medium sm:block"></div>
					<div class="hidden flex-col gap-1 sm:flex">
						<span class="text-2xl font-light text-primary" style="font-family: var(--font-heading);"
							><ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Hero"
								path={['copy', 'statDelivery']}
								fallback={'0 ₽'}
								label="0 ₽"
							/></span
						>
						<span class="text-xs tracking-[0.15em] text-secondary uppercase"
							><ContentText
								bind:data
								{editContext}
								{isEditable}
								componentType="Hero"
								path={['copy', 'statDeliveryLabel']}
								fallback={'за доставку'}
								label="за доставку"
							/></span
						>
					</div>
				</div>

				<!-- CTA Button -->
				<div
					class="mt-10 flex flex-wrap items-center gap-4 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.9s"
				>
					<EditableField
						fieldKey="Hero.scrollCtaText"
						label="Текст кнопки"
						value={editableText(data?.scrollCtaText, 'Подробнее')}
						{isEditable}
						onSave={(v) => saveField('scrollCtaText', v)}
					>
						{#snippet children(displayValue)}
							<button
								class="group inline-flex cursor-pointer items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-inverse uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
								type="button"
								data-goal-ignore="Навигация к следующему блоку страницы"
								onclick={scrollToNextBlock}
							>
								<RichText value={displayValue} />
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
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll Indicator -->
	<div
		class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
		class:animate-fade-in={heroVisible}
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
			<div class="h-10 w-px bg-gradient-to-b from-text-muted to-transparent"></div>
		</div>
	</div>
</section>

<style>
	@media (prefers-reduced-transparency: reduce) {
		.hero-glass {
			/* Match bg-white and the explicit white content surface, not the page canvas. */
			background: #fff;
			backdrop-filter: none;
		}
	}
</style>
