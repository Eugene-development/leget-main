<script lang="ts">
	import { notifyError } from '$lib/utils/notify-error';
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
		policyHref = '/privacy',
		formId = 'promo1-lead-catcher'
	}: {
		enabled?: boolean;
		preview?: boolean;
		isLight?: boolean;
		policyHref?: string;
		formId?: string;
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
		if (!enabled || path.startsWith('/_') || preview) return;
		const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');
		let storage: Storage | null = null;
		try {
			storage = window.localStorage;
		} catch {
			/* session fallback */
		}
		const gate = createLeadCatcherGate(window.location.host, storage);
		let previousY: number | null = null;
		let active = true;
		function move(event: PointerEvent) {
			if (event.pointerType === 'mouse' && event.clientY > 0) previousY = event.clientY;
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
		function leave(event: PointerEvent) {
			if (event.pointerType !== 'mouse' || event.relatedTarget !== null) return;
			const topExit = isTopExit(event, previousY, window.innerWidth);
			previousY = null;
			if (!topExit || !eligible()) return;
			const claim = () => {
				if (eligible() && gate.claim()) show();
			};
			// Serialize simultaneous exits across tabs when Web Locks are available.
			if (navigator.locks)
				void navigator.locks.request('leget-lead-catcher', claim).catch(() => {});
			else claim();
		}
		document.addEventListener('pointermove', move, { passive: true });
		document.addEventListener('pointerout', leave);
		return () => {
			active = false;
			document.removeEventListener('pointermove', move);
			document.removeEventListener('pointerout', leave);
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
				formId,
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
				error = notifyError(cause, 'Не удалось отправить заявку. Попробуйте ещё раз.');
		} finally {
			if (current === generation) busy = false;
		}
	}
</script>

{#if open}
	<dialog
		bind:this={dialog}
		data-ds-surface={isLight ? 'light' : 'dark'}
		aria-labelledby="lead-catcher-title"
		class="lead-catcher fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border-0 p-6 shadow-2xl shadow-scrim/25 sm:p-8"
		oncancel={(event) => {
			event.preventDefault();
			close();
		}}
		data-goal-ignore="Закрытие по подложке без нажатия кнопки"
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
			class="ds-accent absolute top-3 right-3 flex size-10 items-center justify-center rounded-lg focus-visible:outline-2"
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
			<h2 id="lead-catcher-title" class="ds-title-sub pr-8 text-2xl">Заявка принята</h2>
			<p role="status" class="ds-copy mt-4">Мы свяжемся с вами.</p>
			<button
				type="button"
				class="ds-action mt-6 w-full rounded-xl px-5 py-3 font-semibold"
				onclick={close}
				data-metrika-goal="lead_catcher_success_close"
				data-goal-action="close">Закрыть</button
			>
		{:else}
			<form onsubmit={submit} novalidate>
				<h2 id="lead-catcher-title" class="ds-title-sub pr-8 text-2xl">
					Получите бесплатную консультацию
				</h2>
				<p class="ds-copy mt-4 text-sm leading-relaxed">
					Оставьте телефон — мы свяжемся с вами и ответим на ваши вопросы.
				</p>
				{#if preview}<p class="ds-copy mt-3 text-sm">
						Предпросмотр. Отправка заявки отключена.
					</p>{/if}
				<div class="mt-6">
					<PhoneInput bind:value={phone} error={phoneError} id="lead-catcher-phone" />
				</div>
				<label class="ds-copy mt-4 flex items-start gap-3 text-xs leading-relaxed">
					<input
						type="checkbox"
						aria-required="true"
						bind:checked={consent}
						class="mt-0.5 size-4 shrink-0 accent-brand-500"
					/>
					<span
						>Согласен на обработку персональных данных в соответствии с <a
							href={policyHref}
							target="_blank"
							rel="noopener"
							class="ds-accent underline underline-offset-2">политикой конфиденциальности</a
						>.</span
					>
				</label>
				{#if error}<p role="alert" class="mt-3 text-sm text-cat-6-500">{error}</p>{/if}
				<button
					type="submit"
					disabled={busy || preview}
					class="ds-action mt-6 w-full rounded-xl px-5 py-3.5 font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-50"
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
	.lead-catcher {
		background: var(--lead-catcher-surface);
		color: var(--ds-copy);
	}
	.lead-catcher[data-ds-surface='light'] {
		--lead-catcher-surface: var(--ds-light-surface);
		--lead-catcher-card: var(--ds-light-card);
		--lead-catcher-border: var(--ds-light-border);
	}
	.lead-catcher[data-ds-surface='dark'] {
		--lead-catcher-surface: var(--ds-dark-surface);
		--lead-catcher-card: var(--ds-dark-card);
		--lead-catcher-border: var(--ds-dark-border);
	}
	.lead-catcher::backdrop {
		background: color-mix(in srgb, var(--ds-scrim) 60%, transparent);
	}
	.lead-catcher :global(input[type='tel']) {
		background: var(--lead-catcher-card);
		color: var(--ds-copy);
		border-color: var(--lead-catcher-border);
	}
	.lead-catcher :global(label[for='lead-catcher-phone']) {
		color: var(--ds-copy);
	}
	.lead-catcher :global(input[type='tel']::placeholder) {
		color: var(--ds-copy);
	}
</style>
