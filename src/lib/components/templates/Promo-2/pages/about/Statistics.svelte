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
		await saveComponentData(editContext, 'Statistics', updated);
		data = updated;
	}

	// Default statistics data
	const stats = [
		{
			value: data?.stat1_value ?? '15+',
			label: data?.stat1_label ?? 'Лет опыта'
		},
		{
			value: data?.stat2_value ?? '500+',
			label: data?.stat2_label ?? 'Довольных клиентов'
		},
		{
			value: data?.stat3_value ?? '1000+',
			label: data?.stat3_label ?? 'Проектов реализовано'
		},
		{
			value: data?.stat4_value ?? '50+',
			label: data?.stat4_label ?? 'Сотрудников'
		}
	];
</script>

<section class="relative overflow-hidden bg-stone-900 px-6 py-20 text-white lg:py-32">
	<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#78350f22,transparent_60%)]"></div>
	<div class="relative mx-auto max-w-6xl">
		<div class="mb-16 text-center">
			<EditableField
				fieldKey="Statistics.title"
				label="Заголовок"
				value={String(data?.title ?? 'Наши достижения')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-4xl font-light tracking-tight sm:text-5xl">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Statistics.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? '')}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					{#if displayValue}
						<p class="mt-4 max-w-2xl mx-auto text-xl text-stone-300">{displayValue}</p>
					{/if}
				{/snippet}
			</EditableField>
		</div>

		<div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each stats as stat, index}
				<div class="relative group">
					<div class="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
					<div class="relative rounded-lg border border-stone-700 bg-stone-800/50 p-8 text-center backdrop-blur-sm transition-all duration-300 group-hover:border-amber-700/50 group-hover:bg-stone-800/80">
						<EditableField
							fieldKey={`Statistics.stat${index + 1}_value`}
							label={`Значение ${index + 1}`}
							value={String(stat.value)}
							{isEditable}
							onSave={(v) => saveField(`stat${index + 1}_value`, v)}
							class="block"
						>
							{#snippet children(displayValue)}
								<div class="text-4xl font-light text-amber-400 sm:text-5xl">{displayValue}</div>
							{/snippet}
						</EditableField>

						<EditableField
							fieldKey={`Statistics.stat${index + 1}_label`}
							label={`Описание ${index + 1}`}
							value={String(stat.label)}
							{isEditable}
							onSave={(v) => saveField(`stat${index + 1}_label`, v)}
							class="mt-3 block"
						>
							{#snippet children(displayValue)}
								<p class="text-sm text-stone-300 uppercase tracking-wide">{displayValue}</p>
							{/snippet}
						</EditableField>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
