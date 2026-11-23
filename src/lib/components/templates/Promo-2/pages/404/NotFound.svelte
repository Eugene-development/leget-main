<script lang="ts">
	import { resolve } from '$app/paths';
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	import { saveComponentData } from '$lib/utils/page-edit';
	import type { PageComponentProps } from '../../../types';

	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'NotFound', updated);
		data = updated;
	}
</script>

{#snippet recoveryLink(
	path: '/' | '/kitchens',
	field: string,
	fallback: string,
	label: string,
	linkClass: string
)}
	<EditableField
		fieldKey={`NotFound.${field}`}
		{label}
		value={editableText(data[field], fallback)}
		{isEditable}
		richText={false}
		inline
		onSave={(value) => saveField(field, value)}
	>
		{#snippet children(value)}
			{#if isEditable}
				<span class={linkClass}>{value || fallback}</span>
			{:else if value.trim()}
				<a href={resolve(path)} class={linkClass}>{value}</a>
			{/if}
		{/snippet}
	</EditableField>
{/snippet}

<section class="border-b border-border-light bg-surface-warm text-primary">
	<div
		class="p2-container grid gap-8 py-section-sm md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center md:gap-12 md:py-section"
	>
		<div class="md:order-2 md:border-l md:border-border-light md:py-8 md:text-center">
			<p
				class="font-heading text-[clamp(4rem,9vw,6rem)] leading-none tracking-tight"
				aria-hidden="true"
			>
				404
			</p>
			<div class="mt-4 h-px w-12 bg-accent md:mx-auto" aria-hidden="true"></div>
		</div>
		<div class="min-w-0">
			<EditableField
				fieldKey="NotFound.title"
				label="Заголовок"
				value={editableText(data.title, 'Страница не найдена')}
				{isEditable}
				onSave={(value) => saveField('title', value)}
			>
				{#snippet children(value)}
					<h1 class="font-heading text-page-title text-balance wrap-break-word">
						<RichText {value} />
					</h1>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="NotFound.description"
				label="Описание"
				value={editableText(data.description, 'Возможно, ссылка устарела или страницу перенесли.')}
				{isEditable}
				multiline
				onSave={(value) => saveField('description', value)}
				class="mt-4 block"
			>
				{#snippet children(value)}
					<p class="max-w-lg text-prose wrap-break-word text-secondary"><RichText {value} /></p>
				{/snippet}
			</EditableField>
			<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
				{@render recoveryLink(
					'/',
					'homeLabel',
					'На главную',
					'Ссылка на главную',
					'text-control inline-flex min-h-11 max-w-full items-center rounded-sm border border-primary bg-primary px-5 py-2.5 wrap-break-word text-surface transition-colors hover:bg-transparent hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'
				)}
				{@render recoveryLink(
					'/kitchens',
					'kitchensLabel',
					'Смотреть кухни',
					'Ссылка на кухни',
					'text-control inline-flex min-h-11 items-center wrap-break-word underline decoration-border-light underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary'
				)}
			</div>
		</div>
	</div>
</section>
