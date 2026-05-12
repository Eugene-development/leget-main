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
		await saveComponentData(editContext, 'Values', updated);
		data = updated;
	}

	const defaultItems = [
		{ title: 'Качество', text: 'Работаем только с проверенными поставщиками и фабриками.', color: 'red' },
		{ title: 'Клиентоориентированность', text: 'Каждый проект уникален, и мы учитываем все пожелания клиента.', color: 'emerald' },
		{ title: 'Инновации', text: 'Следим за трендами и внедряем современные технологии.', color: 'violet' },
		{ title: 'Пунктуальность', text: 'Следим за сроками и держим клиента в курсе на каждом этапе.', color: 'amber' },
		{ title: 'Забота', text: 'Создаём пространства, которые вдохновляют и радуют каждый день.', color: 'pink' },
		{ title: 'Доступность', text: 'Работаем в разных городах России и постоянно расширяем географию.', color: 'cyan' },
	];

	const colorMap: Record<string, string> = {
		red:     'bg-red-100 text-red-600',
		emerald: 'bg-emerald-100 text-emerald-600',
		violet:  'bg-violet-100 text-violet-600',
		amber:   'bg-amber-100 text-amber-600',
		pink:    'bg-pink-100 text-pink-600',
		cyan:    'bg-cyan-100 text-cyan-600',
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

<div class="bg-slate-50 py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="Values.title"
				label="Заголовок"
				value={String(data?.title ?? 'Наши ценности')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl font-bold text-slate-900">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Values.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Принципы, которыми мы руководствуемся в работе')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-2xl text-slate-600">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each items as item, i}
				<div class="flex items-start gap-4">
					<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl {colorMap[item.color] ?? colorMap.red}">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<div>
						<h3 class="text-lg font-semibold text-slate-900">
							<EditableField 
								fieldKey="Values.{i}.title" 
								label="Заголовок" 
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
								fieldKey="Values.{i}.text" 
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
				</div>
			{/each}
		</div>
	</div>
</div>
