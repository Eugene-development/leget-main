<script lang="ts">
	// Артикул: 3.9.1.1 — см. docs/architecture/component-articles-map.md
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

	const defaultMiniFeatures = [
		{ label: 'Замер бесплатно' },
		{ label: 'Гарантия 5 лет' },
		{ label: 'Рассрочка 0%' }
	];

	const miniFeatures = $derived(
		Array.isArray(data?.miniFeatures) && (data.miniFeatures as unknown[]).length > 0
			? (data.miniFeatures as typeof defaultMiniFeatures)
			: defaultMiniFeatures
	);
</script>

<section class="relative flex min-h-screen items-center overflow-hidden">
	<!-- Background -->
	<div class="absolute inset-0">
		<img
			src={String(data?.bgImage ?? 'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg')}
			alt={String(data?.title ?? 'Мебель на заказ')}
			class="size-full object-cover"
		/>
		<div class="absolute inset-0 bg-linear-to-r from-surface-900 via-surface-900/85 to-surface-900/40"></div>
		<div class="absolute inset-0 bg-linear-to-t from-surface-900 via-transparent to-surface-900/30"></div>
	</div>

	<!-- Gold grid pattern -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 60px 60px;"
	></div>

	<div class="relative z-10 px-10 pt-40 pb-24 lg:px-24 lg:pt-48 lg:pb-32 xl:px-32">
		<!-- Tag -->
		<div class="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/5 px-4 py-1.5">
			<span class="size-2 rounded-full bg-accent-500"></span>
			<EditableField
				fieldKey="Hero.badge"
				label="Тег"
				value={String(data?.badge ?? 'Специальное предложение')}
				{isEditable}
				onSave={(v) => saveField('badge', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-xs font-semibold tracking-wider text-accent-500 uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>
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
				<h1 class="font-display text-5xl leading-tight font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<!-- Subtitle -->
		<EditableField
			fieldKey="Hero.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Кухни, шкафы, гардеробные — от замера до установки за 14 дней. Рассрочка 0% и бесплатный дизайн-проект')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p class="mt-6 max-w-2xl text-lg leading-relaxed text-surface-300">{displayValue}</p>
			{/snippet}
		</EditableField>

		<!-- CTA buttons -->
		<div class="mt-10 flex flex-wrap items-center gap-4">
			<EditableField
				fieldKey="Hero.primaryButton"
				label="Кнопка 1"
				value={String(data?.primaryButton ?? 'Рассчитать стоимость')}
				{isEditable}
				onSave={(v) => saveField('primaryButton', v)}
			>
				{#snippet children(displayValue)}
					<a
						href={String(data?.primaryHref ?? '/contacts')}
						class="group inline-flex items-center gap-3 rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30"
					>
						{displayValue}
						<svg viewBox="0 0 20 20" class="size-4 fill-current transition-transform duration-300 group-hover:translate-x-1">
							<path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
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
						class="inline-flex items-center gap-2 rounded-xl border border-surface-500 px-8 py-4 text-sm font-semibold tracking-wide text-surface-200 transition-all duration-300 hover:border-surface-300 hover:text-white"
					>
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
						</svg>
						{displayValue}
					</a>
				{/snippet}
			</EditableField>
		</div>

		<!-- Mini features row -->
		<div class="mt-16 flex flex-wrap gap-8 border-t border-surface-700/50 pt-8">
			{#each miniFeatures as feat}
				<div class="flex items-center gap-2">
					<div class="flex size-5 items-center justify-center rounded-full bg-accent-500/15">
						<svg class="size-3 text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
							<polyline points="20 6 9 17 4 12"/>
						</svg>
					</div>
					<span class="text-sm text-surface-300">{feat.label}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
		<div class="flex flex-col items-center gap-2">
			<span class="text-[10px] tracking-[0.2em] text-surface-300 uppercase">Скролл</span>
			<div class="flex h-10 w-6 items-start justify-center rounded-full border border-surface-300/50 p-1.5">
				<div class="size-1.5 animate-bounce rounded-full bg-accent-500"></div>
			</div>
		</div>
	</div>
</section>
