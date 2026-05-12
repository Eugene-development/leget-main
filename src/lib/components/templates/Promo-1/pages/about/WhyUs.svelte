<script lang="ts">
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
		await saveComponentData(editContext, 'WhyUs', updated);
		data = updated;
	}

	const defaultItems = [
		{ title: 'Гарантия до 10 лет', text: 'Расширенная гарантия на все виды продукции наших партнёров', color: 'sky' },
		{ title: 'Рассрочка 0%', text: 'Удобные условия оплаты без переплат и комиссий', color: 'emerald' },
		{ title: 'Бесплатный проект', text: 'Дизайнерская 3D-визуализация вашей мебели', color: 'violet' },
		{ title: 'Доставка и монтаж', text: 'Профессиональная сборка и установка "под ключ"', color: 'amber' },
	];

	const colorMap: Record<string, string> = {
		sky:     'bg-sky-500/20 text-sky-400',
		emerald: 'bg-emerald-500/20 text-emerald-400',
		violet:  'bg-violet-500/20 text-violet-400',
		amber:   'bg-amber-500/20 text-amber-400',
	};

	async function updateItem(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedItems = [...items];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		await saveField('items', updatedItems);
	}

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);
</script>

<div class="bg-linear-to-br from-slate-800 to-slate-900 py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="WhyUs.title"
				label="Заголовок"
				value={String(data?.title ?? 'Почему выбирают нас')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl font-bold text-white">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="WhyUs.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Преимущества работы с нами')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-2xl text-slate-300">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each items as item, i}
				<div class="rounded-2xl bg-white/5 p-6 backdrop-blur transition-all hover:bg-white/10">
					<div class="flex h-12 w-12 items-center justify-center rounded-xl {colorMap[item.color] ?? colorMap.sky}">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
						</svg>
					</div>
					<h3 class="mt-4 text-lg font-semibold text-white">
						<EditableField 
							fieldKey="WhyUs.{i}.title" 
							label="Заголовок" 
							value={item.title} 
							{isEditable} 
							inline 
							onSave={(v) => updateItem(i, 'title', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</h3>
					<p class="mt-2 text-sm text-slate-400">
						<EditableField 
							fieldKey="WhyUs.{i}.text" 
							label="Описание" 
							value={item.text} 
							{isEditable} 
							inline 
							onSave={(v) => updateItem(i, 'text', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>
