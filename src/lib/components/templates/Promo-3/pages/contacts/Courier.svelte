<script lang="ts">
	// Артикул: 3.5.3.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Courier', updated);
		data = updated;
	}

	const defaultFeatures = [
		'Доставка в день обращения (по Москве)',
		'До 10 образцов в одной доставке',
		'Консультация по телефону во время выбора',
		'Без залога и предоплаты'
	];
	const features = $derived(
		Array.isArray(data?.features) && (data.features as unknown[]).length > 0
			? (data.features as string[])
			: defaultFeatures
	);

	const defaultSteps = [
		{
			step: '01',
			title: 'Позвоните или напишите',
			desc: 'Сообщите, какие коллекции вас интересуют — мы подберём образцы'
		},
		{
			step: '02',
			title: 'Согласуйте время',
			desc: 'Выберите удобный день и временной слот для доставки'
		},
		{
			step: '03',
			title: 'Получите образцы',
			desc: 'Курьер привезёт образцы прямо к вашей двери — выбирайте не спеша'
		}
	];
	const steps = $derived(
		Array.isArray(data?.steps) && (data.steps as unknown[]).length > 0
			? (data.steps as typeof defaultSteps)
			: defaultSteps
	);
</script>

<section class="relative overflow-hidden bg-surface-800/30 py-24 lg:py-32">
	<div class="absolute top-1/2 right-0 translate-x-1/3 -translate-y-1/2">
		<div class="size-[500px] rounded-full bg-accent-500/5 blur-3xl"></div>
	</div>
	<div class="relative px-10 lg:px-24 xl:px-32">
		<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
			<div>
				<EditableField
					fieldKey="Courier.label"
					label="Лейбл"
					value={String(data?.label ?? 'Курьер с образцами')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}<span
							class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase"
							>{displayValue}</span
						>{/snippet}
				</EditableField>
				<EditableField
					fieldKey="Courier.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Образцы привезём к вам')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}<h2 class="mt-4 text-4xl text-white lg:text-5xl">
							{displayValue}
						</h2>{/snippet}
				</EditableField>
				<EditableField
					fieldKey="Courier.description"
					label="Описание"
					value={String(
						data?.description ??
							'Не можете приехать в салон? Наш курьер доставит образцы понравившихся коллекций прямо к вам домой или в офис. Бесплатно, в удобное время.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}<p class="mt-6 text-lg leading-relaxed text-surface-300">
							{displayValue}
						</p>{/snippet}
				</EditableField>
				<ul class="mt-8 flex flex-col gap-4">
					{#each features as feature}
						<li class="flex items-center gap-3">
							<div
								class="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500/10"
							>
								<svg viewBox="0 0 12 12" class="size-3 fill-accent-500"
									><path
										d="M10.28 2.28L3.989 8.575 1.695 6.28A.751.751 0 00.633 7.345l2.83 2.83a.75.75 0 001.06 0l6.88-6.83a.751.751 0 00-1.123-1.065z"
									/></svg
								>
							</div>
							<span class="text-sm text-surface-200">{feature}</span>
						</li>
					{/each}
				</ul>
				<EditableField
					fieldKey="Courier.ctaText"
					label="Кнопка"
					value={String(data?.ctaText ?? 'Заказать доставку образцов')}
					{isEditable}
					onSave={(v) => saveField('ctaText', v)}
				>
					{#snippet children(displayValue)}
						<a
							href={String(data?.ctaLink ?? '/contacts')}
							class="mt-10 inline-flex items-center gap-3 rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30"
						>
							{displayValue}
							<svg viewBox="0 0 20 20" class="size-4 fill-current"
								><path
									fill-rule="evenodd"
									d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
									clip-rule="evenodd"
								/></svg
							>
						</a>
					{/snippet}
				</EditableField>
			</div>
			<div class="relative flex flex-col gap-4">
				{#each steps as item}
					<div
						class="flex items-start gap-5 rounded-2xl border border-surface-700/50 bg-surface-800/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent-500/20"
					>
						<span class="ds-numeric text-3xl text-accent-500/30">{item.step}</span>
						<div>
							<h4 class="text-white">{item.title}</h4>
							<p class="mt-1 text-sm leading-relaxed text-surface-300">{item.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
