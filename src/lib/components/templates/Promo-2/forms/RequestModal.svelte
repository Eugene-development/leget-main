<script lang="ts">
	import { requestText } from './copy';
	import { onMount } from 'svelte';
	import { createFormSender } from '$lib/utils/form-submission';
	import { cleanPhone } from '$lib/utils/phone';
	import { formDefinitions, promo2Request, type Promo2Request } from './request';

	let { request, data = {} }: { request: Promo2Request; data?: Record<string, unknown> } = $props();
	const definition = $derived(formDefinitions[request.kind]);
	// The parent keys this component by request; its sender lives for that form session.
	// svelte-ignore state_referenced_locally
	const sendForm = createFormSender(`promo2-modal-${request.kind}`);
	let dialog: HTMLDialogElement;
	let returnFocus: HTMLElement | null = null;
	let name = $state('');
	let phone = $state('');
	let email = $state('');
	let city = $state('');
	let showroom = $state('');
	let visitTime = $state('');
	let address = $state('');
	let message = $state('');
	let partnerKind = $state('studio');
	let consent = $state(false);
	let loading = $state(false);
	let submitted = $state(false);
	let error = $state('');
	let phoneError = $state('');

	onMount(() => {
		returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const previousOverflow = document.body.style.overflow;
		dialog.showModal();
		document.body.style.overflow = 'hidden';
		return () => {
			dialog.close();
			document.body.style.overflow = previousOverflow;
		};
	});

	function close() {
		dialog?.close();
		if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
		promo2Request.set(null);
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (loading) return;
		phoneError = /^\+?[0-9]{7,15}$/.test(cleanPhone(phone)) ? '' : 'Проверьте номер телефона.';
		if (phoneError || !name.trim() || !consent) return;
		loading = true;
		error = '';
		try {
			await sendForm(
				{
					service_type: definition.type,
					name: name.trim(),
					phone: cleanPhone(phone),
					email: email.trim(),
					city: city.trim(),
					message: message.trim(),
					consent: '1',
					request_subject: request.subject || undefined,
					...(request.kind === 'home-designer'
						? { object_address: address.trim(), visit_time: visitTime.trim() }
						: {}),
					...(request.kind === 'showroom'
						? { showroom: showroom.trim(), visit_time: visitTime.trim() }
						: {}),
					...(request.kind === 'partnership' ? { designer_type: partnerKind } : {}),
					...(request.kind === 'careers' ? { position: request.subject || undefined } : {})
				},
				'service-request',
				event
			);
			submitted = true;
		} catch (cause) {
			error =
				cause instanceof Error ? cause.message : 'Не удалось отправить заявку. Попробуйте ещё раз.';
		} finally {
			loading = false;
		}
	}
</script>

<dialog
	bind:this={dialog}
	class="p2-request"
	aria-labelledby="p2-request-title"
	aria-describedby="p2-request-description"
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
	onclick={(event) => {
		if (event.target !== dialog) return;
		const rect = dialog.getBoundingClientRect();
		if (
			event.clientX < rect.left ||
			event.clientX > rect.right ||
			event.clientY < rect.top ||
			event.clientY > rect.bottom
		)
			close();
	}}
	onclose={close}
