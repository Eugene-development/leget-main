<script lang="ts">
	// Артикул: 3.2.3.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Values', updated);
		data = updated;
	}

	const defaultValues = [
		{
			icon: '🏛️',
			title: 'Экспертиза',
			desc: 'Более 15 лет на рынке отделочных материалов. Наши специалисты знают о плитке всё — от свойств материалов до тонкостей укладки.'
		},
		{
			icon: '🌍',
			title: 'Лучшие производители',
			desc: 'Прямые контракты с ведущими заводами Италии, Испании, Португалии и России. Никаких посредников — только оригинальная продукция.'
		},
		{
			icon: '✨',
			title: 'Честность',
			desc: 'Мы показываем реальные цены, настоящие фотографии и честные характеристики. Никаких скрытых наценок.'
		},
		{
			icon: '🤝',
			title: 'Долгосрочные отношения',
			desc: 'Большинство наших клиентов возвращаются снова. Мы выстраиваем отношения, а не просто продаём плитку.'
		}
	];

	const values = $derived(
		Array.isArray(data?.values) && (data.values as unknown[]).length > 0
			? (data.values as typeof defaultValues)
			: defaultValues
	);
</script>

<section class="relative bg-surface-800/30 py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16 text-center">
			<EditableField
				fieldKey="Values.label"
				label="Лейбл"
				value={String(data?.label ?? 'Наши принципы')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}<span
						class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase"
						>{displayValue}</span
					>{/snippet}
			</EditableField>
			<EditableField
				fieldKey="Values.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'На чём держится компания')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}<h2 class="mt-3 text-4xl text-white lg:text-5xl">
						{displayValue}
					</h2>{/snippet}
			</EditableField>
		</div>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each values as val}
				<div
					class="group rounded-2xl border border-surface-700/50 bg-surface-800/30 p-8 transition-all duration-500 hover:border-accent-500/20 hover:bg-surface-800/60"
				>
					<div class="mb-5 text-4xl">{val.icon}</div>
					<h3 class="text-lg text-white">{val.title}</h3>
					<p class="mt-3 text-sm leading-relaxed text-surface-300">{val.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
