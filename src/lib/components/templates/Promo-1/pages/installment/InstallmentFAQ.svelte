<script lang="ts">
	// Артикул: 1.8.6.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'InstallmentFAQ', updated);
		data = updated;
	}

	const defaultItems = [
		{
			question: 'Можно ли погасить рассрочку досрочно?',
			answer: 'Да, досрочное погашение возможно без штрафов и комиссий в любой момент.'
		},
		{
			question: 'Какой минимальный первый взнос?',
			answer: 'Первый взнос зависит от программы — от 0% до 20% от стоимости заказа.'
		},
		{
			question: 'Как быстро приходит одобрение?',
			answer: 'Решение по заявке приходит в течение 15-30 минут после заполнения анкеты.'
		},
		{
			question: 'Нужны ли поручители?',
			answer: 'Нет, для оформления рассрочки поручители не требуются.'
		}
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

<section data-p1-theme="light" class="relative isolate overflow-hidden bg-ink-50 py-section-sm">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="it-rules"></div>
	</div>

	<div class="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="it-reveal text-center">
			<EditableField
				fieldKey="InstallmentFAQ.title"
				label="Заголовок"
				value={String(data?.title ?? 'Частые вопросы')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="it-item block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl text-pretty text-ink-900 sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
			<div class="it-rule it-d1 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="p1-line flex-1 border-t"></span>
				<span class="size-1.5 rotate-45 border border-brand-500/70"></span>
				<span class="p1-line flex-1 border-t"></span>
			</div>
		</div>

		<!--
			Аккордеон здесь намеренно не используется: вопрос и ответ редактируются
			прямо на странице, свёрнутый текст в режиме правки был бы недоступен.
		-->
		<div use:revealOnScroll class="it-reveal mt-12 space-y-4">
			{#each items as item, i}
				<div
					class="it-card group relative overflow-hidden rounded-3xl border border-ink-900/10 bg-surface-raised p-6 shadow-[0_24px_60px_-45px] shadow-ink-900/40 transition duration-300 hover:border-brand-500/40 hover:shadow-[0_30px_70px_-40px] hover:shadow-ink-900/50 sm:p-8"
					style="--it-delay: {i * 70}ms"
				>
					<div
						class="pointer-events-none absolute inset-y-6 left-0 w-px bg-linear-to-b from-transparent via-brand-500/70 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100"
						aria-hidden="true"
					></div>

					<div class="flex gap-4">
						<span
							class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-semibold text-brand-600 tabular-nums ring-1 ring-brand-500/20"
							aria-hidden="true"
						>
							{String(i + 1).padStart(2, '0')}
						</span>
						<div class="min-w-0">
							<h3 class="p1-title-sub text-base text-ink-900 sm:text-lg">
								<EditableField
									fieldKey="InstallmentFAQ.{i}.question"
									label="Вопрос"
									value={item.question}
									{isEditable}
									inline
									onSave={(v) => updateItem(i, 'question', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</h3>
							<p class="mt-2 text-sm/6 text-ink-600">
								<EditableField
									fieldKey="InstallmentFAQ.{i}.answer"
									label="Ответ"
									value={item.answer}
									{isEditable}
									inline
									multiline
									onSave={(v) => updateItem(i, 'answer', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
