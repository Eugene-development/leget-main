<script lang="ts">
	// Артикул: 1.8.2.1 — см. docs/architecture/component-articles-map.md
	import { tick } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import { formatPhone, isValidPhone } from '$lib/utils/phone';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { submitServiceRequest } from '$lib/utils/service-request';
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

	const MAX_FILE_SIZE = 5 * 1024 * 1024;
	const PASSPORT_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
	const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

	let isModalOpen = $state(false);
	let selectedPlanIndex = $state(0);
	let fullName = $state('');
	let phone = $state('');
	let workplace = $state('');
	let monthlyIncome = $state('');
	let passportMain = $state<File | null>(null);
	let passportRegistration = $state<File | null>(null);
	let clientPhoto = $state<File | null>(null);
	let consent = $state(false);
	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let firstInput: HTMLInputElement | undefined = $state();
	let opener: HTMLButtonElement | null = $state(null);
	let modalPanel: HTMLDivElement | undefined = $state();
	let successCloseButton: HTMLButtonElement | undefined = $state();
	let componentSection: HTMLElement | undefined = $state();

	function resetForm() {
		fullName = '';
		phone = '';
		workplace = '';
		monthlyIncome = '';
		passportMain = null;
		passportRegistration = null;
		clientPhoto = null;
		consent = false;
		fieldErrors = {};
		formError = '';
	}

	async function openApplication(index: number, event: MouseEvent) {
		selectedPlanIndex = index;
		opener = event.currentTarget as HTMLButtonElement;
		isSubmitted = false;
		formError = '';
		isModalOpen = true;
		await tick();
		firstInput?.focus();
	}

	async function closeApplication() {
		if (isSubmitting) return;
		isModalOpen = false;
		await tick();
		opener?.focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!isModalOpen) return;
		if (event.key === 'Escape') {
			void closeApplication();
			return;
		}
		if (event.key !== 'Tab' || !modalPanel) return;

		const focusable = Array.from(
			modalPanel.querySelectorAll<HTMLElement>(
				'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
			)
		).filter((element) => element.offsetParent !== null);
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) void closeApplication();
	}

	function handlePhoneInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		phone = formatPhone(input.value);
		input.value = phone;
	}

	function selectFile(
		event: Event,
		field: 'passportMain' | 'passportRegistration' | 'clientPhoto'
	) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0] ?? null;
		const allowedTypes = field === 'clientPhoto' ? PHOTO_TYPES : PASSPORT_TYPES;
		const errorKey = field;

		if (file && (!allowedTypes.has(file.type) || file.size > MAX_FILE_SIZE)) {
			fieldErrors = {
				...fieldErrors,
				[errorKey]:
					'Выберите JPG, PNG' + (field === 'clientPhoto' ? ' или WEBP' : ' или PDF') + ' до 5 МБ'
			};
			input.value = '';
			if (field === 'passportMain') passportMain = null;
			if (field === 'passportRegistration') passportRegistration = null;
			if (field === 'clientPhoto') clientPhoto = null;
			return;
		}

		fieldErrors = { ...fieldErrors, [errorKey]: '' };
		if (field === 'passportMain') passportMain = file;
		if (field === 'passportRegistration') passportRegistration = file;
		if (field === 'clientPhoto') clientPhoto = file;
	}

	function validateApplication() {
		const errors: Record<string, string> = {};
		if (!fullName.trim()) errors.fullName = 'Укажите ФИО';
		if (!phone.trim()) errors.phone = 'Укажите телефон';
		else if (!isValidPhone(phone)) errors.phone = 'Проверьте номер телефона';
		if (!workplace.trim()) errors.workplace = 'Укажите место работы';
		if (!monthlyIncome.trim() || Number(monthlyIncome) <= 0) {
			errors.monthlyIncome = 'Укажите ежемесячный доход';
		}
		if (!passportMain) errors.passportMain = 'Добавьте главную страницу паспорта';
		if (!passportRegistration) errors.passportRegistration = 'Добавьте страницу регистрации';
		if (!clientPhoto) errors.clientPhoto = 'Добавьте ваше фото';
		if (!consent) errors.consent = 'Подтвердите согласие на обработку данных';
		fieldErrors = errors;
		if (Object.keys(errors).length > 0) {
			void tick().then(() =>
				modalPanel?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
			);
		}
		return Object.keys(errors).length === 0;
	}

	async function submitApplication(event: SubmitEvent) {
		event.preventDefault();
		if (
			isSubmitting ||
			!validateApplication() ||
			!passportMain ||
			!passportRegistration ||
			!clientPhoto
		) {
			return;
		}

		isSubmitting = true;
		formError = '';
		const plan = plans[selectedPlanIndex];

		try {
			await submitServiceRequest({
				serviceType: 'installment',
				formId: 'promo1-installment',
				name: fullName,
				phone,
				city: cityStore.city,
				sourceUrl: typeof window === 'undefined' ? null : window.location.href,
				message: [
					`Срок: ${plan.months} ${plan.unit}`,
					`Условия: ${plan.rate} ${plan.rateLabel}, первый взнос ${plan.downPayment}`,
					`Место работы: ${workplace.trim()}`,
					`Ежемесячный доход: ${Number(monthlyIncome).toLocaleString('ru-RU')} ₽`
				].join('\n'),
				attachments: { passportMain, passportRegistration, clientPhoto }
			});
			isSubmitted = true;
			resetForm();
			await tick();
			successCloseButton?.focus();
		} catch {
			formError = 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.';
		} finally {
			isSubmitting = false;
		}
	}

	$effect(() => {
		if (typeof document === 'undefined' || !isModalOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		if (componentSection) componentSection.inert = true;
		return () => {
			document.body.style.overflow = previousOverflow;
			if (componentSection) componentSection.inert = false;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!--
	ВНИМАНИЕ — стык секций: сверху в этот блок «вливается» волна из Hero
	(InstallmentHero). Заливка волны — переменная `--ih-wave` (#f8fafc), поэтому
	фон секции обязан быть ровно `bg-ink-50` и БЕЗ градиента у верхней кромки.
-->
<section
	bind:this={componentSection}
	data-p1-theme="light"
	class="relative isolate overflow-hidden bg-ink-50 py-section-xs sm:py-section-sm"
>
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
						<RichText value={displayValue} />
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
					<p class="mx-auto max-w-2xl text-sm/6 text-ink-600 sm:text-base/7">
						<RichText value={displayValue} />
					</p>
				{/snippet}
			</EditableField>
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
								{#snippet children(val)}<RichText value={val} />{/snippet}
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
									{#snippet children(val)}<RichText value={val} />{/snippet}
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
									{#snippet children(val)}<RichText value={val} />{/snippet}
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
									{#snippet children(val)}<RichText value={val} />{/snippet}
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
									{#snippet children(val)}<RichText value={val} />{/snippet}
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
										{#snippet children(val)}<RichText value={val} />{/snippet}
									</EditableField>
								</div>
							{/each}
						</div>

						<button
							data-metrika-goal="pages_installment_installmentplans_open_1"
							data-goal-action="open"
							type="button"
							onclick={(event) => openApplication(i, event)}
							class="group/btn mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 {plan.featured
								? 'bg-surface-raised text-brand-600 shadow-[0_18px_40px_-18px] shadow-scrim/50 hover:bg-brand-50 focus-visible:outline-on-dark'
								: 'bg-brand-500 text-on-accent shadow-[0_18px_45px_-18px] shadow-brand-500/90 hover:bg-brand-400 focus-visible:outline-brand-400'}"
						>
							Оформить
							<span
								class="transition-transform duration-300 group-hover/btn:translate-x-1"
								aria-hidden="true">&rarr;</span
							>
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

{#if isModalOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		data-p1-theme="light"
		class="fixed inset-0 z-200 flex items-end justify-center overflow-y-auto bg-scrim/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 180 }}
	>
		<div
			bind:this={modalPanel}
			class="relative max-h-[calc(100dvh-1rem)] w-full max-w-3xl overflow-y-auto rounded-t-3xl border border-ink-900/10 bg-surface-raised shadow-[0_30px_100px_-35px] shadow-scrim/70 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl"
			role="dialog"
			aria-modal="true"
			aria-labelledby="installment-modal-title"
			transition:fly={{ y: 28, duration: 260, easing: cubicOut }}
		>
			<div
				class="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-ink-900/10 bg-surface-raised/95 px-5 py-5 backdrop-blur-lg sm:px-8"
			>
				<div>
					<p class="p1-label text-brand-600">
						{plans[selectedPlanIndex].months}
						{plans[selectedPlanIndex].unit}
					</p>
					<h2 id="installment-modal-title" class="mt-1 text-2xl text-ink-900 sm:text-3xl">
						Заявка на рассрочку
					</h2>
				</div>
				<button
					data-metrika-goal="pages_installment_installmentplans_close_1"
					data-goal-action="close"
					type="button"
					onclick={closeApplication}
					disabled={isSubmitting}
					class="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-ink-900/10 text-ink-600 transition duration-[var(--ds-motion-duration-ui)] ease-ui hover:border-brand-500/40 hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600 disabled:cursor-not-allowed disabled:opacity-50"
					aria-label="Закрыть форму"
				>
					<svg
						class="size-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						aria-hidden="true"
					>
						<path stroke-linecap="round" d="M6 6l12 12M18 6L6 18" />
					</svg>
				</button>
			</div>

			{#if isSubmitted}
				<div class="px-5 py-14 text-center sm:px-8 sm:py-16" aria-live="polite">
					<div
						class="mx-auto flex size-14 items-center justify-center rounded-full bg-cat-2-500/10 text-cat-2-600"
						aria-hidden="true"
					>
						<svg
							class="size-7"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h3 class="p1-title-sub mt-5 text-xl text-ink-900">Заявка принята</h3>
					<p class="mx-auto mt-2 max-w-md text-sm/6 text-ink-600">
						Мы проверим данные и свяжемся с вами по указанному телефону.
					</p>
					<button
						data-metrika-goal="pages_installment_installmentplans_close_2"
						data-goal-action="close"
						bind:this={successCloseButton}
						type="button"
						onclick={closeApplication}
						class="mt-7 min-h-11 rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-on-accent transition duration-[var(--ds-motion-duration-ui)] ease-ui hover:bg-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600"
					>
						Закрыть
					</button>
				</div>
			{:else}
				<form class="px-5 py-6 sm:px-8 sm:py-8" onsubmit={submitApplication} novalidate>
					<div class="grid gap-5 sm:grid-cols-2">
						<label class="flex flex-col gap-2 sm:col-span-2">
							<span class="p1-label text-ink-700">ФИО</span>
							<input
								bind:this={firstInput}
								bind:value={fullName}
								type="text"
								autocomplete="name"
								class="p1-field min-h-12 rounded-xl border px-4 py-3 text-base"
								class:border-cat-6-500={fieldErrors.fullName}
								placeholder="Иванов Иван Иванович"
								aria-invalid={Boolean(fieldErrors.fullName)}
							/>
							{#if fieldErrors.fullName}<span class="text-xs text-cat-6-600"
									>{fieldErrors.fullName}</span
								>{/if}
						</label>

						<label class="flex flex-col gap-2">
							<span class="p1-label text-ink-700">Телефон</span>
							<input
								id="installment-phone"
								value={phone}
								oninput={handlePhoneInput}
								type="tel"
								autocomplete="tel"
								inputmode="tel"
								class="p1-field min-h-12 rounded-xl border px-4 py-3 text-base"
								class:border-cat-6-500={fieldErrors.phone}
								placeholder="+7 (900) 000-00-00"
								aria-invalid={Boolean(fieldErrors.phone)}
							/>
							{#if fieldErrors.phone}<span class="text-xs text-cat-6-600">{fieldErrors.phone}</span
								>{/if}
						</label>

						<label class="flex flex-col gap-2">
							<span class="p1-label text-ink-700">Место работы</span>
							<input
								bind:value={workplace}
								type="text"
								autocomplete="organization"
								class="p1-field min-h-12 rounded-xl border px-4 py-3 text-base"
								class:border-cat-6-500={fieldErrors.workplace}
								placeholder="Название организации"
								aria-invalid={Boolean(fieldErrors.workplace)}
							/>
							{#if fieldErrors.workplace}<span class="text-xs text-cat-6-600"
									>{fieldErrors.workplace}</span
								>{/if}
						</label>

						<label class="flex flex-col gap-2 sm:col-span-2">
							<span class="p1-label text-ink-700">Ежемесячный доход</span>
							<div class="relative">
								<input
									bind:value={monthlyIncome}
									type="number"
									min="1"
									step="1000"
									inputmode="numeric"
									class="p1-field min-h-12 w-full rounded-xl border px-4 py-3 pr-12 text-base"
									class:border-cat-6-500={fieldErrors.monthlyIncome}
									placeholder="80 000"
									aria-invalid={Boolean(fieldErrors.monthlyIncome)}
								/>
								<span
									class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-ink-500"
									>₽</span
								>
							</div>
							{#if fieldErrors.monthlyIncome}<span class="text-xs text-cat-6-600"
									>{fieldErrors.monthlyIncome}</span
								>{/if}
						</label>
					</div>

					<fieldset class="mt-7">
						<legend class="p1-title-sub text-base text-ink-900">Скан паспорта</legend>
						<p class="mt-1 text-xs/5 text-ink-500">JPG, PNG или PDF</p>
						<div class="mt-3 grid gap-3 sm:grid-cols-2">
							<label
								class="flex min-h-24 cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-ink-900/20 px-4 py-3 transition duration-[var(--ds-motion-duration-ui)] ease-ui focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-link-600 hover:border-brand-500/50"
							>
								<span class="text-sm font-semibold text-ink-800">Главная страница</span>
								<span class="mt-1 truncate text-xs text-ink-500"
									>{passportMain?.name ?? 'Выбрать файл'}</span
								>
								<input
									class="sr-only"
									type="file"
									accept="image/jpeg,image/png,application/pdf"
									onchange={(event) => selectFile(event, 'passportMain')}
								/>
								{#if fieldErrors.passportMain}<span class="mt-1 text-xs text-cat-6-600"
										>{fieldErrors.passportMain}</span
									>{/if}
							</label>
							<label
								class="flex min-h-24 cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-ink-900/20 px-4 py-3 transition duration-[var(--ds-motion-duration-ui)] ease-ui focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-link-600 hover:border-brand-500/50"
							>
								<span class="text-sm font-semibold text-ink-800">Страница регистрации</span>
								<span class="mt-1 truncate text-xs text-ink-500"
									>{passportRegistration?.name ?? 'Выбрать файл'}</span
								>
								<input
									class="sr-only"
									type="file"
									accept="image/jpeg,image/png,application/pdf"
									onchange={(event) => selectFile(event, 'passportRegistration')}
								/>
								{#if fieldErrors.passportRegistration}<span class="mt-1 text-xs text-cat-6-600"
										>{fieldErrors.passportRegistration}</span
									>{/if}
							</label>
						</div>
					</fieldset>

					<label
						class="mt-5 flex min-h-24 cursor-pointer flex-col justify-center rounded-2xl border border-dashed border-ink-900/20 px-4 py-3 transition duration-[var(--ds-motion-duration-ui)] ease-ui focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-link-600 hover:border-brand-500/50"
					>
						<span class="text-sm font-semibold text-ink-800">Ваше фото</span>
						<span class="mt-1 truncate text-xs text-ink-500"
							>{clientPhoto?.name ?? 'Выбрать JPG, PNG или WEBP'}</span
						>
						<input
							class="sr-only"
							type="file"
							accept="image/jpeg,image/png,image/webp"
							onchange={(event) => selectFile(event, 'clientPhoto')}
						/>
						{#if fieldErrors.clientPhoto}<span class="mt-1 text-xs text-cat-6-600"
								>{fieldErrors.clientPhoto}</span
							>{/if}
					</label>

					<label class="mt-6 flex min-h-11 cursor-pointer items-start gap-3 text-xs/5 text-ink-600">
						<input
							bind:checked={consent}
							type="checkbox"
							class="mt-0.5 size-4 shrink-0 accent-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600"
							aria-invalid={Boolean(fieldErrors.consent)}
						/>
						<span
							>Я согласен на обработку персональных данных и документов для рассмотрения заявки на
							рассрочку.</span
						>
					</label>
					{#if fieldErrors.consent}<p class="mt-1 text-xs text-cat-6-600">
							{fieldErrors.consent}
						</p>{/if}

					{#if formError}
						<p
							class="text-cat-6-700 mt-5 rounded-xl border border-cat-6-500/20 bg-cat-6-500/10 px-4 py-3 text-sm"
							role="alert"
						>
							{formError}
						</p>
					{/if}

					<button
						data-metrika-goal="pages_installment_installmentplans_submit_click_1"
						data-goal-action="submit_click"
						type="submit"
						disabled={isSubmitting}
						class="mt-7 inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-on-accent transition duration-[var(--ds-motion-duration-ui)] ease-ui hover:bg-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600 disabled:cursor-wait disabled:opacity-60"
					>
						{isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
					</button>
				</form>
			{/if}
		</div>
	</div>
{/if}
