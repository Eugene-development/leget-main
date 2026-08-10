<script lang="ts">
	// Артикул: 3.1.1.1 — см. docs/architecture/component-articles-map.md
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

	const defaultStats = [
		{ value: '50 +', label: 'Брендов' },
		{ value: '98%', label: 'Лояльность' },
		{ value: '15 +', label: 'Лет опыта' },
		{ value: '20 +', label: 'Городов' },
		{ value: '12к +', label: 'Артикулов' }
	];

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);
</script>

<section class="relative flex min-h-screen items-center overflow-hidden">
	<!-- Background -->
	<div class="absolute inset-0">
		<img
			src={String(data?.image ?? '')}
			alt={String(data?.title ?? 'Плитка')}
			class="size-full object-cover"
		/>
		<div
			class="absolute inset-0 bg-linear-to-r from-surface-900 via-surface-900/85 to-surface-900/40"
		></div>
		<div
			class="absolute inset-0 bg-gradient-to-t from-surface-900 via-transparent to-surface-900/30"
		></div>
	</div>

	<!-- Grid pattern overlay -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 60px 60px;"
	></div>

	<div class="relative z-10 px-10 pt-40 pb-24 lg:px-24 lg:pt-48 lg:pb-32 xl:px-32">
		<!-- Tag -->
		<div
			class="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/5 px-4 py-1.5"
		>
			<span class="size-2 rounded-full bg-accent-500"></span>
			<EditableField
				fieldKey="Hero.tag"
				label="Тег"
				value={String(data?.tag ?? 'Коллекция 2026')}
				{isEditable}
				onSave={(v) => saveField('tag', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-xs font-semibold tracking-wider text-accent-500 uppercase"
						>{displayValue}</span
					>
				{/snippet}
			</EditableField>
		</div>

		<!-- Heading -->
		<EditableField
			fieldKey="Hero.title"
			label="Заголовок"
			value={String(data?.title ?? 'Искусство плитки в каждой детали')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h1 class="font-display text-5xl text-white sm:text-6xl lg:text-7xl">
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<!-- Subtitle -->
		<EditableField
			fieldKey="Hero.subtitle"
			label="Подзаголовок"
			value={String(
				data?.subtitle ??
					'Качественная плитка из разных материалов от ведущих мировых производителей.'
			)}
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
				fieldKey="Hero.ctaPrimary"
				label="Кнопка 1"
				value={String(data?.ctaPrimary ?? 'Промокод на скидку 10%')}
				{isEditable}
				onSave={(v) => saveField('ctaPrimary', v)}
			>
				{#snippet children(displayValue)}
					<a
						href={String(data?.ctaPrimaryLink ?? '/contacts')}
						class="group inline-flex items-center gap-3 rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30"
					>
						{displayValue}
						<svg
							viewBox="0 0 20 20"
							class="size-4 fill-current transition-transform duration-300 group-hover:translate-x-1"
							><path
								fill-rule="evenodd"
								d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
								clip-rule="evenodd"
							/></svg
						>
					</a>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="Hero.ctaSecondary"
				label="Кнопка 2"
				value={String(data?.ctaSecondary ?? 'Курьер с образцом')}
				{isEditable}
				onSave={(v) => saveField('ctaSecondary', v)}
			>
				{#snippet children(displayValue)}
					<a
						href={String(data?.ctaSecondaryLink ?? '/contacts')}
						class="inline-flex items-center gap-2 rounded-xl border border-surface-500 px-8 py-4 text-sm font-semibold tracking-wide text-surface-200 transition-all duration-300 hover:border-surface-300 hover:text-white"
					>
						{displayValue}
					</a>
				{/snippet}
			</EditableField>
		</div>

		<!-- Stats row -->
		<div class="mt-16 flex flex-wrap gap-12 border-t border-surface-700/50 pt-8">
			{#each stats as stat}
				<div>
					<div class="font-display text-2xl font-bold text-accent-500">{stat.value}</div>
					<div class="mt-1 text-xs tracking-wide text-surface-300">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
		<div class="flex flex-col items-center gap-2">
			<span class="text-[10px] tracking-[0.2em] text-surface-300 uppercase">Скролл</span>
			<div
				class="flex h-10 w-6 items-start justify-center rounded-full border border-surface-300/50 p-1.5"
			>
				<div class="size-1.5 animate-bounce rounded-full bg-accent-500"></div>
			</div>
		</div>
	</div>
</section>
