<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { 
		data: any; 
		editContext?: EditContext | null; 
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelProcess', updated);
		data = updated;
	}

	const steps = $derived(data.steps || [
		{ title: 'Консультация', desc: 'Обсуждаем ваши пожелания' },
		{ title: 'Замер', desc: 'Бесплатный выезд специалиста' },
		{ title: 'Проект', desc: '3D-визуализация и расчёт' },
		{ title: 'Установка', desc: 'Профессиональный монтаж' }
	]);
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="text-2xl font-bold text-slate-900 mb-8">
		<EditableField 
			fieldKey="MebelProcess.title" 
			label="Заголовок" 
			value={String(data.title || 'Как мы работаем')} 
			{isEditable} 
			inline 
			onSave={(v) => saveField('title', v)}
		>
			{#snippet children(val)}
				{val}
			{/snippet}
		</EditableField>
	</h2>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		{#each steps as step, i}
			<div class="relative rounded-xl bg-white p-5 shadow-sm border border-slate-50">
				<span class="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
					{i + 1}
				</span>
				<h3 class="mt-2 font-semibold text-slate-900">{step.title}</h3>
				<p class="mt-1 text-sm text-slate-600">{step.desc ?? ''}</p>
			</div>
		{/each}
	</div>
</div>
