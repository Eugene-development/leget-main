<script lang="ts">
	/**
	 * Вход и регистрация клиента сайта (роль «Клиент»).
	 *
	 * Отличие от LoginModal: тот пускает ВЛАДЕЛЬЦА сайта и кладёт JWT в
	 * localStorage, чем включает режим правки. Здесь токен браузеру не
	 * достаётся вовсе — форма ходит на серверные маршруты /cabinet/session и
	 * /cabinet/register, а те держат JWT в httpOnly-cookie. Поэтому вход
	 * клиента не может включить редактор чужого сайта.
	 */
	import { goto, invalidateAll } from '$app/navigation';
	import SmartCaptcha from '$lib/components/SmartCaptcha.svelte';
	import { SITE_KEY } from '$lib/antibot/smartcaptcha.js';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';

	let { onClose }: { onClose: () => void } = $props();

	// Режим живёт в store, а не в локальном $state: открыть модалку могут и
	// кнопки баннера, и ссылка «Войти / Зарегистрироваться» внутри неё —
	// с двумя источниками правды они бы разъезжались.
	const currentMode = $derived(clientAuthModal.mode ?? 'login');

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let region = $state('');
	let password = $state('');
	let passwordConfirmation = $state('');

	let fieldErrors = $state<Record<string, string>>({});
	let submitError = $state('');
	let isSubmitting = $state(false);

	let captchaToken = $state<string | null>(null);
	let captchaRef = $state<{ reset: () => void } | undefined>();

	const isRegister = $derived(currentMode === 'register');
	const title = $derived(isRegister ? 'Регистрация' : 'Вход в личный кабинет');

	function isValidEmail(value: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	}

	function validate(): boolean {
		const errors: Record<string, string> = {};

		if (isRegister && !name.trim()) errors.name = 'Введите имя';

		if (!email.trim()) errors.email = 'Введите email';
		else if (!isValidEmail(email)) errors.email = 'Введите корректный email';

		if (!password) errors.password = 'Введите пароль';
		// Требование бэкенда — min:8; при входе длину не проверяем, чтобы не
		// подсказывать перебором, каким правилам подчиняется чужой пароль.
		else if (isRegister && password.length < 8) errors.password = 'Минимум 8 символов';

		if (isRegister && password !== passwordConfirmation) {
			errors.password_confirmation = 'Пароли не совпадают';
		}

		fieldErrors = errors;
		return Object.keys(errors).length === 0;
	}

	function switchMode() {
		clientAuthModal.open(isRegister ? 'login' : 'register');
		fieldErrors = {};
		submitError = '';
	}

	/** Ошибки валидации Laravel: { field: [message] } → плоская карта. */
	function applyServerErrors(errors: unknown) {
		if (!errors || typeof errors !== 'object') return;
		const flat: Record<string, string> = {};
		for (const [field, messages] of Object.entries(errors as Record<string, unknown>)) {
			const first = Array.isArray(messages) ? messages[0] : messages;
			if (typeof first === 'string') flat[field] = first;
		}
		fieldErrors = { ...fieldErrors, ...flat };
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!validate()) return;

		if (SITE_KEY && !captchaToken) {
			submitError = 'Подтвердите, что вы не робот.';
			return;
		}

		isSubmitting = true;
		submitError = '';

		const endpoint = isRegister ? '/cabinet/register' : '/cabinet/session';
		const payload = isRegister
			? {
					name: name.trim(),
					email: email.trim(),
					phone: phone.trim(),
					region: region.trim(),
					password,
					password_confirmation: passwordConfirmation,
					captcha_token: captchaToken
				}
			: { email: email.trim(), password, captcha_token: captchaToken };

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify(payload)
			});
			const result = await response.json().catch(() => ({}));

			if (!response.ok) {
				// Токен капчи одноразовый — сбрасываем виджет для новой попытки.
				captchaRef?.reset();
				captchaToken = null;
				applyServerErrors(result.errors);
				submitError =
					typeof result.message === 'string' ? result.message : 'Не удалось выполнить вход.';
				return;
			}

			onClose();
			// Сессию открыл сервер (httpOnly-cookie): шапке нужен свежий layout-load,
			// поэтому переход в кабинет идёт с инвалидацией.
			await invalidateAll();
			await goto('/cabinet');
		} catch {
			captchaRef?.reset();
			captchaToken = null;
			submitError = 'Сеть недоступна. Попробуйте ещё раз.';
		} finally {
			isSubmitting = false;
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) onClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') onClose();
	}

	const inputClass =
		'w-full rounded-xl border px-4 py-3 text-sm text-ink-950 transition focus:border-link-600 focus:ring-2 focus:ring-link-600/20 focus:outline-none';
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-scrim/50 p-4"
	onclick={handleBackdropClick}
