<script lang="ts">
	// Артикул: 1.8.5.1 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'InstallmentBanks', updated);
		data = updated;
	}

	const defaultBanks = ['Сбербанк', 'Т-банк', 'Альфа-Банк', 'ВТБ'];

	const banks = $derived(
		Array.isArray(data?.banks) && (data.banks as unknown[]).length > 0
			? (data.banks as string[])
			: defaultBanks
	);
</script>

<section class="relative isolate overflow-hidden bg-white py-24">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="it-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="it-reveal text-center">
			<EditableField
				fieldKey="InstallmentBanks.title"
				label="Заголовок"
				value={String(data?.title ?? 'Банки-партнёры')}
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
				fieldKey="InstallmentBanks.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Работаем с надёжными финансовыми организациями')}
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

		<div use:revealOnScroll class="it-reveal mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
			{#each banks as bank, i}
				<div
					class="it-card group relative flex h-28 items-center justify-center overflow-hidden rounded-3xl border border-slate-900/10 bg-white px-6 shadow-[0_24px_60px_-45px_rgba(15,23,42,0.4)] transition duration-300 hover:border-red-500/40 hover:shadow-[0_30px_70px_-40px_rgba(15,23,42,0.5)] motion-safe:hover:-translate-y-1"
					style="--it-delay: {i * 70}ms"
				>
					<div
						class="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-red-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						aria-hidden="true"
					></div>
					<div
						class="pointer-events-none absolute inset-0 bg-linear-to-b from-slate-50 to-transparent"
						aria-hidden="true"
					></div>
					<span
						class="relative text-lg font-semibold tracking-[-0.01em] text-slate-500 transition-colors duration-300 group-hover:text-slate-900 sm:text-xl"
					>
						{bank}
					</span>
				</div>
			{/each}
		</div>
	</div>
</section>
