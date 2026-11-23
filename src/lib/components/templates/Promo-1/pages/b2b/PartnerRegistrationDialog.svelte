<script lang="ts">
	import { notifyError } from '$lib/utils/notify-error';
	import { invalidateAll } from '$app/navigation';
	import { tick } from 'svelte';
	import type { PartnerApplication } from '$lib/partners/types';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import { createFormSender } from '$lib/utils/form-submission';

	let {
		profile = null,
		application = null,
		apiError = null
	}: {
		profile?: { role: string } | null;
		application?: PartnerApplication | null;
		apiError?: string | null;
	} = $props();

	const id = $props.id();
	const send = createFormSender('promo1-b2b-partner-registration');
	const input =
		'p1-field mt-2 w-full rounded-xl border px-3.5 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600';
	const button =
		'inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold';

	let dialog: HTMLDialogElement;
	let trigger: HTMLButtonElement;
	let busy = $state(false);
	let error = $state('');
	let accepted = $state(false);
	const isCompany = $derived(
		application?.partner_type === 'manufacturer' || application?.partner_type === 'supplier'
	);

	function open() {
		if (dialog?.isConnected && !dialog.open) dialog.showModal();
	}

	function close() {
		dialog.close();
		trigger.focus();
	}

	function handleCancel(event: Event) {
		event.preventDefault();
		close();
	}

	function authenticate(mode: 'login' | 'register') {
		dialog.close();
		const resume = () => void tick().then(open);
		clientAuthModal.open(mode, { onAuthenticated: resume, onDismiss: resume });
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy || accepted) return;
		busy = true;
		error = '';
		try {
			await send(
				new FormData(event.currentTarget as HTMLFormElement),
				'partner-application',
				event
			);
			accepted = true;
		} catch (failure) {
			error = notifyError(failure, 'Не удалось отправить заявку.');
		} finally {
			busy = false;
		}
		if (accepted) await invalidateAll().catch(() => {});
	}
</script>

<button
	bind:this={trigger}
	type="button"
	aria-haspopup="dialog"
	data-metrika-goal="b2b_partner_registration_open"
	data-goal-action="open"
	class="ds-action {button}"
	onclick={open}>Регистрация партнёра</button
>

<dialog
	bind:this={dialog}
	aria-labelledby="{id}-title"
	oncancel={handleCancel}
	onkeydown={(event) => {
		if (event.key === 'Escape') handleCancel(event);
	}}
	class="p1-surface p1-title p1-border m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border p-5 shadow-xl backdrop:bg-scrim/60 sm:p-7"
