<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import SmartCaptcha from '$lib/components/SmartCaptcha.svelte';
	import { SITE_KEY } from '$lib/antibot/smartcaptcha.js';

	let { onClose }: { onClose: () => void } = $props();

	let email = $state('');
	let password = $state('');
	let errors = $state({ email: '', password: '' });
	let submitError = $state('');
	let isSubmitting = $state(false);

	// SmartCaptcha (защита от ботов)
	let captchaToken = $state<string | null>(null);
	let captchaRef = $state<{ reset: () => void } | undefined>();

	function isValidEmail(value: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	}

	function validate() {
		errors = { email: '', password: '' };
		let valid = true;

		if (!email.trim()) {
			errors.email = 'Введите email';
			valid = false;
		} else if (!isValidEmail(email)) {
			errors.email = 'Введите корректный email';
			valid = false;
		}

		if (!password.trim()) {
			errors.password = 'Введите пароль';
			valid = false;
		} else if (password.length < 6) {
			errors.password = 'Минимум 6 символов';
			valid = false;
		}

		return valid;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!validate()) return;

		// Антибот: при включённой капче требуется токен
		if (SITE_KEY && !captchaToken) {
			submitError = 'Подтвердите, что вы не робот.';
			return;
		}

		isSubmitting = true;
		submitError = '';

		try {
			await auth.login(email, password, captchaToken);
			onClose();
		} catch (err: unknown) {
			// Токен одноразовый — сбрасываем капчу для повторной попытки
			captchaRef?.reset();
			captchaToken = null;
			submitError = err instanceof Error ? err.message : 'Не удалось войти. Проверьте данные.';
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
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-scrim/50 p-4"
	onclick={handleBackdropClick}
>
	<div
		class="w-full max-w-md rounded-2xl bg-surface-raised p-8 shadow-2xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="login-modal-title"
	>
		<div class="mb-6 flex items-center justify-between">
			<h2 id="login-modal-title" class="text-xl text-ink-950">Вход в систему</h2>
			<button
				type="button"
				onclick={onClose}
				class="rounded-lg p-1 text-ink-400 transition hover:text-ink-700"
				aria-label="Закрыть"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		</div>

		<form onsubmit={handleSubmit} novalidate>
			<div class="space-y-4">
				<!-- Email -->
				<div>
					<label for="login-email" class="mb-1 block text-sm font-medium text-ink-700">
						Email
					</label>
					<input
						id="login-email"
						type="email"
						autocomplete="email"
						bind:value={email}
						class="w-full rounded-xl border px-4 py-3 text-sm text-ink-950 transition focus:border-link-600 focus:ring-2 focus:ring-link-600/20 focus:outline-none"
						class:border-cat-6-400={errors.email}
						class:border-ink-300={!errors.email}
						placeholder="you@example.com"
					/>
					{#if errors.email}
						<p class="mt-1 text-xs text-cat-6-500">{errors.email}</p>
					{/if}
				</div>

				<!-- Password -->
				<div>
					<label for="login-password" class="mb-1 block text-sm font-medium text-ink-700">
						Пароль
					</label>
					<input
						id="login-password"
						type="password"
						autocomplete="current-password"
						bind:value={password}
						class="w-full rounded-xl border px-4 py-3 text-sm text-ink-950 transition focus:border-link-600 focus:ring-2 focus:ring-link-600/20 focus:outline-none"
						class:border-cat-6-400={errors.password}
						class:border-ink-300={!errors.password}
						placeholder="••••••••"
					/>
					{#if errors.password}
						<p class="mt-1 text-xs text-cat-6-500">{errors.password}</p>
					{/if}
				</div>
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
				{isSubmitting ? 'Вход...' : 'Войти'}
			</button>
		</form>
	</div>
</div>
