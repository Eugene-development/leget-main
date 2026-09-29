<script lang="ts">
	import { tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import PhoneInput from '$lib/components/PhoneInput.svelte';
	import { isValidPhone } from '$lib/utils/phone';
	import { submitServiceRequest } from '$lib/utils/service-request';
	import { createLeadCatcherGate, isTopExit } from '$lib/utils/lead-catcher';

	let {
		enabled = false,
		preview = $bindable(false),
		isLight = false,
		policyHref = ''
	}: {
		enabled?: boolean;
		preview?: boolean;
		isLight?: boolean;
		policyHref?: string;
	} = $props();
	let dialog = $state<HTMLDialogElement>();
	let open = $state(false);
	let phone = $state('');
	let consent = $state(false);
	let phoneError = $state('');
	let error = $state('');
	let busy = $state(false);
	let sent = $state(false);
	let generation = 0;

	function show() {
		if (open) return;
		generation++;
		phone = '';
		consent = false;
		phoneError = '';
		error = '';
		busy = false;
		sent = false;
		open = true;
	}
	function close() {
		open = false;
		preview = false;
		generation++;
	}

	afterNavigate(() => close());

	$effect(() => {
		if (preview) show();
	});
	$effect(() => {
		if (!open || !dialog) return;
		const previousFocus = document.activeElement;
		const overflow = document.body.style.overflow;
		const element = dialog;
		element.showModal();
		document.body.style.overflow = 'hidden';
		return () => {
			element.close();
			document.body.style.overflow = overflow;
			if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
		};
	});
	$effect(() => {
		const path = page.url.pathname;
		if (!enabled || !policyHref || path.startsWith('/_') || preview) return;
		const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
		let storage: Storage | null = null;
		try {
			storage = window.localStorage;
		} catch {
			/* session fallback */
		}
		const gate = createLeadCatcherGate(window.location.host, storage);
		let previousY: number | null = null;
		let active = true;
		function move(event: MouseEvent) {
			if (event.clientY > 0) previousY = event.clientY;
		}
		function eligible() {
			return (
				active &&
				enabled &&
				!open &&
				!preview &&
				finePointer.matches &&
				document.visibilityState === 'visible' &&
				!document.querySelector('dialog[open], [role="dialog"], [aria-modal="true"]') &&
				document.body.style.overflow !== 'hidden'
			);
		}
		function leave(event: MouseEvent) {
			if (!isTopExit(event, previousY) || !eligible()) return;
			previousY = null;
			const claim = () => {
				if (eligible() && gate.claim()) show();
			};
			// Serialize simultaneous exits across tabs when Web Locks are available.
			if (navigator.locks)
				void navigator.locks.request('leget-lead-catcher', claim).catch(() => {});
			else claim();
		}
		document.addEventListener('mousemove', move, { passive: true });
		document.addEventListener('mouseout', leave);
		return () => {
			active = false;
			document.removeEventListener('mousemove', move);
			document.removeEventListener('mouseout', leave);
		};
	});

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (preview || busy || sent) return;
		phoneError = isValidPhone(phone) ? '' : 'Введите корректный номер телефона';
		error = consent ? '' : 'Подтвердите согласие на обработку персональных данных';
		if (phoneError || error) return;
		busy = true;
		const current = generation;
		try {
			await submitServiceRequest({
				serviceType: 'consultation',
				formId: 'promo1-lead-catcher',
				formTitle: 'Получите бесплатную консультацию',
				phone,
				consent,
				city: '',
				sourceUrl: window.location.href
			});
			if (current === generation) {
				sent = true;
				await tick();
				if (current === generation) dialog?.querySelector<HTMLButtonElement>('button')?.focus();
			}
		} catch (cause) {
			if (current === generation)
				error =
					cause instanceof Error
						? cause.message
						: 'Не удалось отправить заявку. Попробуйте ещё раз.';
		} finally {
			if (current === generation) busy = false;
		}
	}
</script>

{#if open}
	<dialog
		bind:this={dialog}
		data-p1-theme={isLight ? 'light' : 'dark'}
		aria-labelledby="lead-catcher-title"
		class="lead-catcher p1-surface p1-title fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border-0 p-6 shadow-2xl shadow-scrim/25 sm:p-8"
		oncancel={(event) => {
			event.preventDefault();
			close();
		}}
		onclick={(event) => {
			if (event.target === dialog) {
				const box = dialog.getBoundingClientRect();
				if (
					event.clientX < box.left ||
					event.clientX > box.right ||
					event.clientY < box.top ||
					event.clientY > box.bottom
				)
					close();
			}
		}}
		onclose={close}
	>
		<button
			type="button"
			class="p1-muted p1-accent-hover absolute top-3 right-3 flex size-10 items-center justify-center rounded-lg focus-visible:outline-2"
			aria-label="Закрыть форму"
			onclick={close}
			data-metrika-goal="lead_catcher_close"
			data-goal-action="close"
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg
			>
		</button>
		{#if sent}
			<h2 id="lead-catcher-title" class="p1-title pr-8 text-2xl font-semibold">Заявка принята</h2>
			<p role="status" class="p1-body mt-4">Мы свяжемся с вами.</p>
			<button
				type="button"
				class="mt-6 w-full rounded-xl bg-brand-500 px-5 py-3 font-semibold text-on-accent"
				onclick={close}
				data-metrika-goal="lead_catcher_success_close"
				data-goal-action="close">Закрыть</button
			>
		{:else}
			<form onsubmit={submit} novalidate>
				<h2 id="lead-catcher-title" class="p1-title pr-8 text-2xl leading-tight font-semibold">
					Получите бесплатную консультацию
				</h2>
				<p class="p1-body mt-4 text-sm leading-relaxed">
					Оставьте телефон — мы свяжемся с вами и ответим на ваши вопросы.
				</p>
				{#if preview}<p class="p1-muted mt-3 text-sm">
						Предпросмотр. Отправка заявки отключена.
					</p>{/if}
				<div class="mt-6">
					<PhoneInput bind:value={phone} error={phoneError} id="lead-catcher-phone" />
				</div>
				<label class="p1-body mt-4 flex items-start gap-3 text-xs leading-relaxed">
					<input
						type="checkbox"
						aria-required="true"
						bind:checked={consent}
						class="mt-0.5 size-4 shrink-0 accent-brand-500"
					/>
					<span
						>Согласен на обработку персональных данных в соответствии с <a
							href={policyHref || undefined}
							target="_blank"
							rel="noopener"
							class="p1-accent underline underline-offset-2">политикой конфиденциальности</a
						>.</span
					>
				</label>
				{#if error}<p role="alert" class="mt-3 text-sm text-cat-6-500">{error}</p>{/if}
				<button
					type="submit"
					disabled={busy || preview}
					class="mt-6 w-full rounded-xl bg-brand-500 px-5 py-3.5 font-semibold text-on-accent transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50"
					data-metrika-goal="lead_catcher_submit"
					data-goal-action="submit_click"
				>
					{busy ? 'Отправляем…' : 'Получить консультацию'}
				</button>
			</form>
		{/if}
	</dialog>
{/if}

<style>
	.lead-catcher::backdrop {
		background: color-mix(in srgb, var(--ds-scrim) 60%, transparent);
	}
	.lead-catcher :global(input[type='tel']) {
		background: var(--p1-card);
		color: var(--p1-title);
		border-color: var(--p1-border);
	}
	.lead-catcher :global(label[for='lead-catcher-phone']) {
		color: var(--p1-title);
	}
	.lead-catcher :global(input[type='tel']::placeholder) {
		color: var(--p1-muted);
	}
</style>
