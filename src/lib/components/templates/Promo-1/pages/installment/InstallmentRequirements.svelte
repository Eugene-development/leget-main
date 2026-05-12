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
		await saveComponentData(editContext, 'InstallmentRequirements', updated);
		data = updated;
	}

	const defaultItems = [
		{ title: 'Паспорт РФ',       text: 'Действующий паспорт гражданина Российской Федерации', color: 'from-red-500 to-red-600 shadow-red-500/25' },
		{ title: 'Стабильный доход', text: 'Официальное трудоустройство или подтверждение дохода', color: 'from-emerald-500 to-teal-600 shadow-emerald-500/25' },
		{ title: 'Хорошая КИ',       text: 'Положительная кредитная история для быстрого одобрения', color: 'from-sky-500 to-blue-600 shadow-sky-500/25' },
	];

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

<div class="bg-white py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="InstallmentRequirements.title"
				label="Заголовок"
				value={String(data?.title ?? 'Что нужно для оформления')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl font-bold text-slate-900">{displayValue}</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="InstallmentRequirements.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Минимум документов — максимум удобства')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-2xl text-slate-600">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-12 grid gap-8 sm:grid-cols-3">
			{#each items as item, i}
				<div class="relative rounded-2xl bg-linear-to-br from-slate-50 to-slate-100 p-8 text-center">
					<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br {item.color} text-white shadow-lg">
						<svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<h3 class="mt-6 text-xl font-bold text-slate-900">
						<EditableField 
							fieldKey="InstallmentRequirements.{i}.title" 
							label="Заголовок требования" 
							value={item.title} 
							{isEditable} 
							inline 
							onSave={(v) => updateItem(i, 'title', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</h3>
					<p class="mt-2 text-slate-600">
						<EditableField 
							fieldKey="InstallmentRequirements.{i}.text" 
							label="Описание требования" 
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
