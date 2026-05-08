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
		await saveComponentData(editContext, 'MebelSolutions', updated);
		data = updated;
	}

	const items = $derived(data.items || [
		{ title: 'Кухонные гарнитуры', desc: 'От классики до современного минимализма', image: '/custom_kitchens.png' },
		{ title: 'Шкафы', desc: 'Максимум функциональности и стиля', image: '/custom_wardrobes.png' }
	]);
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="text-2xl font-bold text-slate-900 mb-8">
		<EditableField 
			fieldKey="MebelSolutions.title" 
			label="Заголовок" 
			value={String(data.title || 'Популярные решения')} 
			{isEditable} 
			inline 
			onSave={(v) => saveField('title', v)}
		>
			{#snippet children(val)}
				{val}
			{/snippet}
		</EditableField>
	</h2>

	<div class="grid gap-6 sm:grid-cols-2">
		{#each items as item}
			<div class="group relative overflow-hidden rounded-2xl bg-slate-100">
				<img 
					src={item.image} 
					alt={item.title} 
					class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
				/>
				<div class="absolute inset-0 bg-linear-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
				<div class="absolute bottom-0 left-0 right-0 p-6">
					<h3 class="text-xl font-bold text-white">{item.title}</h3>
					<p class="mt-1 text-sm text-slate-300">{item.desc ?? ''}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
