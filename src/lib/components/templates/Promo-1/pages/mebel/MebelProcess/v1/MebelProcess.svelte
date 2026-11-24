<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 1.16.5.1 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
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
		await saveComponentData(editContext, 'MebelProcess', updated);
		data = updated;
	}

	async function saveStepField(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedSteps = [...steps];
		if (!updatedSteps[index]) {
			// Initialize from derived if missing
			updatedSteps[index] = { ...steps[index] };
		}
		updatedSteps[index] = { ...updatedSteps[index], [field]: value };
		const updated = { ...data, steps: updatedSteps };
		await saveComponentData(editContext, 'MebelProcess', updated);
		data = updated;
	}

	const steps = $derived(
		data.steps || [
			{ title: 'Консультация', desc: 'Обсуждаем ваши пожелания' },
			{ title: 'Замер', desc: 'Бесплатный выезд специалиста' },
			{ title: 'Проект', desc: '3D-визуализация и расчёт' },
			{ title: 'Договор', desc: 'Отправка проекта в работу' }
		]
	);
</script>

<div class="mebel-container mt-12 mb-12">
	<h2 class="mb-8 text-section-title text-balance text-ink-900">
		<EditableField
			fieldKey="MebelProcess.title"
			label="Заголовок"
			value={editableText(data.title, 'Как мы работаем')}
			{isEditable}
			inline
			onSave={(v) => saveField('title', v)}
		>
			{#snippet children(val)}
				<RichText value={val} />
			{/snippet}
		</EditableField>
	</h2>

	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each steps as step, i}
			<div class="p1-card-copy relative rounded-xl border border-ink-50 bg-surface-raised p-5 shadow-sm">
				<span
					class="absolute -top-3 left-5 flex h-7 w-7 items-center justify-center rounded-full bg-(--ds-contrast-white-link-text) text-sm font-bold text-(color:--ds-contrast-black-copy)"
				>
					{i + 1}
				</span>
				<h3 class="p1-title-sub mt-2 text-ink-900 text-card-title">
					<EditableField
						fieldKey="MebelProcess.steps.{i}.title"
						label="Заголовок этапа"
						value={step.title}
						{isEditable}
						inline
						onSave={(v) => saveStepField(i, 'title', v)}
					>
						{#snippet children(val)}
							<RichText value={val} />
						{/snippet}
					</EditableField>
				</h3>
				<p class="mt-1 text-prose text-ink-600">
					<EditableField
						fieldKey="MebelProcess.steps.{i}.desc"
						label="Описание этапа"
						value={step.desc ?? ''}
						{isEditable}
						inline
						onSave={(v) => saveStepField(i, 'desc', v)}
					>
						{#snippet children(val)}
							<RichText value={val} />
						{/snippet}
					</EditableField>
				</p>
			</div>
		{/each}
	</div>
</div>
