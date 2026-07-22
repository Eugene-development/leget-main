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

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'WhatsCovered', updated);
		data = updated;
	}

	const defaultItems = [
		{ title: 'Дефекты материалов', text: 'Сколы, трещины, отслоение покрытия при нормальной эксплуатации' },
		{ title: 'Качество сборки',    text: 'Неплотное прилегание, перекосы, скрипы механизмов' },
		{ title: 'Работа фурнитуры',   text: 'Поломка петель, направляющих, подъёмных механизмов' },
		{ title: 'Монтажные работы',   text: 'Качество установки и подключения техники' },
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
		<div class="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
			<div>
				<EditableField
					fieldKey="WhatsCovered.title"
					label="Заголовок"
					value={String(data?.title ?? 'Что покрывает гарантия')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="text-3xl font-bold text-slate-900">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="WhatsCovered.description"
					label="Описание"
					value={String(data?.description ?? 'Наша гарантия распространяется на производственные дефекты материалов и качество сборки. Мы несём ответственность за каждый элемент вашей мебели.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="mt-4 block"
				>
					{#snippet children(displayValue)}
						<p class="mt-4 text-slate-600">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="mt-8 space-y-4">
					{#each items as item, i}
						<div class="flex items-start gap-4">
							<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
								<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<div>
								<h3 class="font-semibold text-slate-900">
									<EditableField 
										fieldKey="WhatsCovered.{i}.title" 
										label="Заголовок пункта" 
										value={item.title} 
										{isEditable} 
										inline 
										onSave={(v) => updateItem(i, 'title', v)}
									>
										{#snippet children(val)}{val}{/snippet}
									</EditableField>
								</h3>
								<p class="mt-1 text-sm text-slate-500">
									<EditableField 
										fieldKey="WhatsCovered.{i}.text" 
										label="Описание пункта" 
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

			<div class="mt-12 lg:mt-0">
				<div class="relative">
					<div class="absolute -inset-4 rounded-3xl bg-linear-to-r from-red-50 to-red-100 opacity-50"></div>
					<EditableField
						fieldKey="WhatsCovered.imageUrl"
						label="URL изображения"
						value={String(data?.imageUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('imageUrl', v)}
						class="relative block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<img loading="lazy" src={displayValue} alt="Гарантия качества" class="relative rounded-2xl shadow-xl w-full object-cover">
							{:else}
								<div class="relative rounded-2xl bg-slate-100 shadow-xl aspect-video flex items-center justify-center">
									<p class="text-slate-400 text-sm">Добавьте URL изображения</p>
								</div>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</div>
</div>
