<script lang="ts">
	// Артикул: 1.13.4.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'MeasurementCTA', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-ink-950 py-24 sm:py-32">
	<div class="absolute inset-0 opacity-20">
		<div
			class="absolute top-0 left-0 h-full w-full bg-[radial-gradient(var(--color-cat-3-500)_1px,transparent_1px)] [background-size:32px_32px]"
		></div>
	</div>
	<div class="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
		<EditableField
			fieldKey="MeasurementCTA.title"
			label="Заголовок"
			value={String(data?.title ?? 'Готовы начать с точного замера?')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-3xl text-on-dark sm:text-5xl lg:text-6xl">
					{displayValue}
				</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="MeasurementCTA.description"
			label="Описание"
			value={String(
				data?.description ?? 'Закажите профессиональный замер — первый шаг к идеальному интерьеру'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="mt-8 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto max-w-2xl text-lg leading-relaxed text-ink-400 sm:text-xl">
					{displayValue}
				</p>
			{/snippet}
		</EditableField>

		<div class="mt-12">
			<EditableField
				fieldKey="MeasurementCTA.cta_text"
				label="Текст кнопки"
				value={String(data?.cta_text ?? 'Заказать замер')}
				{isEditable}
				onSave={(v) => saveField('cta_text', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					<button
						type="button"
						class="inline-flex items-center gap-3 rounded-full bg-surface-raised px-10 py-5 text-base font-bold text-ink-950 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-cat-3-500 hover:text-on-accent active:scale-95"
					>
						{displayValue}
					</button>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
