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
		await saveComponentData(editContext, 'InstallmentPlans', updated);
		data = updated;
	}

	const defaultPlans = [
		{ months: '6',  unit: 'месяцев', rate: '0%',  rateLabel: 'переплата', badge: 'Популярно',   badgeColor: 'emerald', featured: false, downPayment: 'от 0%',  features: ['Первый взнос от 0%', 'Без скрытых комиссий', 'Быстрое одобрение'] },
		{ months: '10', unit: 'месяцев', rate: '0%',  rateLabel: 'переплата', badge: 'Оптимально',  badgeColor: 'sky',     featured: false, downPayment: 'от 10%', features: ['Первый взнос от 10%', 'Без скрытых комиссий', 'Комфортный платёж'] },
		{ months: '12', unit: 'месяцев', rate: '0%',  rateLabel: 'переплата', badge: 'Рекомендуем', badgeColor: 'white',   featured: true,  downPayment: 'от 20%', features: ['Первый взнос от 20%', 'Минимальный платёж', 'Лучшие условия'] },
		{ months: '24', unit: 'месяца',  rate: '~5%', rateLabel: 'годовых',   badge: 'Кредит',      badgeColor: 'amber',   featured: false, downPayment: 'от 20%', features: ['Первый взнос от 20%', 'Низкая ставка', 'Досрочное погашение'] },
	];

	async function updatePlan(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedPlans = [...plans];
		updatedPlans[index] = { ...updatedPlans[index], [field]: value };
		await saveField('plans', updatedPlans);
	}

	async function updatePlanFeature(planIndex: number, featureIndex: number, value: string) {
		if (!editContext) return;
		const updatedPlans = [...plans];
		const updatedFeatures = [...updatedPlans[planIndex].features];
		updatedFeatures[featureIndex] = value;
		updatedPlans[planIndex] = { ...updatedPlans[planIndex], features: updatedFeatures };
		await saveField('plans', updatedPlans);
	}

	const plans = $derived(
		Array.isArray(data?.plans) && (data.plans as unknown[]).length > 0
			? (data.plans as typeof defaultPlans)
			: defaultPlans
	);
</script>