>
	<div
		class="my-8 w-full max-w-xl rounded-2xl bg-surface-raised p-8 shadow-2xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="client-auth-title"
	>
		<div class="mb-6 flex items-start justify-between gap-4">
			<div>
				<h2 id="client-auth-title" class="text-xl text-ink-950">{title}</h2>
				<p class="mt-1 text-sm text-ink-500">
					{isRegister
						? 'Кабинет хранит ваши данные и историю обращений.'
						: 'Введите данные, указанные при регистрации.'}
				</p>
			</div>
			<button
				type="button"
				onclick={onClose}
				class="rounded-lg p-1 text-ink-400 transition hover:text-ink-700"
				aria-label="Закрыть"
			>
				<svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>

		<form onsubmit={handleSubmit} novalidate>
			<!--
				По два поля в строке. Сетка одна на оба режима: у входа это Email и
				Пароль в одну строку, у регистрации — три строки по паре. Порядок полей
				в разметке и есть порядок обхода сетки.
			-->
			<div class="grid gap-4 sm:grid-cols-2">
				{#if isRegister}
					<div>
						<label for="client-name" class="mb-1 block text-sm font-medium text-ink-700">Имя</label>
						<input
							id="client-name"
							type="text"
							autocomplete="name"
							bind:value={name}
							class={inputClass}
							class:border-cat-6-400={fieldErrors.name}
							class:border-ink-300={!fieldErrors.name}
							placeholder="Как к вам обращаться"
						/>
						{#if fieldErrors.name}
							<p class="mt-1 text-xs text-cat-6-500">{fieldErrors.name}</p>
						{/if}
					</div>
				{/if}

				<div>
					<label for="client-email" class="mb-1 block text-sm font-medium text-ink-700">Email</label
					>
					<input
						id="client-email"
						type="email"
						autocomplete="email"
						bind:value={email}
						class={inputClass}
						class:border-cat-6-400={fieldErrors.email}
						class:border-ink-300={!fieldErrors.email}
						placeholder="you@example.com"
					/>
					{#if fieldErrors.email}
						<p class="mt-1 text-xs text-cat-6-500">{fieldErrors.email}</p>
					{/if}
				</div>

				{#if isRegister}
					<div>
						<label for="client-phone" class="mb-1 block text-sm font-medium text-ink-700">
							Телефон <span class="text-ink-400">— желательно</span>
						</label>
						<input
							id="client-phone"
							type="tel"
							autocomplete="tel"
							bind:value={phone}
							class={`${inputClass} border-ink-300`}
							placeholder="+7 999 000-00-00"
						/>
					</div>

					<div>
						<label for="client-region" class="mb-1 block text-sm font-medium text-ink-700">
							Регион <span class="text-ink-400">— желательно</span>
						</label>
						<input
							id="client-region"
							type="text"
							autocomplete="address-level1"
							bind:value={region}
							class={inputClass}
							class:border-cat-6-400={fieldErrors.region}
							class:border-ink-300={!fieldErrors.region}
							placeholder="Москва и МО"
						/>
						{#if fieldErrors.region}
							<p class="mt-1 text-xs text-cat-6-500">{fieldErrors.region}</p>
						{/if}
					</div>
				{/if}

				<div>
					<label for="client-password" class="mb-1 block text-sm font-medium text-ink-700">
						Пароль
					</label>
					<input
						id="client-password"
						type="password"
						autocomplete={isRegister ? 'new-password' : 'current-password'}
						bind:value={password}
						class={inputClass}
						class:border-cat-6-400={fieldErrors.password}
						class:border-ink-300={!fieldErrors.password}
						placeholder="••••••••"
					/>
					{#if fieldErrors.password}
						<p class="mt-1 text-xs text-cat-6-500">{fieldErrors.password}</p>
					{/if}
				</div>

				{#if isRegister}
					<div>
						<label
							for="client-password-confirm"
							class="mb-1 block text-sm font-medium text-ink-700"
						>
							Повторите пароль
						</label>
						<input
							id="client-password-confirm"
							type="password"
							autocomplete="new-password"
							bind:value={passwordConfirmation}
							class={inputClass}
							class:border-cat-6-400={fieldErrors.password_confirmation}
							class:border-ink-300={!fieldErrors.password_confirmation}
							placeholder="••••••••"
						/>
						{#if fieldErrors.password_confirmation}
							<p class="mt-1 text-xs text-cat-6-500">{fieldErrors.password_confirmation}</p>
						{/if}
					</div>
				{/if}
			</div>

			{#if SITE_KEY}
				<div class="mt-4">
					<SmartCaptcha
						bind:this={captchaRef}
						onverify={(token: string) => (captchaToken = token)}
						onerror={() => (captchaToken = null)}
					/>
				</div>
			{/if}

			{#if submitError}
				<div class="mt-4 rounded-xl bg-cat-6-50 px-4 py-3 text-sm text-cat-6-600">
					{submitError}
				</div>
			{/if}

			<button
				type="submit"
				disabled={isSubmitting}
				class="mt-6 w-full rounded-xl bg-ink-950 px-6 py-3 text-sm font-semibold text-on-dark transition hover:bg-ink-800 disabled:opacity-60"
			>
				{#if isSubmitting}
					Отправляем…
				{:else}
					{isRegister ? 'Зарегистрироваться' : 'Войти'}
				{/if}
			</button>
		</form>

		<p class="mt-5 text-center text-sm text-ink-500">
			{isRegister ? 'Уже есть аккаунт?' : 'Ещё нет аккаунта?'}
			<button
				type="button"
				onclick={switchMode}
				class="ml-1 font-semibold text-link-600 underline-offset-4 transition hover:underline"
			>
				{isRegister ? 'Войти' : 'Зарегистрироваться'}
			</button>
		</p>
	</div>
</div>
