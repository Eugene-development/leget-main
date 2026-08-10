<script lang="ts">
	// Артикул: 3.1.5.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Advantages', updated);
		data = updated;
	}

	const defaultAdvantages = [
		{
			icon: '🚚',
			title: 'Быстрая доставка',
			desc: 'Доставим по Москве за 24 часа, по России — от 2 дней'
		},
		{
			icon: '🛡️',
			title: 'Гарантия качества',
			desc: 'Только сертифицированная продукция с гарантией до 25 лет'
		},
		{
			icon: '📐',
			title: '3D-визуализация',
			desc: 'Бесплатная раскладка и визуализация вашего проекта'
		},
		{
			icon: '💰',
			title: 'Лучшие цены',
			desc: 'Прямые поставки от производителей без наценок посредников'
		}
	];

	const advantages = $derived(
		Array.isArray(data?.advantages) && (data.advantages as unknown[]).length > 0
			? (data.advantages as typeof defaultAdvantages)
			: defaultAdvantages
	);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16 text-center">
			<EditableField
				fieldKey="Advantages.label"
				label="Лейбл"
				value={String(data?.label ?? 'Почему мы')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase"
						>{displayValue}</span
					>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="Advantages.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Преимущества работы с нами')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="font-display mt-3 text-4xl text-white lg:text-5xl">{displayValue}</h2>
				{/snippet}
			</EditableField>
		</div>

		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each advantages as adv}
				<div
					class="group rounded-2xl border border-surface-700/50 bg-surface-800/30 p-8 transition-all duration-500 hover:border-accent-500/20 hover:bg-surface-800/60"
				>
					<div class="mb-5 text-4xl">{adv.icon}</div>
					<h3 class="text-lg text-white">{adv.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-surface-300">{adv.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
