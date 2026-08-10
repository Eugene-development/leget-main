<script lang="ts">
	// Артикул: 3.2.1.1 — см. docs/architecture/component-articles-map.md
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
		{ value: '15+', label: 'Лет на рынке' },
		{ value: '50+', label: 'Брендов-партнёров' },
		{ value: '12 000+', label: 'Артикулов в каталоге' },
		{ value: '20+', label: 'Городов доставки' },
		{ value: '98%', label: 'Довольных клиентов' }
	];

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);
</script>

<section class="relative flex min-h-[55vh] items-center overflow-hidden">
	<div
		class="absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-900 to-surface-800"
	></div>
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 60px 60px;"
	></div>
	<div class="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
		<div class="size-[600px] rounded-full bg-accent-500/6 blur-3xl"></div>
	</div>

	<div class="relative z-10 w-full px-10 pt-40 pb-20 lg:px-24 xl:px-32">
		<div
			class="mb-8 inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/5 px-4 py-1.5"
		>
			<span class="size-2 rounded-full bg-accent-500"></span>
			<EditableField
				fieldKey="Hero.tag"
				label="Тег"
				value={String(data?.tag ?? 'Наша история')}
				{isEditable}
				onSave={(v) => saveField('tag', v)}
			>
				{#snippet children(displayValue)}<span
						class="text-xs font-semibold tracking-wider text-accent-500 uppercase"
						>{displayValue}</span
					>{/snippet}
			</EditableField>
		</div>
		<EditableField
			fieldKey="Hero.title"
			label="Заголовок"
			value={String(data?.title ?? 'О компании')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h1 class="font-display text-5xl text-white sm:text-6xl lg:text-7xl">
					{displayValue}
					<br /><span
						class="bg-linear-to-r from-accent-500 to-accent-300 bg-clip-text text-transparent"
						>{String(data?.titleAccent ?? '')}</span
					>
				</h1>
			{/snippet}
		</EditableField>
		<EditableField
			fieldKey="Hero.description"
			label="Описание"
			value={String(
				data?.description ??
					'Мы помогаем создавать красивые интерьеры уже 15 лет. Прямые поставки от лучших мировых производителей, честные цены и экспертиза на каждом шагу.'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="block"
		>
			{#snippet children(displayValue)}<p
					class="mt-6 max-w-2xl text-lg leading-relaxed text-surface-300"
				>
					{displayValue}
				</p>{/snippet}
		</EditableField>
		<div class="mt-14 flex flex-wrap gap-10 border-t border-surface-700/50 pt-8">
			{#each stats as stat}
				<div>
					<div class="font-display text-2xl font-bold text-accent-500">{stat.value}</div>
					<div class="mt-1 text-xs tracking-wide text-surface-300">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>
