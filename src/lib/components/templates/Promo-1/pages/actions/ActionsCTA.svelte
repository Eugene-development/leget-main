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
		await saveComponentData(editContext, 'ActionsCTA', updated);
		data = updated;
	}
</script>

<section class="bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-3xl px-6 text-center lg:px-8">
		<EditableField
			fieldKey="ActionsCTA.title"
			label="Заголовок"
			value={String(data?.title ?? 'Хотите узнать больше об акциях?')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-pretty text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
					{displayValue}
				</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="ActionsCTA.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Свяжитесь с нами и мы расскажем обо всех актуальных предложениях')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="mt-6 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mt-6 max-w-xl text-lg/8 text-gray-600">{displayValue}</p>
			{/snippet}
		</EditableField>

		<div class="mt-10">
			<EditableField
				fieldKey="ActionsCTA.buttonText"
				label="Текст кнопки"
				value={String(data?.buttonText ?? 'Связаться с нами')}
				{isEditable}
				onSave={(v) => saveField('buttonText', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					<a
						href="/contact"
						class="inline-flex items-center gap-2 rounded-lg bg-red-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition duration-300 hover:-translate-y-1 hover:bg-red-400 hover:shadow-xl hover:shadow-red-500/40"
					>
						{displayValue}
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</a>
				{/snippet}
			</EditableField>
		</div>

		<EditableField
			fieldKey="ActionsCTA.phone"
			label="Телефон"
			value={String(data?.phone ?? '')}
			{isEditable}
			onSave={(v) => saveField('phone', v)}
			class="mt-8 block"
		>
			{#snippet children(displayValue)}
				{#if displayValue}
					<p class="mt-8 text-sm text-gray-500">
						Или позвоните:
						<a href="tel:{displayValue}" class="text-red-500 transition hover:text-red-400">
							{displayValue}
						</a>
					</p>
				{/if}
			{/snippet}
		</EditableField>
	</div>
</section>
