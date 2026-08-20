<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import type { ServiceType } from '$lib/stores/serviceOrder.svelte';
	import { formatPhone, isValidPhone } from '$lib/utils/phone';
	import { submitServiceRequest } from '$lib/utils/service-request';

	let {
		serviceType,
		ctaFieldKey,
		ctaValue,
		note,
		nameId,
		phoneId,
		isEditable = false,
		onSaveCta
	}: {
		serviceType: ServiceType;
		ctaFieldKey: string;
		ctaValue: string;
		note: string;
		nameId: string;
		phoneId: string;
		isEditable?: boolean;
		onSaveCta: (value: string) => Promise<void>;
	} = $props();

	let name = $state('');
	let phone = $state('');
	let errors = $state({ name: '', phone: '' });
	let generalError = $state('');
	let isSubmitting = $state(false);
	let submitSuccess = $state(false);
	let nameInput = $state<HTMLInputElement | null>(null);
	let phoneInput = $state<HTMLInputElement | null>(null);

	function handlePhoneInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		phone = input.value ? formatPhone(input.value) : '';
		input.value = phone;
	}

	function validate() {
		const nextErrors = { name: '', phone: '' };

		if (!name.trim()) {
			nextErrors.name = 'Введите ваше имя';
		}

		if (!phone.trim()) {
			nextErrors.phone = 'Введите телефон';
		} else if (!isValidPhone(phone)) {
			nextErrors.phone = 'Введите номер полностью';
		}

		errors = nextErrors;
		const firstInvalid = nextErrors.name ? nameInput : nextErrors.phone ? phoneInput : null;
		firstInvalid?.focus();

		return !nextErrors.name && !nextErrors.phone;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting || !validate()) return;

		isSubmitting = true;
		generalError = '';

		try {
			await submitServiceRequest({
				serviceType,
				name,
				phone,
				city: cityStore.city,
				sourceUrl: typeof window !== 'undefined' ? window.location.href : null
			});
			submitSuccess = true;
			name = '';
			phone = '';
		} catch (error) {
			console.error('Service request submission failed', error);
			generalError = 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.';
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		submitSuccess = false;
		generalError = '';
		errors = { name: '', phone: '' };
	}
</script>

{#if submitSuccess}
	<div class="p1-border mt-10 border-t pt-8" role="status" aria-live="polite">
		<div
			class="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-cat-2-500/15 text-cat-2-500"
			aria-hidden="true"
		>
			<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12 4 4L19 6" />
			</svg>
		</div>
		<p class="p1-title p1-title-sub text-xl">Заявка отправлена</p>
		<p class="p1-body mt-2 max-w-lg text-sm">
			Спасибо! Специалист свяжется с вами в ближайшее время.
		</p>
		<button
			type="button"
			onclick={resetForm}
			class="p1-body mt-5 cursor-pointer text-sm underline decoration-current/35 underline-offset-4 transition-opacity ease-ui hover:opacity-70"
		>
			Отправить ещё одну заявку
		</button>
	</div>
{:else}
	<form class="mt-10" onsubmit={handleSubmit} novalidate aria-busy={isSubmitting}>
		<div class="flex flex-col items-start gap-3 sm:flex-row">
			<div class="w-full min-w-0">
				<label class="sr-only" for={nameId}>Как вас зовут</label>
				<input
					bind:this={nameInput}
					id={nameId}
					class="p1-field w-full rounded-3xl border px-5 py-4 text-base"
					class:border-cat-6-500={Boolean(errors.name)}
					placeholder="Как вас зовут"
					autocomplete="name"
					maxlength="100"
					bind:value={name}
					aria-invalid={errors.name ? 'true' : undefined}
					aria-describedby={errors.name ? `${nameId}-error` : undefined}
				/>
				{#if errors.name}
					<p id={`${nameId}-error`} class="mt-2 text-sm text-cat-6-500" role="alert">
						{errors.name}
					</p>
				{/if}
			</div>

			<div class="w-full min-w-0">
				<label class="sr-only" for={phoneId}>Телефон</label>
				<input
					bind:this={phoneInput}
					id={phoneId}
					type="tel"
					class="p1-field w-full rounded-3xl border px-5 py-4 text-base"
					class:border-cat-6-500={Boolean(errors.phone)}
					placeholder="+7 (___) ___-__-__"
					autocomplete="tel"
					inputmode="tel"
					value={phone}
					oninput={handlePhoneInput}
					aria-invalid={errors.phone ? 'true' : undefined}
					aria-describedby={errors.phone ? `${phoneId}-error` : undefined}
				/>
				{#if errors.phone}
					<p id={`${phoneId}-error`} class="mt-2 text-sm text-cat-6-500" role="alert">
						{errors.phone}
					</p>
				{/if}
			</div>
		</div>

		<EditableField
			fieldKey={ctaFieldKey}
			label="Текст кнопки"
			value={ctaValue}
			{isEditable}
			onSave={onSaveCta}
			class="mt-3 block w-full"
		>
			{#snippet children(displayValue)}
				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full cursor-pointer rounded-3xl bg-accent-surface px-7 py-4 text-base font-semibold text-on-accent transition-colors ease-ui hover:bg-accent-surface-deep disabled:cursor-wait disabled:opacity-65"
				>
					{isSubmitting ? 'Отправка…' : displayValue}
				</button>
			{/snippet}
		</EditableField>

		{#if generalError}
			<p class="mt-4 text-sm text-cat-6-500" role="alert">{generalError}</p>
		{/if}

		<p class="p1-note p1-body mt-4">
			{note} Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
		</p>
	</form>
{/if}
