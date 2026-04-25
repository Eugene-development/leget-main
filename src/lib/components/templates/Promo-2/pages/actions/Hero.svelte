<script lang="ts">
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

<section class="relative min-h-[90vh] overflow-hidden bg-surface" id="promo-hero">
	<!-- Background Image with Overlay -->
	<div class="absolute inset-0">
		<img
			src={String(data?.image ?? 'https://storage.yandexcloud.net/zovtop/bg/promosfvmwklfvmk.jpg')}
			alt={String(data?.title ?? 'Акции')}
			class="h-full w-full object-cover transition-transform duration-[2s]"
			class:scale-105={heroVisible}
		/>
		<div class="absolute inset-0 bg-linear-to-r from-white/95 via-white/75 to-white/5"></div>
		<div class="absolute inset-0 bg-linear-to-t from-white/60 via-transparent to-transparent"></div>
	</div>

	<!-- Decorative vertical accent line -->
	<div
		class="absolute top-0 left-1/2 h-full w-px bg-linear-to-b from-transparent via-secondary/10 to-transparent opacity-0"
		class:animate-fade-in={heroVisible}
		style="animation-delay: 1.2s"
	></div>

	<!-- Decorative watermark text -->
	<div
		class="pointer-events-none absolute right-0 bottom-20 hidden overflow-hidden opacity-0 select-none lg:block"
		class:animate-fade-in={heroVisible}
		style="animation-delay: 1s"
	>
		<span
			class="block text-[140px] leading-none font-light tracking-tighter text-primary/5 xl:text-[180px]"
			style="font-family: var(--font-heading);"
		>
			SALE
		</span>
	</div>

	<!-- Floating discount badge -->
	<div
		class="absolute top-1/4 right-8 hidden opacity-0 lg:flex lg:flex-col lg:items-center lg:gap-1"
		class:animate-fade-in={heroVisible}
		style="animation-delay: 1.1s"
	>
		<div
			class="flex h-24 w-24 flex-col items-center justify-center border border-secondary/30 bg-white/50 text-center shadow-soft backdrop-blur-sm"
		>
			<span class="text-[10px] tracking-[0.2em] text-secondary/70 uppercase">до</span>
			<span
				class="text-3xl leading-none font-light text-secondary"
				style="font-family: var(--font-heading);"
			>
				<EditableField
					fieldKey="Hero.discountBadge"
					label="Бейдж скидки"
					value={String(data?.discountBadge ?? '−30%')}
					{isEditable}
					onSave={(v) => saveField('discountBadge', v)}
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>
			<span class="mt-0.5 text-[9px] tracking-[0.15em] text-muted uppercase">скидка</span>
		</div>
	</div>

	<!-- Content -->
	<div class="relative z-10 flex min-h-[90vh] items-center pt-40 pb-32">
		<div class="mx-auto w-full max-w-screen-xl px-6 xl:px-1">
			<div class="max-w-2xl">
				<!-- Label -->
				<div
					class="mb-6 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.3s"
				>
					<span
						class="inline-flex items-center gap-2 border border-secondary/30 bg-white/70 px-4 py-2 text-[11px] tracking-[0.25em] text-secondary uppercase backdrop-blur-sm"
					>
						<EditableField
							fieldKey="Hero.label"
							label="Лейбл"
							value={String(data?.label ?? 'Специальные предложения')}
							{isEditable}
							onSave={(v) => saveField('label', v)}
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</span>
				</div>

				<!-- Heading -->
				<EditableField
					fieldKey="Hero.title"
					label="Заголовок"
					value={String(data?.title ?? 'Скидки & акции')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h1
							class="text-5xl leading-[1.1] font-light text-primary opacity-0 md:text-6xl lg:text-7xl"
							style="font-family: var(--font-heading); animation-delay: 0.5s"
							class:animate-fade-up={heroVisible}
						>
							{displayValue}
						</h1>
					{/snippet}
				</EditableField>

				<!-- Stats row -->
				<div
					class="mt-10 flex items-center gap-8 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.65s"
				>
					<div class="flex flex-col gap-1">
						<span class="text-2xl font-light text-primary" style="font-family: var(--font-heading);">
							{String(data?.statCount ?? '6+')}
						</span>
						<span class="text-xs tracking-[0.15em] text-secondary uppercase">акций сейчас</span>
					</div>
					<div class="h-8 w-px bg-border-medium"></div>
					<div class="flex flex-col gap-1">
						<span class="text-2xl font-light text-primary" style="font-family: var(--font-heading);">
							{String(data?.statDiscount ?? '−30%')}
						</span>
						<span class="text-xs tracking-[0.15em] text-secondary uppercase">макс. скидка</span>
					</div>
					<div class="hidden h-8 w-px bg-border-medium sm:block"></div>
					<div class="hidden flex-col gap-1 sm:flex">
						<span class="text-2xl font-light text-primary" style="font-family: var(--font-heading);">0 ₽</span>
						<span class="text-xs tracking-[0.15em] text-secondary uppercase">за доставку</span>
					</div>
				</div>

				<!-- Description -->
				<EditableField
					fieldKey="Hero.description"
					label="Описание"
					value={String(data?.description ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p
							class="mt-6 max-w-lg text-base leading-relaxed text-secondary opacity-0 md:text-lg"
							class:animate-fade-up={heroVisible}
							style="animation-delay: 0.7s"
						>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<!-- CTA Button -->
				<div
					class="mt-10 flex flex-wrap items-center gap-4 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.9s"
				>
					<EditableField
						fieldKey="Hero.ctaText"
						label="Текст кнопки"
						value={String(data?.ctaText ?? 'Расчёт проекта за час')}
						{isEditable}
						onSave={(v) => saveField('ctaText', v)}
					>
						{#snippet children(displayValue)}
							<a
								href={String(data?.ctaLink ?? '/contact')}
								class="group inline-flex cursor-pointer items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-inverse uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
							>
								{displayValue}
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
			<div class="h-10 w-px bg-gradient-to-b from-text-muted to-transparent"></div>
		</div>
	</div>
</section>
