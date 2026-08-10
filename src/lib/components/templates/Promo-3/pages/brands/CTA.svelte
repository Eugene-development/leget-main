<script lang="ts">
	// Артикул: 3.3.3.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'CTA', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden py-24 lg:py-32">
	<div
		class="absolute inset-0 bg-gradient-to-br from-accent-600/20 via-surface-900 to-surface-900"
	></div>
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.04]"
		style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 40px 40px;"
	></div>
	<div class="relative px-8 text-center lg:px-16 xl:px-20">
		<EditableField
			fieldKey="CTA.heading"
			label="Заголовок"
			value={String(data?.heading ?? 'Не нашли нужный бренд?')}
			{isEditable}
			onSave={(v) => saveField('heading', v)}
			class="block"
		>
			{#snippet children(displayValue)}<h2 class="font-display text-4xl text-white lg:text-5xl">
					{displayValue}
				</h2>{/snippet}
		</EditableField>
		<EditableField
			fieldKey="CTA.description"
			label="Описание"
			value={String(
				data?.description ??
					'Свяжитесь с нами — мы работаем с широким кругом производителей и поможем найти нужную коллекцию под ваш проект.'
			)}
			{isEditable}
			multiline
			onSave={(v) => saveField('description', v)}
			class="block"
		>
			{#snippet children(displayValue)}<p class="mx-auto mt-6 max-w-xl text-lg text-surface-300">
					{displayValue}
				</p>{/snippet}
		</EditableField>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<EditableField
				fieldKey="CTA.ctaPrimary"
				label="Кнопка 1"
				value={String(data?.ctaPrimary ?? 'Связаться с нами')}
				{isEditable}
				onSave={(v) => saveField('ctaPrimary', v)}
			>
				{#snippet children(displayValue)}
					<a
						href={String(data?.ctaPrimaryLink ?? '/contacts')}
						class="inline-flex items-center gap-3 rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30"
					>
						{displayValue}
						<svg viewBox="0 0 20 20" class="size-4 fill-current"
							><path
								fill-rule="evenodd"
								d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
								clip-rule="evenodd"
							/></svg
						>
					</a>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="CTA.ctaSecondary"
				label="Кнопка 2"
				value={String(data?.ctaSecondary ?? 'Смотреть каталог')}
				{isEditable}
				onSave={(v) => saveField('ctaSecondary', v)}
			>
				{#snippet children(displayValue)}
					<a
						href={String(data?.ctaSecondaryLink ?? '/collections')}
						class="inline-flex items-center gap-2 rounded-xl border border-surface-500 px-8 py-4 text-sm font-semibold tracking-wide text-surface-200 transition-all duration-300 hover:border-surface-300 hover:text-white"
						>{displayValue}</a
					>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
