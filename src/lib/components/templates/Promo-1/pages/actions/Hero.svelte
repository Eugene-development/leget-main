<script lang="ts">
	// Артикул: 1.4.1.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-linear-to-br from-slate-50 to-white py-24 sm:py-28">
	<!-- Диагональный декор -->
	<div class="absolute inset-0">
		<div
			class="absolute inset-0 bg-linear-to-br from-red-50 to-amber-50"
			style="clip-path: polygon(0 0, 100% 0, 100% 65%, 0 100%);"
		></div>
	</div>
	<!-- Светящиеся круги -->
	<div class="absolute -left-40 top-0 size-80 rounded-full bg-red-100/50 blur-3xl"></div>
	<div class="absolute -right-40 bottom-0 size-96 rounded-full bg-amber-100/50 blur-3xl"></div>

	<div class="relative mx-auto max-w-7xl px-6 text-center lg:px-8">
		<EditableField
			fieldKey="Hero.eyebrow"
			label="Надпись над заголовком"
			value={String(data?.eyebrow ?? 'Выгодные предложения')}
			{isEditable}
			onSave={(v) => saveField('eyebrow', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p class="text-base/7 font-semibold text-red-500">{displayValue}</p>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="Hero.title"
			label="Заголовок"
			value={String(data?.title ?? 'Акции, скидки и подарки')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="mt-4 block"
		>
			{#snippet children(displayValue)}
				<h1 class="mt-4 text-pretty text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
					{displayValue}
				</h1>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="Hero.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Получите актуальные акции наших партнёров и узнайте о подарках и скидках на проекты и услуги')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="mt-6 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mt-6 max-w-2xl text-lg/8 text-slate-600">{displayValue}</p>
			{/snippet}
		</EditableField>
	</div>
</section>
