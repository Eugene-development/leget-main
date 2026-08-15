<script lang="ts">
	// Артикул: 1.21.8.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { sitePhoneHref } from '$lib/utils/site-phone';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		sitePhone?: string | null;
	} = $props();

	const phoneHref = $derived(sitePhoneHref(sitePhone));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'SantehnikaCTA', updated);
		data = updated;
	}
</script>

<div class="mebel-container mt-12 mb-16">
	<div
		class="rounded-2xl bg-linear-to-r from-link-500 to-cat-5-600 p-8 text-center text-on-accent sm:p-12"
	>
		<h2 class="text-2xl sm:text-3xl">
			<EditableField
				fieldKey="SantehnikaCTA.title"
				label="Заголовок CTA"
				value={String(data.title || 'Нужна помощь с выбором?')}
				{isEditable}
				inline
				onSave={(v) => saveField('title', v)}
			>
				{#snippet children(val)}{val}{/snippet}
			</EditableField>
		</h2>

		<p class="mx-auto mt-3 max-w-md text-link-100">
			<EditableField
				fieldKey="SantehnikaCTA.description"
				label="Описание CTA"
				value={String(
					data.description ||
						'Наши специалисты помогут подобрать сантехнику под вашу кухню и бюджет'
				)}
				{isEditable}
				inline
				multiline
				onSave={(v) => saveField('description', v)}
			>
				{#snippet children(val)}{val}{/snippet}
			</EditableField>
		</p>

		<div class="mt-6 flex flex-wrap justify-center gap-4">
			<button
				class="inline-flex items-center gap-2 rounded-lg bg-surface-raised px-6 py-3 font-medium text-link-600 transition-all hover:bg-link-50"
			>
				<EditableField
					fieldKey="SantehnikaCTA.buttonText"
					label="Текст кнопки"
					value={String(data.buttonText || 'Получить консультацию')}
					{isEditable}
					inline
					onSave={(v) => saveField('buttonText', v)}
				>
					{#snippet children(val)}{val}{/snippet}
				</EditableField>
			</button>
			<a
				href={phoneHref}
				class="inline-flex items-center gap-2 rounded-lg bg-on-dark/10 px-6 py-3 font-medium text-on-dark backdrop-blur transition-all hover:bg-on-dark/20"
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
