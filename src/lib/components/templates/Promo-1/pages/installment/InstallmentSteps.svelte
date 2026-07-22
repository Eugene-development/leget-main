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

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'InstallmentSteps', updated);
		data = updated;
	}

	const defaultSteps = [
		{ number: '1', title: 'Выберите проект',   text: 'Подберите мебель или технику в нашем каталоге на сайте',    final: false },
		{ number: '2', title: 'Оставьте заявку',   text: 'Заполните анкету онлайн или в салоне нашего партнёра',      final: false },
		{ number: '3', title: 'Получите решение',  text: 'Одобрение как правило в течение 15 минут от банка',         final: false },
		{ number: '✓', title: 'Заберите покупку',  text: 'Подпишите договор и пользуйтесь новой мебелью или техникой', final: true },
	];

	async function updateStep(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedSteps = [...steps];
		updatedSteps[index] = { ...updatedSteps[index], [field]: value };
		await saveField('steps', updatedSteps);
	}

	const steps = $derived(
		Array.isArray(data?.steps) && (data.steps as unknown[]).length > 0
			? (data.steps as typeof defaultSteps)
			: defaultSteps
	);
</script>

<div class="bg-slate-50 py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="InstallmentSteps.title"
				label="Заголовок"
				value={String(data?.title ?? 'Как оформить рассрочку')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl font-bold text-slate-900">{displayValue}</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="InstallmentSteps.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Простой процесс за 4 шага')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-4 max-w-2xl text-slate-600">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each steps as step, i}
				<div class="relative text-center">
					<div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg
						{step.final
							? 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'
							: 'bg-linear-to-br from-red-500 to-red-600 shadow-red-500/25'}">
						{step.number}
					</div>
					<h3 class="mt-6 text-lg font-semibold text-slate-900">
						<EditableField 
							fieldKey="InstallmentSteps.{i}.title" 
							label="Заголовок шага" 
							value={step.title} 
							{isEditable} 
							inline 
							onSave={(v) => updateStep(i, 'title', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</h3>
					<p class="mt-2 text-sm text-slate-500">
						<EditableField 
							fieldKey="InstallmentSteps.{i}.text" 
							label="Описание шага" 
							value={step.text} 
							{isEditable} 
							inline 
							onSave={(v) => updateStep(i, 'text', v)}
						>
							{#snippet children(val)}{val}{/snippet}
						</EditableField>
					</p>
					{#if !step.final}
						<div class="absolute right-0 top-8 hidden h-0.5 w-full bg-linear-to-r from-red-200 to-transparent lg:block lg:w-1/2 lg:translate-x-1/2"></div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
