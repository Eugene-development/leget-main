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

	const rows = $derived(
		data.rows || [
			{
				material: 'Кварцевый агломерат',
				price: 'Высокая',
				strength: 'Высокая',
				care: 'Простой',
				strengthColor: 'emerald',
				careColor: 'emerald'
			},
			{
				material: 'Акриловый камень',
				price: 'Средняя',
				strength: 'Средняя',
				care: 'Простой',
				strengthColor: 'amber',
				careColor: 'emerald'
			},
			{
				material: 'ДСП / Постформинг',
				price: 'Низкая',
				strength: 'Средняя',
				care: 'Простой',
				strengthColor: 'amber',
				careColor: 'emerald'
			},
			{
				material: 'Массив дерева',
				price: 'Высокая',
				strength: 'Низкая',
				care: 'Требует ухода',
				strengthColor: 'sky',
				careColor: 'amber'
			},
			{
				material: 'Керамика',
				price: 'Высокая',
				strength: 'Высокая',
				care: 'Простой',
				strengthColor: 'emerald',
				careColor: 'emerald'
			}
		]
	);

	const badgeColors: Record<string, string> = {
		emerald: 'bg-cat-2-100 text-cat-2-700',
		amber: 'bg-cat-1-100 text-cat-1-700',
		sky: 'bg-link-100 text-link-700',
		red: 'bg-brand-100 text-brand-700'
	};
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="mb-8 text-2xl text-ink-900">
		{data.title || 'Сравнение материалов'}
	</h2>

	<div
		class="overflow-hidden rounded-2xl bg-surface-raised shadow-sm"
		in:fly={{ y: 20, duration: 500, easing: cubicOut }}
	>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead class="bg-ink-50">
					<tr>
						<th class="px-4 py-3 font-semibold text-ink-900">Материал</th>
						<th class="px-4 py-3 font-semibold text-ink-900">Цена</th>
						<th class="px-4 py-3 font-semibold text-ink-900">Прочность</th>
						<th class="px-4 py-3 font-semibold text-ink-900">Уход</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-ink-100">
					{#each rows as row}
						<tr class="transition-colors hover:bg-ink-50/50">
							<td class="px-4 py-3 font-medium text-ink-900">{row.material}</td>
							<td class="px-4 py-3 text-ink-600">{row.price}</td>
							<td class="px-4 py-3">
								<span
									class="rounded-full px-2 py-1 text-xs font-medium {badgeColors[
										row.strengthColor
									] || 'bg-ink-100 text-ink-700'}"
								>
									{row.strength}
								</span>
							</td>
							<td class="px-4 py-3">
								<span
									class="rounded-full px-2 py-1 text-xs font-medium {badgeColors[row.careColor] ||
										'bg-ink-100 text-ink-700'}"
								>
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
