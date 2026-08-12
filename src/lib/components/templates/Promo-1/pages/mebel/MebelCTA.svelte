<script lang="ts">
	// Артикулы: 1.16.6.1, 1.17.5.1, 1.18.5.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'MebelCTA', updated);
		data = updated;
	}
</script>

<div class="p1-catalog-container mt-12 mb-12">
	<div
		class="rounded-2xl bg-linear-to-r from-accent-surface to-accent-surface-deep p-8 text-center text-on-accent sm:p-12"
	>
		<h2 class="text-2xl sm:text-3xl">
			<EditableField
				fieldKey="MebelCTA.title"
				label="Заголовок"
				value={String(data.title || 'Готовы начать проект?')}
				{isEditable}
				inline
				onSave={(v) => saveField('title', v)}
			>
				{#snippet children(val)}
					{val}
				{/snippet}
			</EditableField>
		</h2>

		<p class="mx-auto mt-3 max-w-md text-on-accent-muted">
			<EditableField
				fieldKey="MebelCTA.description"
				label="Описание"
				value={String(
					data.description ||
						'Оставьте заявку и получите бесплатный дизайн-проект вашей будущей мебели'
				)}
				{isEditable}
				inline
				multiline
				onSave={(v) => saveField('description', v)}
			>
				{#snippet children(val)}
					{val}
				{/snippet}
			</EditableField>
		</p>

		<div class="mt-6 flex flex-wrap justify-center gap-4">
			<button
				class="inline-flex items-center gap-2 rounded-lg bg-surface-raised px-6 py-3 font-medium text-accent-ink transition-colors hover:bg-accent-ink/10"
			>
				<EditableField
					fieldKey="MebelCTA.buttonText"
					label="Текст кнопки"
					value={String(data.buttonText || 'Получить консультацию')}
					{isEditable}
					inline
					onSave={(v) => saveField('buttonText', v)}
				>
					{#snippet children(val)}
						{val}
					{/snippet}
				</EditableField>
			</button>

			<a
				href={data.phone ? `tel:${data.phone}` : 'tel:+79999000000'}
				class="inline-flex items-center gap-2 rounded-lg bg-on-accent/10 px-6 py-3 font-medium text-on-accent backdrop-blur transition-colors hover:bg-on-accent/20"
			>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
					/>
				</svg>
				Позвонить
			</a>
		</div>
	</div>
</div>
