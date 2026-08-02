<script lang="ts">
	// Артикул: 3.9.7.1 — см. docs/architecture/component-articles-map.md
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
	<div class="absolute inset-0 bg-linear-to-br from-accent-600/20 via-surface-900 to-surface-900"></div>
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.04]"
		style="background-image: linear-gradient(rgba(201,169,110,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.5) 1px, transparent 1px); background-size: 40px 40px;"
	></div>

	<div class="relative px-8 text-center lg:px-16 xl:px-20">
		<EditableField
			fieldKey="CTA.eyebrow"
			label="Надпись над заголовком"
			value={String(data?.eyebrow ?? 'Готовы начать?')}
			{isEditable}
			onSave={(v) => saveField('eyebrow', v)}
		>
			{#snippet children(displayValue)}
				<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase">{displayValue}</span>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="CTA.title"
			label="Заголовок"
			value={String(data?.title ?? 'Готовы обсудить ваш проект?')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="mt-4 font-display text-4xl font-bold tracking-wide text-white lg:text-5xl">
					{displayValue}
				</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="CTA.subtitle"
			label="Описание"
			value={String(data?.subtitle ?? 'Оставьте заявку — мы перезвоним в течение 15 минут и ответим на все вопросы')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mt-6 max-w-xl text-lg text-surface-300">{displayValue}</p>
			{/snippet}
		</EditableField>

		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<!-- Primary -->
			<EditableField
				fieldKey="CTA.primaryButton"
				label="Основная кнопка"
				value={String(data?.primaryButton ?? 'Оставить заявку')}
				{isEditable}
				onSave={(v) => saveField('primaryButton', v)}
			>
				{#snippet children(displayValue)}
					<a
						href={String(data?.primaryHref ?? '/contacts')}
						class="group inline-flex items-center gap-3 rounded-xl bg-accent-500 px-8 py-4 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-2xl hover:shadow-accent-500/30"
					>
						{displayValue}
						<svg viewBox="0 0 20 20" class="size-4 fill-current transition-transform duration-300 group-hover:translate-x-1">
							<path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
						</svg>
					</a>
				{/snippet}
			</EditableField>

			<!-- Phone -->
			<EditableField
				fieldKey="CTA.phoneButton"
				label="Кнопка телефона"
				value={String(data?.phoneButton ?? 'Позвонить нам')}
				{isEditable}
				onSave={(v) => saveField('phoneButton', v)}
			>
				{#snippet children(displayValue)}
					<a
						href={String(data?.phoneHref ?? 'tel:+70000000000')}
						class="inline-flex items-center gap-2 rounded-xl border border-surface-500 px-8 py-4 text-sm font-semibold tracking-wide text-surface-200 transition-all duration-300 hover:border-surface-300 hover:text-white"
					>
						<svg class="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
						</svg>
						{displayValue}
					</a>
				{/snippet}
			</EditableField>
		</div>

		<!-- Trust row -->
		<div class="mx-auto mt-16 flex max-w-lg flex-wrap items-center justify-center gap-8 border-t border-surface-700/50 pt-8">
			{#each ['Безопасная сделка', 'Данные защищены', 'Без спама'] as trust}
				<div class="flex items-center gap-2 text-xs text-surface-300">
					<div class="size-1.5 rounded-full bg-accent-500/50"></div>
					{trust}
				</div>
			{/each}
		</div>
	</div>
</section>
