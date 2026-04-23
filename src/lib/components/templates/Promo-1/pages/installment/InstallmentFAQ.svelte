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
		await saveComponentData(editContext, 'InstallmentFAQ', updated);
		data = updated;
	}

	const defaultItems = [
		{ question: 'Можно ли погасить рассрочку досрочно?',  answer: 'Да, досрочное погашение возможно без штрафов и комиссий в любой момент.' },
		{ question: 'Какой минимальный первый взнос?',         answer: 'Первый взнос зависит от программы — от 0% до 20% от стоимости заказа.' },
		{ question: 'Как быстро приходит одобрение?',          answer: 'Решение по заявке приходит в течение 15-30 минут после заполнения анкеты.' },
		{ question: 'Нужны ли поручители?',                    answer: 'Нет, для оформления рассрочки поручители не требуются.' },
	];

	const items = $derived(
		Array.isArray(data?.items) && (data.items as unknown[]).length > 0
			? (data.items as typeof defaultItems)
			: defaultItems
	);
</script>

<div class="bg-slate-50 py-24">
	<div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="InstallmentFAQ.title"
				label="Заголовок"
				value={String(data?.title ?? 'Частые вопросы')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl font-bold text-slate-900">{displayValue}</h2>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-12 space-y-4">
			{#each items as item}
				<div class="rounded-2xl bg-white p-6 shadow-sm">
					<h3 class="text-lg font-semibold text-slate-900">{item.question}</h3>
					<p class="mt-2 text-slate-600">{item.answer}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
