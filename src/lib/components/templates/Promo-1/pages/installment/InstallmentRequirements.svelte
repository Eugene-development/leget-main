<script lang="ts">
	// Артикул: 1.8.3.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'InstallmentRequirements', updated);
		data = updated;
	}

	const defaultItems = [
		{ title: 'Паспорт РФ',       text: 'Действующий паспорт гражданина Российской Федерации', color: 'from-red-500 to-red-600 shadow-red-500/25' },
		{ title: 'Стабильный доход', text: 'Официальное трудоустройство или подтверждение дохода', color: 'from-emerald-500 to-teal-600 shadow-emerald-500/25' },
		{ title: 'Хорошая КИ',       text: 'Положительная кредитная история для быстрого одобрения', color: 'from-sky-500 to-blue-600 shadow-sky-500/25' },
	];

	async function updateItem(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedItems = [...items];
		updatedItems[index] = { ...updatedItems[index], [field]: value };
		await saveField('items', updatedItems);
	}

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);
</script>

<section class="relative isolate overflow-hidden bg-white py-24">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="it-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="it-reveal text-center">
			<EditableField
				fieldKey="InstallmentRequirements.title"
				label="Заголовок"
				value={String(data?.title ?? 'Что нужно для оформления')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="it-item block"
			>
				{#snippet children(displayValue)}
					<h2
						class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-slate-900 sm:text-4xl"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="InstallmentRequirements.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Минимум документов — максимум удобства')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="it-item it-d1 mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-sm/6 text-slate-600 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>
			<div class="it-rule it-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-slate-900/10"></span>
				<span class="size-1.5 rotate-45 border border-red-500/70"></span>
				<span class="h-px flex-1 bg-slate-900/10"></span>
			</div>
		</div>

		<div use:revealOnScroll class="it-reveal mt-14 grid gap-6 sm:grid-cols-3">
			{#each items as item, i}
				<div
					class="it-card group relative overflow-hidden rounded-3xl border border-slate-900/10 bg-white p-8 text-center shadow-[0_30px_80px_-50px_rgba(15,23,42,0.35)] transition duration-300 hover:border-slate-900/20 hover:shadow-[0_36px_90px_-44px_rgba(15,23,42,0.45)] motion-safe:hover:-translate-y-1"
					style="--it-delay: {i * 80}ms"
				>
					<!-- Подложка-градиент от прежней версии, теперь только у нижней части карточки -->
					<div
						class="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-slate-50 to-transparent"
						aria-hidden="true"
					></div>
					<span
						class="pointer-events-none absolute top-5 left-6 text-3xl font-semibold tabular-nums text-slate-900/10"
						aria-hidden="true"
					>
						{String(i + 1).padStart(2, '0')}
					</span>

					<div class="relative">
						<!-- Цвет плитки приходит из данных (item.color) — палитру не меняем -->
						<div
							class="mx-auto flex size-16 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-lg ring-1 ring-white/25 transition-transform duration-300 motion-safe:group-hover:-rotate-6 {item.color}"
						>
							<svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
							</svg>
						</div>

						<h3 class="mt-6 text-xl font-semibold tracking-[-0.01em] text-slate-900">
							<EditableField
								fieldKey="InstallmentRequirements.{i}.title"
								label="Заголовок требования"
								value={item.title}
								{isEditable}
								inline
								onSave={(v) => updateItem(i, 'title', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</h3>
						<p class="mx-auto mt-3 max-w-xs text-sm/6 text-slate-600">
							<EditableField
								fieldKey="InstallmentRequirements.{i}.text"
								label="Описание требования"
								value={item.text}
								{isEditable}
								inline
								onSave={(v) => updateItem(i, 'text', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
