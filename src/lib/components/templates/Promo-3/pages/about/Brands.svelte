<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let { data = $bindable(), editContext = null, isEditable = false }: { data: Record<string, unknown>; editContext?: EditContext | null; isEditable?: boolean } = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Brands', updated);
		data = updated;
	}

	const defaultBrands = ['Kerama Marazzi', 'Atlas Concorde', 'Italon', 'Laparet', 'Cersanit', 'Estima', 'Gracia', 'Cerrad'];
	const brands = $derived(Array.isArray(data?.brands) && (data.brands as unknown[]).length > 0 ? (data.brands as string[]) : defaultBrands);
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16 text-center">
			<EditableField fieldKey="Brands.label" label="Лейбл" value={String(data?.label ?? 'Наши партнёры')} {isEditable} onSave={(v) => saveField('label', v)}>
				{#snippet children(displayValue)}<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>{/snippet}
			</EditableField>
			<EditableField fieldKey="Brands.heading" label="Заголовок" value={String(data?.heading ?? 'Бренды, которым мы доверяем')} {isEditable} onSave={(v) => saveField('heading', v)} class="block">
				{#snippet children(displayValue)}<h2 class="mt-3 font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">{displayValue}</h2>{/snippet}
			</EditableField>
			<EditableField fieldKey="Brands.description" label="Описание" value={String(data?.description ?? 'Прямые контракты с ведущими производителями — гарантия оригинальности и лучших цен.')} {isEditable} multiline onSave={(v) => saveField('description', v)} class="block">
				{#snippet children(displayValue)}<p class="mx-auto mt-4 max-w-xl text-surface-300">{displayValue}</p>{/snippet}
			</EditableField>
		</div>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
			{#each brands as brand}
				<div class="flex h-16 items-center justify-center rounded-xl border border-surface-700/50 bg-surface-800/30 px-4 text-xs font-semibold tracking-wide text-surface-300 transition-all duration-300 hover:border-accent-500/20 hover:text-surface-200">
					{brand}
				</div>
			{/each}
		</div>
	</div>
</section>
