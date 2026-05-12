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

	async function saveField(field: string, value: any) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Statistics', updated);
		data = updated;
	}

	async function updateStat(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedStats = [...stats];
		updatedStats[index] = { ...updatedStats[index], [field]: value };
		await saveField('stats', updatedStats);
	}

	const defaultStats = [
		{ value: '300+', label: 'Партнёрских салонов', color: 'sky' },
		{ value: '20+',  label: 'Лет опыта',           color: 'emerald' },
		{ value: '17',   label: 'Городов России',      color: 'violet' },
		{ value: '4000+', label: 'Реализованных проектов', color: 'amber' },
	];

	const colorMap: Record<string, { bg: string; line: string }> = {
		sky:     { bg: 'from-sky-100 to-cyan-100',      line: 'from-sky-500 to-cyan-500' },
		emerald: { bg: 'from-emerald-100 to-teal-100',   line: 'from-emerald-500 to-teal-500' },
		violet:  { bg: 'from-violet-100 to-purple-100',  line: 'from-violet-500 to-purple-500' },
		amber:   { bg: 'from-amber-100 to-orange-100',   line: 'from-amber-500 to-orange-500' },
	};

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);
</script>

<div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each stats as stat, i}
			{@const c = colorMap[stat.color] ?? colorMap.sky}
			<div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
				<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br {c.bg} opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
				<div class="relative">
					<div class="text-5xl font-bold text-slate-900">
						<EditableField 
							fieldKey="Statistics.{i}.value" 
							label="Значение" 
							value={stat.value} 
							{isEditable} 
							inline 
							onSave={(v) => updateStat(i, 'value', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</div>
					<div class="mt-2 text-slate-600">
						<EditableField 
							fieldKey="Statistics.{i}.label" 
							label="Метка" 
							value={stat.label} 
							{isEditable} 
							inline 
							onSave={(v) => updateStat(i, 'label', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</div>
					<div class="mt-4 h-1 w-12 rounded-full bg-linear-to-r {c.line}"></div>
				</div>
			</div>
		{/each}
	</div>
</div>
