<script lang="ts">
	// Артикул: 1.27.3.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { getAuthApiUrl } from '$lib/utils/config';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { cleanPhone } from '$lib/utils/phone';
	import { onApplyRequest, VACANCY_FORM_ID } from './apply';
	import { revealOnScroll } from './theme';
	import './theme.css';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'light'));

	/** Акцент страницы — тот же индиго, что в списке позиций. */
	const accent = $derived(isLight ? 'text-cat-4-600' : 'text-cat-4-300');
	const diamond = $derived(isLight ? 'border-cat-4-500/70' : 'border-cat-4-400/70');

	/**
	 * Список позиций для выбора.
	 *
	 * ⚠️ Он живёт в данных ЭТОГО блока, а не берётся из VacancyList: блоки
	 * страницы независимы, у каждого свой blob, и тенант вправе поставить
	 * форму без описи. Плата за независимость — два списка: правя вакансии
	 * в описи, названия здесь тоже надо обновить. Позиция, пришедшая по
	 * «Откликнуться» и отсутствующая в списке, добавляется на лету — то есть
	 * расхождение мешает выбрать руками, но отклик не ломает.
	 */
	const defaultPositions = [
		'Плиточник',
		'Менеджер по продажам',
		'Дизайнер мебели',
		'Куратор проектов'
	];

	const positions = $derived(
		Array.isArray(data?.positions) && (data.positions as unknown[]).length > 0
			? (data.positions as string[])
			: defaultPositions
	);

	let name = $state('');
	let phone = $state('');
	let position = $state('');
	let about = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let errorMessage = $state('');

	/** Позиция, выбранная по «Откликнуться» и отсутствующая в описи. */
	const options = $derived(
		position && !positions.includes(position) ? [...positions, position] : positions
	);

	onMount(() =>
		onApplyRequest((title) => {
			position = title;
			sent = false;
		})
	);

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'VacancyForm', updated);
		data = updated;
	}

	/**
	 * Отправка отклика.
	 *
	 * Отклик уходит письмом на почту сайта (`/notify/service-request`) и в CRM
	 * НЕ попадает: строку там заводит `submitServiceRequest`, а его тип заявки —
	 * закрытый перечень из шести услуг, и вакансия услугой не является.
	 * Заводить её седьмой означало бы смешать отклики соискателей с заявками
	 * клиентов в одной таблице — это решение продукта, а не блока.
	 *
	 * Ключ поля — `service_type`, как требует контроллер; `form_type` он не
	 * знает и отклоняет заявку с 422.
	 */
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (sending) return;

		sending = true;
		errorMessage = '';

		try {
			const response = await fetch(`${getAuthApiUrl()}/notify/service-request`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({
					service_type: 'vacancy',
					name: name.trim(),
					phone: cleanPhone(phone),
					// Позиция и рассказ о себе — одно поле: своего места под вакансию
					// у заявки нет, а письмо читает человек.
					message: [`Вакансия: ${position || 'любая подходящая позиция'}`, about.trim()]
						.filter(Boolean)
						.join('\n\n')
						.slice(0, 2000),
					source_url: typeof window === 'undefined' ? null : window.location.href
				})
			});

			const result = await response.json().catch(() => null);
			if (!response.ok || !result?.success) throw new Error('reject');

			sent = true;
			name = '';
			phone = '';
			about = '';
		} catch {
			errorMessage = 'Не удалось отправить отклик. Попробуйте ещё раз или позвоните нам.';
		} finally {
			sending = false;
		}
	}
</script>

<!--
	Отклик на вакансию — закрывающий блок страницы.

	Анатомия закрывающей секции шаблона: метка с выносными линиями → заголовок →
	линия с ромбом → подзаголовок → действие.
-->
<section
	class="p1-surface relative isolate overflow-hidden py-section-sm"
	data-p1-theme={isLight ? 'light' : 'dark'}
	id={VACANCY_FORM_ID}
