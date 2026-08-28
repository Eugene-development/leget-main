<script lang="ts">
	// Артикул: 3.2.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Timeline', updated);
		data = updated;
	}

	const defaultMilestones = [
		{
			year: '2009',
			title: 'Основание компании',
			desc: 'Начали с небольшого шоурума в Москве с 500 артикулами в ассортименте.'
		},
		{
			year: '2013',
			title: 'Прямые поставки',
			desc: 'Заключили первые прямые контракты с итальянскими производителями, снизив цены на 30%.'
		},
		{
			year: '2017',
			title: 'Онлайн-каталог',
			desc: 'Запустили первый в России онлайн-каталог плитки с 3D-визуализацией.'
		},
		{
			year: '2021',
			title: 'Партнёрская сеть',
			desc: 'Открыли сеть партнёрских салонов в 20+ городах по всей России.'
		},
		{
			year: '2024',
			title: 'Компания сегодня',
			desc: '12 000+ артикулов, 50+ брендов, собственная служба доставки и 3D-дизайна.'
		}
	];

	const milestones = $derived(
		Array.isArray(data?.milestones) && (data.milestones as unknown[]).length > 0
			? (data.milestones as typeof defaultMilestones)
			: defaultMilestones
	);
</script>

<section class="relative py-24 lg:py-32">
	<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
		<div class="size-[700px] rounded-full bg-accent-500/4 blur-3xl"></div>
	</div>
	<div class="relative px-10 lg:px-24 xl:px-32">
		<div class="mb-16 text-center">
			<EditableField
				fieldKey="Timeline.label"
				label="Лейбл"
				value={String(data?.label ?? 'Хронология')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}<span
						class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase"
						>{displayValue}</span
					>{/snippet}
			</EditableField>
			<EditableField
				fieldKey="Timeline.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Как мы росли')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}<h2 class="mt-3 text-4xl text-white lg:text-5xl">
						{displayValue}
					</h2>{/snippet}
			</EditableField>
		</div>
		<div class="relative mx-auto max-w-3xl">
			<div
				class="absolute top-0 bottom-0 left-6 w-px bg-gradient-to-b from-accent-500/50 via-accent-500/20 to-transparent lg:left-1/2 lg:-translate-x-1/2"
			></div>
			<div class="flex flex-col">
				{#each milestones as item, i}
					<div
						class="relative flex items-start gap-6 pb-12 lg:pb-16 {i % 2 === 0
							? 'lg:flex-row'
							: 'lg:flex-row-reverse'} lg:gap-0"
					>
						<div
							class="relative z-10 shrink-0 lg:absolute lg:top-1 lg:left-1/2 lg:-translate-x-1/2"
						>
							<div
								class="flex size-12 items-center justify-center rounded-full border border-accent-500/40 bg-surface-900 shadow-lg shadow-black/50"
							>
								<div class="size-3 rounded-full bg-accent-500"></div>
							</div>
						</div>
						<div class="flex-1 lg:mx-8 lg:max-w-[calc(50%-3rem)]">
							<div
								class="group rounded-2xl border border-surface-700/50 bg-surface-800/40 p-6 transition-all duration-300 hover:border-accent-500/20 hover:bg-surface-800/70"
							>
								<span class="ds-numeric text-3xl text-accent-500">{item.year}</span>
								<h3 class="mt-2 text-base text-white">{item.title}</h3>
								<p class="mt-2 text-sm leading-relaxed text-surface-300">{item.desc}</p>
							</div>
						</div>
						<div class="hidden flex-1 lg:block"></div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
