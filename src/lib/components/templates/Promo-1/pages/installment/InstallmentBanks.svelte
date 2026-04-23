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

<div class="bg-white py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="InstallmentBanks.title"
				label="Заголовок"
				value={String(data?.title ?? 'Банки-партнёры')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl font-bold text-slate-900">{displayValue}</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="InstallmentBanks.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Работаем с надёжными финансовыми организациями')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-2xl text-slate-600">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
			{#each banks as bank}
				<div class="flex h-24 items-center justify-center rounded-xl bg-slate-50 p-6">
					<span class="text-xl font-bold text-slate-400">{bank}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
