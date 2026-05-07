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
		await saveComponentData(editContext, 'FurnitureProjectCTA', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
	<div class="absolute inset-0 opacity-20">
		<div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:32px_32px]"></div>
	</div>
	<div class="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
		<EditableField
			fieldKey="FurnitureProjectCTA.title"
			label="Заголовок"
			value={String(data?.title ?? 'Готовы создать уникальную мебель?')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
					{displayValue}
				</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="FurnitureProjectCTA.description"
			label="Описание"
			value={String(data?.description ?? 'Закажите проект мебели и получите изделие, идеально подходящее под ваш интерьер')}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="mt-8 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 leading-relaxed">
					{displayValue}
				</p>
			{/snippet}
		</EditableField>

		<div class="mt-12">
			<EditableField
				fieldKey="FurnitureProjectCTA.cta_text"
				label="Текст кнопки"
				value={String(data?.cta_text ?? 'Заказать проект мебели')}
				{isEditable}
				onSave={(v) => saveField('cta_text', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					<button
						type="button"
						class="inline-flex items-center gap-3 rounded-full bg-white px-10 py-5 text-base font-bold text-slate-950 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-orange-500 hover:text-white active:scale-95"
					>
						{displayValue}
					</button>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
