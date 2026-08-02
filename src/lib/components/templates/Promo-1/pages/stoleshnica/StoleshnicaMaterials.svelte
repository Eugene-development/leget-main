<script lang="ts">
	// Артикул: 1.19.3.1 — см. docs/architecture/component-articles-map.md
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'StoleshnicaMaterials', updated);
		data = updated;
	}

	const rows = $derived(data.rows || [
		{ material: 'Кварцевый агломерат', price: 'Высокая', strength: 'Высокая', care: 'Простой', strengthColor: 'emerald', careColor: 'emerald' },
		{ material: 'Акриловый камень',    price: 'Средняя', strength: 'Средняя', care: 'Простой', strengthColor: 'amber',   careColor: 'emerald' },
		{ material: 'ДСП / Постформинг',  price: 'Низкая',  strength: 'Средняя', care: 'Простой', strengthColor: 'amber',   careColor: 'emerald' },
		{ material: 'Массив дерева',       price: 'Высокая', strength: 'Низкая',  care: 'Требует ухода', strengthColor: 'sky', careColor: 'amber' },
		{ material: 'Керамика',            price: 'Высокая', strength: 'Высокая', care: 'Простой', strengthColor: 'emerald', careColor: 'emerald' }
	]);

	const badgeColors: Record<string, string> = {
		emerald: 'bg-emerald-100 text-emerald-700',
		amber: 'bg-amber-100 text-amber-700',
		sky: 'bg-sky-100 text-sky-700',
		red: 'bg-red-100 text-red-700'
	};
</script>

<div class="mebel-container mb-12 mt-12">
	<h2 class="mb-8 text-2xl font-bold text-slate-900">
		{data.title || 'Сравнение материалов'}
	</h2>

	<div
		class="overflow-hidden rounded-2xl bg-white shadow-sm"
		in:fly={{ y: 20, duration: 500, easing: cubicOut }}
	>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="bg-slate-50">
					<tr>
						<th class="px-4 py-3 font-semibold text-slate-900">Материал</th>
						<th class="px-4 py-3 font-semibold text-slate-900">Цена</th>
						<th class="px-4 py-3 font-semibold text-slate-900">Прочность</th>
						<th class="px-4 py-3 font-semibold text-slate-900">Уход</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each rows as row}
						<tr class="transition-colors hover:bg-slate-50/50">
							<td class="px-4 py-3 font-medium text-slate-900">{row.material}</td>
							<td class="px-4 py-3 text-slate-600">{row.price}</td>
							<td class="px-4 py-3">
								<span class="rounded-full px-2 py-1 text-xs font-medium {badgeColors[row.strengthColor] || 'bg-slate-100 text-slate-700'}">
									{row.strength}
								</span>
							</td>
							<td class="px-4 py-3">
								<span class="rounded-full px-2 py-1 text-xs font-medium {badgeColors[row.careColor] || 'bg-slate-100 text-slate-700'}">
									{row.care}
								</span>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
