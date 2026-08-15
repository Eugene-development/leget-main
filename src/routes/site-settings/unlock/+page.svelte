<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let errorMessage = $state<string | null>(null);

	onMount(async () => {
		const token = localStorage.getItem('auth_token');
		if (!token) {
			await goto('/', { replaceState: true });
			return;
		}

		try {
			const response = await fetch('/site-settings/session', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!response.ok) {
				errorMessage =
					response.status === 401
						? 'Сессия истекла. Вернитесь на сайт и войдите снова.'
						: 'Не удалось проверить доступ. Попробуйте ещё раз.';
				return;
			}
			await goto('/site-settings', { replaceState: true });
		} catch {
			errorMessage = 'Сервис авторизации временно недоступен. Попробуйте ещё раз.';
		}
	});
</script>

<svelte:head>
	<title>Открываем настройки сайта</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-ink-50 px-6 text-text-primary">
	{#if errorMessage}
		<div class="max-w-md text-center" role="alert">
			<h1 class="text-3xl">Не удалось открыть настройки</h1>
			<p class="mt-4 text-sm text-text-secondary">{errorMessage}</p>
			<a
				href="/"
				class="mt-6 inline-flex rounded-xl bg-ink-900 px-5 py-3 text-sm text-on-dark transition hover:bg-ink-700 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2"
			>
				Вернуться на сайт
			</a>
		</div>
	{:else}
		<div class="flex items-center gap-3" role="status" aria-live="polite">
			<span class="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500"></span>
			<span class="text-sm text-text-secondary">Проверяем доступ к настройкам…</span>
		</div>
	{/if}
</main>
