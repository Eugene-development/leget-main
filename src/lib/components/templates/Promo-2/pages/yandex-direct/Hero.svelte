<script lang="ts">
	// Артикул: 2.14.1.1 — см. docs/architecture/component-articles-map.md
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

	let heroVisible = $state(false);

	onMount(() => {
		heroVisible = true;
	});
</script>

<section class="relative min-h-[90vh] overflow-hidden bg-surface" id="yd-hero">
	<!-- Background Image -->
	<div class="absolute inset-0">
		<img
			src={String(data?.bgImage ?? 'https://storage.yandexcloud.net/zovtop/bg/hero-2.jpg')}
			alt={String(data?.title ?? 'Мебель на заказ')}
			class="h-full w-full object-cover transition-transform duration-[2s]"
			class:scale-105={heroVisible}
		/>
		<div class="absolute inset-0 bg-linear-to-r from-white/95 via-white/70 to-white/10"></div>
		<div class="absolute inset-0 bg-linear-to-t from-white/50 via-transparent to-transparent"></div>
	</div>

	<!-- Decorative watermark -->
	<div
		class="pointer-events-none absolute right-0 bottom-16 hidden overflow-hidden opacity-0 select-none lg:block"
		class:animate-fade-in={heroVisible}
		style="animation-delay: 1s"
	>
		<span
			class="block text-[160px] leading-none font-light tracking-tighter text-primary/4 xl:text-[200px]"
			style="font-family: var(--font-heading);"
		>
			ZOV
		</span>
	</div>

	<!-- Content -->
	<div class="relative z-10 flex min-h-[90vh] items-center pt-40 pb-32">
		<div class="mx-auto w-full max-w-7xl px-6 xl:px-1">
			<div class="max-w-2xl">
				<!-- Label -->
				<div
					class="mb-6 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.3s"
				>
					<span class="inline-flex items-center gap-2 border border-secondary/30 bg-white/70 px-4 py-2 text-[11px] tracking-[0.25em] text-secondary uppercase backdrop-blur-sm">
						<EditableField
							fieldKey="Hero.badge"
							label="Лейбл"
							value={String(data?.badge ?? 'Специальное предложение')}
							{isEditable}
							onSave={(v) => saveField('badge', v)}
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</span>
				</div>

				<!-- Title -->
				<EditableField
					fieldKey="Hero.title"
					label="Заголовок"
					value={String(data?.title ?? 'Мебель на заказ по вашим размерам')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h1
							class="text-4xl leading-[1.1] font-light text-primary opacity-0 md:text-5xl lg:text-6xl"
							style="font-family: var(--font-heading); animation-delay: 0.5s"
							class:animate-fade-up={heroVisible}
						>
							{displayValue}
						</h1>
					{/snippet}
				</EditableField>

				<!-- Description -->
				<div
					class="mt-8 max-w-xl bg-white/10 p-4 opacity-0 backdrop-blur-sm md:p-6"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.7s"
				>
					<EditableField
						fieldKey="Hero.subtitle"
						label="Описание"
						value={String(data?.subtitle ?? 'Кухни, шкафы, гардеробные — от замера до установки за 14 дней. Рассрочка 0% и бесплатный дизайн-проект')}
						{isEditable}
						multiline
						onSave={(v) => saveField('subtitle', v)}
					>
						{#snippet children(displayValue)}
							<p class="text-sm leading-relaxed font-light text-primary md:text-lg">
								{displayValue}
							</p>
						{/snippet}
					</EditableField>
				</div>

				<!-- Mini features -->
				<div
					class="mt-6 flex flex-wrap gap-6 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.8s"
				>
					{#each ['Замер бесплатно', 'Гарантия 5 лет', 'Рассрочка 0%'] as feat}
						<div class="flex items-center gap-2 text-xs tracking-widest text-secondary uppercase">
							<div class="h-px w-4 bg-accent"></div>
							{feat}
						</div>
					{/each}
				</div>

				<!-- CTA Buttons -->
				<div
					class="mt-10 flex flex-wrap items-center gap-4 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.9s"
				>
					<EditableField
						fieldKey="Hero.primaryButton"
						label="Кнопка 1"
						value={String(data?.primaryButton ?? 'Рассчитать стоимость')}
						{isEditable}
						onSave={(v) => saveField('primaryButton', v)}
					>
						{#snippet children(displayValue)}
							<a
								href={String(data?.primaryHref ?? '/contact')}
								class="group inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-inverse uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
							>
								{displayValue}
								<svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
								</svg>
							</a>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="Hero.secondaryButton"
						label="Кнопка 2"
						value={String(data?.secondaryButton ?? 'Позвонить')}
						{isEditable}
						onSave={(v) => saveField('secondaryButton', v)}
					>
						{#snippet children(displayValue)}
							<a
								href={String(data?.secondaryHref ?? 'tel:+70000000000')}
								class="group inline-flex items-center gap-3 rounded-sm border border-border-medium bg-white/60 px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase backdrop-blur-sm transition-all duration-500 hover:border-secondary hover:text-secondary"
							>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
								</svg>
								{displayValue}
							</a>
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
			<span class="text-[10px] tracking-[0.3em] text-muted uppercase">Листайте</span>
			<div class="h-10 w-px bg-linear-to-b from-text-muted to-transparent"></div>
		</div>
	</div>
</section>