<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
	<div class="text-center">
		<EditableField
			fieldKey="InstallmentPlans.title"
			label="Заголовок"
			value={String(data?.title ?? 'Программы рассрочки')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-4xl font-bold text-slate-900">{displayValue}</h2>
			{/snippet}
		</EditableField>
		<EditableField
			fieldKey="InstallmentPlans.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Выберите удобный срок и условия оплаты')}
			{isEditable}
			onSave={(v) => saveField('subtitle', v)}
			class="mt-4 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mt-4 max-w-2xl text-slate-600">{displayValue}</p>
			{/snippet}
		</EditableField>
	</div>

	<div class="mt-12 grid gap-8 lg:grid-cols-4">
		{#each plans as plan, i}
			{#if plan.featured}
				<div class="group relative overflow-hidden rounded-2xl bg-linear-to-br from-red-500 to-red-700 p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
					<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform duration-300 group-hover:scale-150"></div>
					<div class="relative">
						<div class="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
							<EditableField 
								fieldKey="InstallmentPlans.{i}.badge" 
								label="Бейдж" 
								value={plan.badge} 
								{isEditable} 
								inline 
								onSave={(v) => updatePlan(i, 'badge', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</div>
						<div class="mt-4">
							<span class="text-5xl font-bold text-white">
								<EditableField 
									fieldKey="InstallmentPlans.{i}.months" 
									label="Кол-во месяцев" 
									value={plan.months} 
									{isEditable} 
									inline 
									onSave={(v) => updatePlan(i, 'months', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</span>
							<span class="ml-2 text-xl text-red-200">
								<EditableField 
									fieldKey="InstallmentPlans.{i}.unit" 
									label="Ед. измерения" 
									value={plan.unit} 
									{isEditable} 
									inline 
									onSave={(v) => updatePlan(i, 'unit', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</span>
						</div>
						<div class="mt-2 text-3xl font-bold text-white">
							<EditableField 
								fieldKey="InstallmentPlans.{i}.rate" 
								label="Ставка" 
								value={plan.rate} 
								{isEditable} 
								inline 
								onSave={(v) => updatePlan(i, 'rate', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</div>
						<p class="mt-1 text-sm text-red-200">
							<EditableField 
								fieldKey="InstallmentPlans.{i}.rateLabel" 
								label="Метка ставки" 
								value={plan.rateLabel} 
								{isEditable} 
								inline 
								onSave={(v) => updatePlan(i, 'rateLabel', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</p>
						<div class="mt-6 space-y-3">
							{#each plan.features as feature, fi}
								<div class="flex items-center gap-2 text-sm text-red-100">
									<svg class="h-5 w-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									<EditableField 
										fieldKey="InstallmentPlans.{i}.features.{fi}" 
										label="Преимущество" 
										value={feature} 
										{isEditable} 
										inline 
										onSave={(v) => updatePlanFeature(i, fi, v)}
									>
										{#snippet children(val)}{val}{/snippet}
									</EditableField>
								</div>
							{/each}
						</div>
						<a href="/contact" class="mt-6 block w-full rounded-xl bg-white py-3 text-center font-semibold text-red-600 transition-all hover:bg-red-50">Оформить</a>
					</div>
				</div>
			{:else}
				<div class="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
					<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-red-50 opacity-50 transition-transform duration-300 group-hover:scale-150"></div>
					<div class="relative">
						<div class="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
							<EditableField 
								fieldKey="InstallmentPlans.{i}.badge" 
								label="Бейдж" 
								value={plan.badge} 
								{isEditable} 
								inline 
								onSave={(v) => updatePlan(i, 'badge', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</div>
						<div class="mt-4">
							<span class="text-5xl font-bold text-slate-900">
								<EditableField 
									fieldKey="InstallmentPlans.{i}.months" 
									label="Кол-во месяцев" 
									value={plan.months} 
									{isEditable} 
									inline 
									onSave={(v) => updatePlan(i, 'months', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</span>
							<span class="ml-2 text-xl text-slate-500">
								<EditableField 
									fieldKey="InstallmentPlans.{i}.unit" 
									label="Ед. измерения" 
									value={plan.unit} 
									{isEditable} 
									inline 
									onSave={(v) => updatePlan(i, 'unit', v)}
								>
									{#snippet children(val)}{val}{/snippet}
								</EditableField>
							</span>
						</div>
						<div class="mt-2 text-3xl font-bold text-red-600">
							<EditableField 
								fieldKey="InstallmentPlans.{i}.rate" 
								label="Ставка" 
								value={plan.rate} 
								{isEditable} 
								inline 
								onSave={(v) => updatePlan(i, 'rate', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</div>
						<p class="mt-1 text-sm text-slate-500">
							<EditableField 
								fieldKey="InstallmentPlans.{i}.rateLabel" 
								label="Метка ставки" 
								value={plan.rateLabel} 
								{isEditable} 
								inline 
								onSave={(v) => updatePlan(i, 'rateLabel', v)}
							>
								{#snippet children(val)}{val}{/snippet}
							</EditableField>
						</p>
						<div class="mt-6 space-y-3">
							{#each plan.features as feature, fi}
								<div class="flex items-center gap-2 text-sm text-slate-600">
									<svg class="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
									<EditableField 
										fieldKey="InstallmentPlans.{i}.features.{fi}" 
										label="Преимущество" 
										value={feature} 
										{isEditable} 
										inline 
										onSave={(v) => updatePlanFeature(i, fi, v)}
									>
										{#snippet children(val)}{val}{/snippet}
									</EditableField>
								</div>
							{/each}
						</div>
						<a href="/contact" class="mt-6 block w-full rounded-xl bg-red-500 py-3 text-center font-semibold text-white transition-all hover:bg-red-600">Оформить</a>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</div>
