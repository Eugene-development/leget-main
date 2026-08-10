<script lang="ts">
	// Артикул: 1.8.2.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'InstallmentPlans', updated);
		data = updated;
	}

	const defaultPlans = [
		{
			months: '6',
			unit: 'месяцев',
			rate: '0%',
			rateLabel: 'переплата',
			badge: 'Популярно',
			badgeColor: 'emerald',
			featured: false,
			downPayment: 'от 0%',
			features: ['Первый взнос от 0%', 'Без скрытых комиссий', 'Быстрое одобрение']
		},
		{
			months: '10',
			unit: 'месяцев',
			rate: '0%',
			rateLabel: 'переплата',
			badge: 'Оптимально',
			badgeColor: 'sky',
			featured: false,
			downPayment: 'от 10%',
			features: ['Первый взнос от 10%', 'Без скрытых комиссий', 'Комфортный платёж']
		},
		{
			months: '12',
			unit: 'месяцев',
			rate: '0%',
			rateLabel: 'переплата',
			badge: 'Рекомендуем',
			badgeColor: 'white',
			featured: true,
			downPayment: 'от 20%',
			features: ['Первый взнос от 20%', 'Минимальный платёж', 'Лучшие условия']
		},
		{
			months: '24',
			unit: 'месяца',
			rate: '~5%',
			rateLabel: 'годовых',
			badge: 'Кредит',
			badgeColor: 'amber',
			featured: false,
			downPayment: 'от 20%',
			features: ['Первый взнос от 20%', 'Низкая ставка', 'Досрочное погашение']
		}
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

<!--
	ВНИМАНИЕ — стык секций: сверху в этот блок «вливается» волна из Hero
	(InstallmentHero). Заливка волны — переменная `--ih-wave` (#f8fafc), поэтому
	фон секции обязан быть ровно `bg-ink-50` и БЕЗ градиента у верхней кромки.
-->
<section class="relative isolate overflow-hidden bg-ink-50 py-16 sm:py-20">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="it-rules"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="it-reveal text-center">
			<EditableField
				fieldKey="InstallmentPlans.title"
				label="Заголовок"
				value={String(data?.title ?? 'Программы рассрочки')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="it-item block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-3xl text-pretty text-ink-900 sm:text-4xl lg:text-5xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
			<EditableField
				fieldKey="InstallmentPlans.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Выберите удобный срок и условия оплаты')}
				{isEditable}
				onSave={(v) => saveField('subtitle', v)}
				class="it-item it-d1 mt-4 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-sm/6 text-ink-600 sm:text-base/7">{displayValue}</p>
				{/snippet}
			</EditableField>
			<div class="it-rule it-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="h-px flex-1 bg-ink-900/10"></span>
				<span class="size-1.5 rotate-45 border border-brand-500/70"></span>
				<span class="h-px flex-1 bg-ink-900/10"></span>
			</div>
		</div>

		<div use:revealOnScroll class="it-reveal mt-14 grid gap-6 lg:grid-cols-4">
			{#each plans as plan, i}
				<!--
					Выделенный тариф отличается только «одеждой» (красная заливка вместо
					белой карточки) — структура и порядок полей у обоих вариантов общие.
				-->
				<div
					class="it-card group relative flex flex-col overflow-hidden rounded-3xl p-8 transition duration-300 motion-safe:hover:-translate-y-1 {plan.featured
						? 'border border-brand-400/40 bg-linear-to-br from-brand-500 to-brand-700 shadow-[0_40px_90px_-45px] shadow-brand-700/80 hover:shadow-[0_46px_100px_-40px] hover:shadow-brand-700/90'
						: 'border border-ink-900/10 bg-surface-raised shadow-[0_30px_80px_-50px] shadow-ink-900/35 hover:border-brand-500/40 hover:shadow-[0_36px_90px_-44px] hover:shadow-ink-900/45'}"
					style="--it-delay: {i * 70}ms"
				>
					<div
						class="pointer-events-none absolute inset-x-8 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100 {plan.featured
							? 'bg-linear-to-r from-transparent via-surface-raised/80 to-transparent'
							: 'bg-linear-to-r from-transparent via-brand-500 to-transparent'}"
						aria-hidden="true"
					></div>
					<div
						class="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full blur-2xl transition-opacity duration-500 {plan.featured
							? 'bg-on-dark/20 opacity-60 group-hover:opacity-100'
							: 'bg-brand-500/10 opacity-0 group-hover:opacity-100'}"
						aria-hidden="true"
					></div>

					<div class="relative flex flex-1 flex-col">
						<div
							class="inline-flex self-start rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase {plan.featured
								? 'bg-on-dark/20 text-on-dark ring-1 ring-on-dark/30'
								: 'bg-brand-50 text-brand-700 ring-1 ring-brand-500/20'}"
						>
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

						<div class="mt-6 flex items-baseline gap-2">
							<span
								class="text-5xl font-semibold tracking-[-0.04em] tabular-nums {plan.featured
									? 'text-on-dark'
									: 'text-ink-900'}"
							>
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
							<span class="text-base {plan.featured ? 'text-brand-100' : 'text-ink-500'}">
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

						<div
							class="mt-5 flex items-baseline gap-2 border-t pt-5 {plan.featured
								? 'border-on-dark/20'
								: 'border-ink-900/10'}"
						>
							<span
								class="text-3xl font-semibold tracking-[-0.03em] tabular-nums {plan.featured
									? 'text-on-dark'
									: 'text-brand-600'}"
							>
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
							</span>
							<span
								class="text-[11px] font-semibold tracking-[0.16em] uppercase {plan.featured
									? 'text-brand-100'
									: 'text-ink-500'}"
							>
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
							</span>
						</div>

						<div class="mt-6 space-y-3">
							{#each plan.features as feature, fi}
								<div
									class="flex items-start gap-2.5 text-sm/6 {plan.featured
										? 'text-brand-50'
										: 'text-ink-600'}"
								>
									<span
										class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full {plan.featured
											? 'bg-on-dark/20 text-on-dark'
											: 'bg-brand-50 text-brand-600'}"
										aria-hidden="true"
									>
										<svg
											class="size-3.5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="3"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
										</svg>
									</span>
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

						<a
							href="/contact"
							class="group/btn mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 {plan.featured
								? 'bg-surface-raised text-brand-600 shadow-[0_18px_40px_-18px] shadow-scrim/50 hover:bg-brand-50 focus-visible:outline-on-dark'
								: 'bg-brand-500 text-on-accent shadow-[0_18px_45px_-18px] shadow-brand-500/90 hover:bg-brand-400 focus-visible:outline-brand-400'}"
						>
							Оформить
							<span
								class="transition-transform duration-300 group-hover/btn:translate-x-1"
								aria-hidden="true">&rarr;</span
							>
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
