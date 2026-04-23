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
		await saveComponentData(editContext, 'GuaranteeTerms', updated);
		data = updated;
	}

	const defaultItems = [
		{ years: '3+', unit: 'лет', title: 'Фасады из дерева',    text: 'Натуральное дерево или шпон с защитным покрытием',          color: 'from-amber-500 to-orange-500 shadow-amber-500/25',   dot: 'from-amber-100 to-orange-100' },
		{ years: '5',  unit: 'лет', title: 'Каркасы мебели',      text: 'ЛДСП и МДФ с двусторонним покрытием высокого качества',     color: 'from-sky-500 to-blue-500 shadow-sky-500/25',         dot: 'from-sky-100 to-blue-100' },
		{ years: '5+', unit: 'лет', title: 'Столешницы',          text: 'Вариант из кварца, акрила и компакт-плиты',                 color: 'from-emerald-500 to-teal-500 shadow-emerald-500/25', dot: 'from-emerald-100 to-teal-100' },
		{ years: '5',  unit: 'лет', title: 'Бытовая техника',     text: 'Официальная гарантия производителя',                        color: 'from-violet-500 to-purple-500 shadow-violet-500/25', dot: 'from-violet-100 to-purple-100' },
		{ years: '5',  unit: 'лет', title: 'Алюминиевый профиль', text: 'Фасады с алюминиевой рамкой со стеклом и без него',         color: 'from-slate-600 to-gray-700 shadow-slate-500/25',     dot: 'from-slate-100 to-gray-200' },
		{ years: '5',  unit: 'лет', title: 'Фурнитура',           text: 'Петли, направляющие и навесы премиум-класса',               color: 'from-cyan-500 to-sky-500 shadow-cyan-500/25',        dot: 'from-cyan-100 to-sky-100' },
		{ years: '15', unit: 'лет', title: 'Мойки',               text: 'Нержавеющая сталь PVD и композитный камень',                color: 'from-blue-500 to-indigo-500 shadow-blue-500/25',     dot: 'from-blue-100 to-indigo-100' },
		{ years: '7',  unit: 'лет', title: 'Стекло и зеркала',    text: 'Закалённое стекло и зеркальные фасады с рисунком и без него', color: 'from-pink-500 to-rose-500 shadow-pink-500/25',      dot: 'from-pink-100 to-rose-100' },
	];

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);
</script>

<div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
	<div class="text-center">
		<EditableField
			fieldKey="GuaranteeTerms.title"
			label="Заголовок"
			value={String(data?.title ?? 'Сроки гарантии')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-4xl font-bold text-slate-900">{displayValue}</h2>
			{/snippet}
		</EditableField>
		<EditableField
			fieldKey="GuaranteeTerms.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Официальная гарантия от производителей на все категории')}
			{isEditable}
			onSave={(v) => saveField('subtitle', v)}
			class="mt-4 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mt-4 max-w-2xl text-slate-600">{displayValue}</p>
			{/snippet}
		</EditableField>
	</div>

	<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
		{#each items as item}
			<div class="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
				<div class="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-linear-to-br {item.dot} opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
				<div class="relative">
					<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br {item.color} text-white shadow-lg">
						<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
					</div>
					<div class="mt-4">
						<span class="text-4xl font-bold text-slate-900">{item.years}</span>
						<span class="ml-1 text-lg text-slate-500">{item.unit}</span>
					</div>
					<h3 class="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
					<p class="mt-1 text-sm text-slate-500">{item.text}</p>
				</div>
			</div>
		{/each}
	</div>
</div>