>
	<div class="p2-request-content">
		<button
			type="button"
			class="p2-close"
			aria-label="Закрыть форму"
			data-metrika-goal="request_modal_close"
			data-goal-action="close"
			data-goal-variant={request.kind}
			onclick={close}
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
				><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" /></svg
			>
		</button>
		{#if submitted}<p class="p2-eyebrow">
				{requestText(data, 'thanks', 'Спасибо за обращение')}
			</p>{/if}
		<h2 id="p2-request-title">
			{submitted
				? requestText(data, 'successTitle', 'Заявка принята')
				: requestText(data, `title.${request.kind}`, definition.title)}
		</h2>
		<p id="p2-request-description" class="p2-description">
			{submitted
				? requestText(data, 'successDescription', 'Мы свяжемся с вами по указанным контактам.')
				: requestText(data, `description.${request.kind}`, definition.description)}
		</p>
		{#if submitted}
			<div role="status" class="p2-success">
				{requestText(data, 'successNotice', 'Ваше обращение сохранено.')}
			</div>
			<button
				type="button"
				class="p2-submit"
				data-metrika-goal="request_modal_success_close"
				data-goal-action="close"
				data-goal-variant={request.kind}
				onclick={close}>{requestText(data, 'closeText', 'Вернуться на сайт')}</button
			>
		{:else}
			{#if request.subject}<p class="p2-subject">{request.subject}</p>{/if}
			<form onsubmit={submit} aria-busy={loading}>
				<fieldset disabled={loading}>
					<label for="p2-name"
						>{requestText(data, 'nameLabel', 'Ваше имя')} <span aria-hidden="true">*</span></label
					>
					<input
						id="p2-name"
						name="name"
						autocomplete="name"
						required
						maxlength="255"
						pattern=".*\S.*"
						bind:value={name}
					/>
					<label for="p2-phone"
						>{requestText(data, 'phoneLabel', 'Телефон')} <span aria-hidden="true">*</span></label
					>
					<input
						id="p2-phone"
						name="phone"
						type="tel"
						autocomplete="tel"
						required
						maxlength="50"
						placeholder={requestText(data, 'phonePlaceholder', '+7 (999) 123-45-67')}
						bind:value={phone}
						aria-invalid={!!phoneError}
						aria-describedby={phoneError ? 'p2-phone-error' : undefined}
					/>
					{#if phoneError}<p class="p2-error" id="p2-phone-error" role="alert">{phoneError}</p>{/if}
					{#if request.kind === 'partnership' || request.kind === 'careers'}
						<label for="p2-email"
							>{requestText(data, 'emailLabel', 'Электронная почта')}
							<span aria-hidden="true">*</span></label
						>
						<input
							id="p2-email"
							type="email"
							autocomplete="email"
							required
							maxlength="255"
							bind:value={email}
						/>
					{/if}
					<label for="p2-city"
						>{requestText(data, 'cityLabel', 'Город')}{#if request.kind === 'showroom'}
							<span aria-hidden="true">*</span>{/if}</label
					>
					<input
						id="p2-city"
						autocomplete="address-level2"
						required={request.kind === 'showroom'}
						maxlength="100"
						bind:value={city}
					/>
					{#if request.kind === 'showroom'}
						<label for="p2-showroom"
							>{requestText(data, 'showroomLabel', 'Предпочтительный салон')}</label
						>
						<input
							id="p2-showroom"
							maxlength="255"
							placeholder={requestText(
								data,
								'showroomPlaceholder',
								'Адрес или название, если знаете'
							)}
							bind:value={showroom}
						/>
					{/if}
					{#if request.kind === 'home-designer'}
						<label for="p2-address"
							>{requestText(data, 'addressLabel', 'Адрес выезда')}
							<span aria-hidden="true">*</span></label
						>
						<input
							id="p2-address"
							autocomplete="street-address"
							required
							minlength="10"
							maxlength="500"
							bind:value={address}
						/>
					{/if}
					{#if request.kind === 'showroom' || request.kind === 'home-designer'}
						<label for="p2-time">{requestText(data, 'timeLabel', 'Удобное время')}</label>
						<input
							id="p2-time"
							maxlength="160"
							placeholder={requestText(data, 'timePlaceholder', 'Например, в субботу после 12:00')}
							bind:value={visitTime}
						/>
					{/if}
					{#if request.kind === 'partnership'}
						<label for="p2-partner">{requestText(data, 'partnerLabel', 'Формат работы')}</label>
						<select id="p2-partner" bind:value={partnerKind}
							><option value="studio">{requestText(data, 'studioLabel', 'Студия')}</option><option
								value="freelancer"
								>{requestText(data, 'freelancerLabel', 'Частный дизайнер')}</option
							></select
						>
					{/if}
					<label for="p2-message"
						>{request.kind === 'careers'
							? requestText(data, 'resumeLabel', 'Опыт и ссылка на резюме')
							: request.kind === 'estimate'
								? requestText(data, 'estimateLabel', 'Размеры и пожелания к мебели')
								: requestText(data, 'messageLabel', 'Ваши пожелания')}</label
					>
					<textarea id="p2-message" rows="3" maxlength="2000" bind:value={message}></textarea>
					<label class="p2-consent"
						><input type="checkbox" required bind:checked={consent} /><span
							>{requestText(data, 'consentText', 'Согласен на обработку персональных данных.')}
							<a href="/privacy" target="_blank" rel="noopener noreferrer"
								>{requestText(data, 'privacyText', 'Политика конфиденциальности')}</a
							></span
						></label
					>
				</fieldset>
				{#if error}<p class="p2-error" role="alert">{error}</p>{/if}
				<button
					type="submit"
					class="p2-submit"
					disabled={loading}
					data-metrika-goal="request_modal_submit"
					data-goal-action="submit_click"
					data-goal-variant={request.kind}
					>{loading
						? requestText(data, 'sendingText', 'Отправляем…')
						: requestText(data, 'submitText', 'Отправить заявку')}</button
				>
			</form>
		{/if}
	</div>
</dialog>

<style>
	.p2-request {
		margin: auto;
		padding: 0;
		width: min(36rem, calc(100% - 2rem));
		max-height: calc(100dvh - 2rem);
		overflow: auto;
		border: 1px solid var(--color-border-medium);
		border-radius: var(--radius-sm);
		background: var(--color-surface-warm);
		color: var(--color-primary);
		font-family: var(--font-body);
	}
	.p2-request::backdrop {
		background: color-mix(in srgb, var(--color-primary) 65%, transparent);
	}
	.p2-request[open] {
		animation: p2-request-enter 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.p2-request[open]::backdrop {
		animation: p2-request-backdrop-enter 240ms ease-out both;
	}
	@keyframes p2-request-enter {
		from {
			opacity: 0;
			transform: translateY(1rem) scale(0.985);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	@keyframes p2-request-backdrop-enter {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.p2-request[open],
		.p2-request[open]::backdrop {
			animation: p2-request-backdrop-enter 120ms ease-out both;
		}
	}
	.p2-request-content {
		position: relative;
		padding: 2.5rem;
	}
	.p2-close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		cursor: pointer;
	}
	.p2-eyebrow {
		margin: 0 0 0.75rem;
		color: var(--color-text-secondary);
		font-size: 0.6875rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}
	h2 {
		padding-right: 0.75rem;
		font-family: var(--font-heading);
		font-size: clamp(2rem, 6vw, 2.75rem);
		text-wrap: balance;
	}
	.p2-description {
		margin-top: 1rem;
		color: var(--color-text-secondary);
		font-size: 0.9375rem;
		line-height: 1.6;
	}
	.p2-subject,
	.p2-success {
		margin-top: 1.5rem;
		padding: 1rem;
		border-left: 2px solid var(--color-accent);
		background: var(--color-surface);
		overflow-wrap: anywhere;
	}
	form {
		margin-top: 1.75rem;
	}
	fieldset {
		padding: 0;
		border: 0;
		min-width: 0;
	}
	label {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 0.8125rem;
	}
	input:not([type='checkbox']),
	textarea,
	select {
		width: 100%;
		min-height: 2.875rem;
		margin-bottom: 1.125rem;
		border: 1px solid var(--color-secondary);
		border-radius: var(--radius-sm);
		padding: 0.75rem;
		background: var(--color-surface);
		color: var(--color-primary);
		font: inherit;
		font-size: 1rem;
	}
	input::placeholder {
		color: var(--color-text-secondary);
		opacity: 1;
	}
	textarea {
		resize: vertical;
	}
	.p2-consent {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		line-height: 1.6;
		cursor: pointer;
	}
	.p2-consent input {
		flex-shrink: 0;
		margin-top: 0.25rem;
		accent-color: var(--color-primary);
	}
	a {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.p2-submit {
		display: block;
		width: 100%;
		min-height: 3.25rem;
		margin-top: 1.5rem;
		padding: 0.875rem 1.5rem;
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-sm);
		background: var(--color-primary);
		color: var(--color-inverse);
		font-size: 0.75rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		cursor: pointer;
		transition: background 0.2s;
	}
	.p2-submit:hover {
		background: var(--color-primary-light);
	}
	.p2-close:hover {
		background: var(--color-surface-muted);
	}
	:focus-visible {
		outline: 2px solid var(--color-secondary);
		outline-offset: 3px;
	}
	:disabled {
		cursor: wait;
		opacity: 0.65;
	}
	.p2-error {
		margin: 0.5rem 0;
		color: var(--color-primary);
		font-size: 0.875rem;
		border-left: 2px solid var(--color-primary);
		padding-left: 0.75rem;
	}
	@media (max-width: 480px) {
		.p2-request-content {
			padding: 2.5rem 1.25rem 1.5rem;
		}
	}
</style>