>
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="VacancyForm"
		themeToggle
		themeDefault="light"
		title="Отклик на вакансию"
	/>

	<div use:revealOnScroll class="vc-reveal relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="VacancyForm.label"
				label="Метка"
				value={String(data?.label ?? 'Отклик на вакансию')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
				class="vc-item block"
			>
				{#snippet children(displayValue)}
					<span class="p1-label p1-muted inline-flex items-center gap-4">
						<span class="w-8 border-t {diamond}" aria-hidden="true"></span>
						{displayValue}
						<span class="w-8 border-t {diamond}" aria-hidden="true"></span>
					</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="VacancyForm.title"
				label="Заголовок"
				value={String(data?.title ?? 'Напишите нам')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="vc-item vc-d1 mt-5 block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title text-4xl text-pretty sm:text-5xl">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<div class="vc-rule vc-d2 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
				<span class="p1-line flex-1 border-t"></span>
				<span class="size-1.5 rotate-45 border {diamond}"></span>
				<span class="p1-line flex-1 border-t"></span>
			</div>

			<EditableField
				fieldKey="VacancyForm.description"
				label="Подзаголовок"
				value={String(
					data?.description ??
						'Укажите имя и телефон — мы свяжемся с вами, обсудим детали и договоримся о встрече.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="vc-item vc-d3 mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="p1-body mx-auto max-w-lg text-base/7 text-pretty">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		{#if sent}
			<div class="vc-card p1-card mt-10 rounded-3xl border p-10 text-center">
				<div
					class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-cat-4-500/10 {accent}"
					aria-hidden="true"
				>
					<svg
						class="size-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="1.5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
					</svg>
				</div>
				<p class="p1-title-sub p1-title mt-5 text-xl">Отклик отправлен</p>
				<p class="p1-body mt-2.5 text-sm/6">
					Мы прочитаем его в ближайший рабочий день и позвоним по указанному номеру.
				</p>
				<button
					type="button"
					class="p1-border p1-title mt-7 inline-flex cursor-pointer items-center rounded-full border px-6 py-3 text-sm font-semibold transition duration-300 hover:border-cat-4-500"
					onclick={() => (sent = false)}
				>
					Отправить ещё один
				</button>
			</div>
		{:else}
			<form class="mt-10 flex flex-col gap-4" onsubmit={submit}>
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="flex flex-col gap-2">
						<span class="p1-label p1-muted">Имя</span>
						<input
							class="p1-field rounded-xl border px-4 py-3.5 text-base"
							type="text"
							required
							autocomplete="name"
							placeholder="Как к вам обращаться"
							bind:value={name}
						/>
					</label>
					<label class="flex flex-col gap-2">
						<span class="p1-label p1-muted">Телефон</span>
						<input
							class="p1-field rounded-xl border px-4 py-3.5 text-base"
							type="tel"
							required
							autocomplete="tel"
							placeholder="+7 900 000-00-00"
							bind:value={phone}
						/>
					</label>
				</div>

				<label class="flex flex-col gap-2">
					<span class="p1-label p1-muted">Вакансия</span>
					<select class="p1-field rounded-xl border px-4 py-3.5 text-base" bind:value={position}>
						<option value="">Любая подходящая позиция</option>
						{#each options as option (option)}
							<option value={option}>{option}</option>
						{/each}
					</select>
				</label>

				<label class="flex flex-col gap-2">
					<span class="p1-label p1-muted">О себе</span>
					<textarea
						class="p1-field resize-y rounded-xl border px-4 py-3.5 text-base/7"
						rows="4"
						maxlength="1800"
						placeholder="Коротко об опыте или ссылка на резюме"
						bind:value={about}
					></textarea>
				</label>

				{#if errorMessage}
					<p class="p1-note text-brand-600" role="alert">{errorMessage}</p>
				{/if}

				<div class="mt-2 flex flex-wrap items-center justify-between gap-4">
					<EditableField
						fieldKey="VacancyForm.consent"
						label="Согласие на обработку данных"
						value={String(
							data?.consent ?? 'Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('consent', v)}
						class="max-w-xs"
					>
						{#snippet children(displayValue)}
							<p class="p1-note p1-muted">{displayValue}</p>
						{/snippet}
					</EditableField>

					<button
						type="submit"
						class="p1-border p1-title inline-flex shrink-0 cursor-pointer items-center gap-2.5 rounded-full border px-8 py-3.5 text-sm font-semibold transition duration-300 hover:border-cat-4-500 disabled:cursor-default disabled:opacity-60"
						disabled={sending}
					>
						{sending ? 'Отправляем…' : 'Отправить отклик'}
						<span aria-hidden="true">→</span>
					</button>
				</div>
			</form>
		{/if}
	</div>
</section>
