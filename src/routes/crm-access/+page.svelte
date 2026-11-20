<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAuthToken } from '$lib/utils/auth-session';

	let errorMessage = $state('');
	onMount(async () => {
		const token = getAuthToken();
		if (!token) {
			await goto(resolve('/crm'), { replaceState: true });
			return;
		}
		try {
			const response = await fetch('/crm-access/session', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` }
			});
			if (!response.ok) {
				const result = await response.json();
				errorMessage = result.message || 'Не удалось проверить доступ к CRM.';
				return;
			}
			await goto(resolve('/crm'), { replaceState: true });
		} catch {
			errorMessage = 'Сервис авторизации временно недоступен. Попробуйте ещё раз.';
		}
	});
</script>

<svelte:head>
	<title>Открываем CRM</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-ink-50 px-6 text-ink-950">
	{#if errorMessage}
		<div class="max-w-md text-center" role="alert">
			<h1 class="text-3xl">Не удалось открыть CRM</h1>
			<p class="mt-4 text-sm text-ink-600">{errorMessage}</p>
			<a href={resolve('/')} class="mt-6 inline-flex text-link-600 underline">Вернуться на сайт</a>
		</div>
	{:else}
		<p role="status" class="text-sm text-ink-600">Проверяем доступ к CRM…</p>
	{/if}
</main>
