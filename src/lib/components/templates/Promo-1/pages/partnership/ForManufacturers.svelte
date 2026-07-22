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
		await saveComponentData(editContext, 'ForManufacturers', updated);
		data = updated;
	}

	const defaultStats = [
		{ value: '500+', label: 'агентов' },
		{ value: '20+',  label: 'лет опыта' },
		{ value: '140+', label: 'партнёров' },
		{ value: '90%',  label: 'конверсия' },
		{ value: '24/7', label: 'поддержка' },
		{ value: '100%', label: 'успех' },
	];

	const defaultBenefits = [
		'Продвижение вашей продукции',
		'Широкая клиентская база',
		'Профессиональные кураторы',
		'Маркетинговая поддержка',
	];

	async function updateStat(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedStats = [...stats];
		updatedStats[index] = { ...updatedStats[index], [field]: value };
		await saveField('stats', updatedStats);
	}

	async function updateBenefit(index: number, value: string) {
		if (!editContext) return;
		const updatedBenefits = [...benefits];
		updatedBenefits[index] = value;
		await saveField('benefits', updatedBenefits);
	}

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);

	const benefits = $derived(
		Array.isArray(data?.benefits) && (data.benefits as unknown[]).length > 0
			? (data.benefits as string[])
			: defaultBenefits
	);
</script>

<div class="bg-linear-to-br from-slate-800 to-slate-900 py-24">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
			<div>
				<EditableField
					fieldKey="ForManufacturers.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'Вы организация?')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline-block"
				>
					{#snippet children(displayValue)}
						<div class="inline-flex items-center rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400">
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ForManufacturers.title"
					label="Заголовок"
					value={String(data?.title ?? 'Для производителей и поставщиков')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						<h2 class="mt-6 text-3xl font-bold text-white sm:text-4xl">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ForManufacturers.text"
					label="Описание"
					value={String(data?.text ?? 'Мы готовы предложить уникальные возможности для совместного развития. Наш опыт и современные технологии маркетинга помогут привлечь новых лояльных клиентов.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('text', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="mt-6 text-lg text-slate-300">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="mt-8 space-y-4">
					{#each benefits as benefit, i}
						<div class="flex items-center gap-3 text-slate-300">
							<svg class="h-6 w-6 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
							<EditableField 
								fieldKey="ForManufacturers.benefits.{i}" 
								label="Преимущество" 
								value={benefit} 
								{isEditable} 
								inline 
								onSave={(v) => updateBenefit(i, v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</div>
					{/each}
				</div>

				<div class="mt-8 flex flex-wrap gap-4">
					<a
						href="/contact"
						class="inline-flex items-center gap-2 rounded-xl bg-red-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl"
					>
						<EditableField
							fieldKey="ForManufacturers.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Оставить заявку')}
							{isEditable}
							onSave={(v) => saveField('buttonText', v)}
							class="inline"
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
					</a>
				</div>
			</div>

			<!-- Статистика -->
			<div class="mt-12 lg:mt-0">
				<div class="grid grid-cols-2 gap-4">
					{#each stats as stat, i}
						<div class="rounded-2xl bg-white/5 p-6 backdrop-blur">
							<div class="text-4xl font-bold text-white">
								<EditableField 
									fieldKey="ForManufacturers.stats.{i}.value" 
									label="Значение" 
									value={stat.value} 
									{isEditable} 
									inline 
									onSave={(v) => updateStat(i, 'value', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</div>
							<div class="mt-2 text-slate-400">
								<EditableField 
									fieldKey="ForManufacturers.stats.{i}.label" 
									label="Метка" 
									value={stat.label} 
									{isEditable} 
									inline 
									onSave={(v) => updateStat(i, 'label', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
