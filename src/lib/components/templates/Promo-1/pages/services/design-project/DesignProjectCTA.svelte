<script lang="ts">
	// Артикул: 1.12.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'DesignProjectCTA', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-ink-950 py-32 sm:py-48">
	<div class="absolute inset-0 opacity-10">
		<div
			class="absolute top-0 left-0 h-full w-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"
		></div>
	</div>
	<div class="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8">
		<h2 class="text-4xl leading-tight tracking-tight text-on-dark sm:text-7xl">
			<EditableField
				fieldKey="DesignProjectCTA.title_part1"
				label="Заголовок часть 1"
				value={String(data?.title_part1 ?? 'Готовы создать')}
				{isEditable}
				onSave={(v) => saveField('title_part1', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					{displayValue}
				{/snippet}
			</EditableField>
			<br />
			<EditableField
				fieldKey="DesignProjectCTA.title_part2"
				label="Заголовок часть 2"
				value={String(data?.title_part2 ?? 'свой идеал?')}
				{isEditable}
				onSave={(v) => saveField('title_part2', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					<span class="bg-gradient-to-r from-cat-2-400 to-cat-9-300 bg-clip-text text-transparent"
						>{displayValue}</span
					>
				{/snippet}
			</EditableField>
		</h2>
		<div class="mt-16">
			<EditableField
				fieldKey="DesignProjectCTA.cta_text"
				label="Текст кнопки"
				value={String(data?.cta_text ?? 'Заказать проект')}
				{isEditable}
				onSave={(v) => saveField('cta_text', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					<button
						type="button"
						class="inline-flex items-center gap-4 rounded-full bg-cat-2-500 px-12 py-6 text-lg font-black text-on-accent shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-cat-2-400 active:scale-95"
					>
						{displayValue}
					</button>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