>
	<div class="flex items-start justify-between gap-4">
		<h2 id="{id}-title" class="text-2xl">Регистрация партнёра</h2>
		<button
			type="button"
			aria-label="Закрыть"
			data-metrika-goal="b2b_partner_registration_close"
			data-goal-action="close"
			class="p1-border p1-accent-hover grid size-11 shrink-0 place-items-center rounded-full border"
			onclick={close}
		>
			<svg
				class="size-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.75"
				aria-hidden="true"
			>
				<path d="m6 6 12 12M18 6 6 18" />
			</svg>
		</button>
	</div>

	{#if accepted}
		<p class="p1-body mt-4" role="status">Заявка принята. Мы свяжемся с вами после рассмотрения.</p>
	{:else if apiError}
		<p class="p1-body mt-4" role="alert">{apiError}</p>
	{:else if !profile}
		<p class="p1-body mt-4">
			Войдите или зарегистрируйтесь, чтобы отправить заявку от вашей компании.
		</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<button
				type="button"
				class="ds-action {button}"
				data-metrika-goal="b2b_partner_account_register_open"
				data-goal-action="open"
				onclick={() => authenticate('register')}>Создать аккаунт</button
			>
			<button
				type="button"
				class="p1-border border {button}"
				data-metrika-goal="b2b_partner_account_login_open"
				data-goal-action="open"
				onclick={() => authenticate('login')}>Войти</button
			>
		</div>
	{:else if !['client', 'student', 'partner'].includes(profile.role)}
		<p class="p1-body mt-4">Для подачи заявки используйте клиентский аккаунт.</p>
	{:else if application?.status === 'approved' && profile.role === 'partner'}
		{#if isCompany}
			<p class="p1-body mt-4">Вы можете заполнить и опубликовать карточку компании в кабинете.</p>
			<a href="/partner#company-card" class="ds-action mt-5 {button}">Открыть кабинет партнёра</a>
		{:else}
			<p class="p1-body mt-4">
				Карточка B2B доступна партнёрам с видом деятельности «Производитель» или «Поставщик».
			</p>
			<a href="/partner/register" class="ds-accent mt-5 inline-block underline underline-offset-4"
				>Обновить сведения о партнёре</a
			>
		{/if}
	{:else if application?.status === 'pending' && isCompany}
		<p class="p1-body mt-4" role="status">
			Ваша заявка на рассмотрении. После одобрения вы сможете опубликовать карточку компании.
		</p>
	{:else}
		{#if application?.status === 'rejected'}
			<p class="p1-body ym-hide-content mt-4">
				Заявка отклонена. {application.review_note ?? 'Вы можете подать её снова.'}
			</p>
		{/if}
		<form onsubmit={submit} class="ym-hide-content mt-4 space-y-4" aria-busy={busy}>
			<fieldset disabled={busy} class="space-y-4">
				<legend class="sr-only">Сведения о компании</legend>
				<label class="block">
					Вид деятельности
					<select
						name="partner_type"
						required
						class={input}
						value={isCompany ? (application?.partner_type ?? '') : ''}
					>
						<option value="" disabled>Выберите вид деятельности</option>
						<option value="manufacturer">Производитель</option>
						<option value="supplier">Поставщик</option>
					</select>
				</label>
				<label class="block">
					Название компании
					<input
						name="company"
						required
						autocomplete="organization"
						maxlength="255"
						class={input}
						value={application?.company ?? ''}
					/>
				</label>
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block">
						Город
						<input
							name="city"
							autocomplete="address-level2"
							maxlength="100"
							class={input}
							value={application?.city ?? ''}
						/>
					</label>
					<label class="block">
						ИНН, если есть
						<input
							name="inn"
							inputmode="numeric"
							maxlength="12"
							class={input}
							value={application?.inn ?? ''}
						/>
					</label>
				</div>
				<label class="block">
					Сайт
					<input
						name="website"
						type="url"
						autocomplete="url"
						maxlength="255"
						class={input}
						value={application?.website ?? ''}
					/>
				</label>
				<label class="block">
					Чем занимается компания
					<textarea
						name="comment"
						rows="3"
						maxlength="2000"
						class={input}
						value={application?.comment ?? ''}
					></textarea>
				</label>
				<label class="p1-body flex items-start gap-3 text-sm">
					<input
						name="consent"
						type="checkbox"
						value="1"
						required
						class="mt-0.5 size-4 shrink-0 rounded text-link-600"
					/>
					<span>
						Согласен на обработку персональных данных и ознакомился с
						<a
							href="/privacy"
							class="ds-accent underline underline-offset-4"
							target="_blank"
							rel="noopener"
							>политикой конфиденциальности<span class="sr-only"> (в новой вкладке)</span></a
						>.
					</span>
				</label>
			</fieldset>
			{#if error}<p role="alert" class="p1-body text-sm">{error}</p>{/if}
			<button
				type="submit"
				disabled={busy}
				data-metrika-goal="b2b_partner_registration_submit"
				data-goal-action="submit_click"
				class="ds-action {button} disabled:opacity-60"
				>{busy ? 'Отправляем…' : 'Отправить заявку'}</button
			>
		</form>
	{/if}
</dialog>
