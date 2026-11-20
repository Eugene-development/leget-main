<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 3.2.1.1 — см. docs/architecture/component-articles-map.md
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

	const theme = $derived(blockTheme(data, 'dark'));

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

<section
	data-p1-theme={theme}
	class="p1-surface relative flex min-h-[55vh] items-center overflow-hidden"
>
	{#if theme === 'dark'}
		<div
			class="pointer-events-none absolute inset-0 bg-gradient-to-br from-surface-900 via-surface-900 to-surface-800"
			aria-hidden="true"
		></div>
	{/if}
	<div
		class="pointer-events-none absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2"
		aria-hidden="true"
	>
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
				value={editableText(data?.tag, 'Наша история')}
				{isEditable}
				onSave={(v) => saveField('tag', v)}
			>
				{#snippet children(displayValue)}<span
						class="text-xs font-semibold tracking-wider text-accent-500 uppercase"
						><RichText value={displayValue} /></span
					>{/snippet}
			</EditableField>
		</div>
		<EditableField
			fieldKey="Hero.title"
			label="Заголовок"
			value={editableText(data?.title, 'О компании')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h1 class="p1-title text-5xl sm:text-6xl lg:text-7xl">
					<RichText value={displayValue} />
					<br /><span
						class="text-accent-500"
						>{String(data?.titleAccent ?? '')}</span
					>
				</h1>
			{/snippet}
		</EditableField>
		<EditableField
			fieldKey="Hero.description"
			label="Описание"
			value={editableText(
				data?.description,
				'Мы помогаем создавать красивые интерьеры уже 15 лет. Прямые поставки от лучших мировых производителей, честные цены и экспертиза на каждом шагу.'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="block"
		>
			{#snippet children(displayValue)}<p
					class="p1-body mt-6 max-w-2xl text-lg leading-relaxed"
				>
					<RichText value={displayValue} />
				</p>{/snippet}
		</EditableField>
		<div class="p1-border mt-14 flex flex-wrap gap-10 border-t pt-8">
			{#each stats as stat (stat)}
				<div>
					<div class="ds-numeric text-2xl text-accent-500">{stat.value}</div>
					<div class="p1-body mt-1 text-xs tracking-wide">{stat.label}</div>
				</div>
			{/each}
		</div>
	</div>
</section>
