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
		await saveComponentData(editContext, 'CTA', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden py-24 lg:py-32">
	<div class="absolute inset-0 bg-gradient-to-br from-accent-600/20 via-surface-900 to-surface-900"></div>
	<div class="pointer-events-none absolute inset-0 opacity-[0.04]" style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 40px 40px;"></div>

	<div class="relative px-8 text-center lg:px-16 xl:px-20">
		<EditableField fieldKey="CTA.heading" label="Заголовок" value={String(data?.heading ?? 'Готовы начать проект?')} {isEditable} onSave={(v) => saveField('heading', v)} class="block">
			{#snippet children(displayValue)}
				<h2 class="font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">{displayValue}</h2>
			{/snippet}
		</EditableField>
		<EditableField fieldKey="CTA.description" label="Описание" value={String(data?.description ?? 'Свяжитесь с нами для бесплатной консультации. Наши специалисты помогут подобрать идеальную плитку для вашего интерьера.')} {isEditable} multiline onSave={(v) => saveField('description', v)} class="block">
			{#snippet children(displayValue)}
				<p class="mx-auto mt-6 max-w-xl text-lg text-surface-300">{displayValue}</p>
			{/snippet}
		</EditableField>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<EditableField fieldKey="CTA.ctaPrimary" label="Кнопка 1" value={String(data?.ctaPrimary ?? 'Позвонить нам')} {isEditable} onSave={(v) => saveField('ctaPrimary', v)}>
				{#snippet children(displayValue)}
					<a href={String(data?.ctaPrimaryLink ?? '/contacts')} class="inline-flex items-center gap-3 rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30">
						{displayValue}
					</a>
				{/snippet}
			</EditableField>
			<EditableField fieldKey="CTA.ctaSecondary" label="Кнопка 2" value={String(data?.ctaSecondary ?? 'Оставить заявку')} {isEditable} onSave={(v) => saveField('ctaSecondary', v)}>
				{#snippet children(displayValue)}
					<a href={String(data?.ctaSecondaryLink ?? '/contacts')} class="inline-flex items-center gap-2 rounded-xl border border-surface-500 px-8 py-4 text-sm font-semibold tracking-wide text-surface-200 transition-all duration-300 hover:border-surface-300 hover:text-white">
						{displayValue}
					</a>
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
