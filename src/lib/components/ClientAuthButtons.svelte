<script lang="ts">
	/**
	 * Кнопки клиентской авторизации в баннере шапки.
	 *
	 * Состояние берётся из `page.data.client` — корневой layout кладёт туда имя
	 * и email из payload клиентской cookie (см. src/lib/server/client-session.ts),
	 * поэтому шапка приходит из SSR уже в нужном виде, без мигания «Войти» у
	 * вошедшего пользователя.
	 *
	 * Рассчитаны на тёмную полосу баннера: цвета берутся из ролей `on-dark` и
	 * шкалы `ink`, а не из белого/чёрного литералами.
	 */
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';

	let { compact = false }: { compact?: boolean } = $props();

	let isLoggingOut = $state(false);

	const client = $derived(
		(page.data as { client?: { name: string; email: string } | null }).client ?? null
	);

	/**
	 * `/cabinet` уводит гостя редиректом с `?auth=client-login` — по этой метке
	 * сразу открываем форму входа, чтобы человек не искал кнопку глазами.
	 */
	$effect(() => {
		if (!client && page.url.searchParams.get('auth') === 'client-login') {
			clientAuthModal.open('login');
		}
	});

	async function logout() {
		isLoggingOut = true;
		try {
			await fetch('/cabinet/session', { method: 'DELETE' });
		} catch {
			// Сеть не ответила — cookie осталась; состояние ниже не меняем.
		} finally {
			isLoggingOut = false;
		}
		await invalidateAll();
		if (page.url.pathname.startsWith('/cabinet')) await goto('/');
	}

	const linkClass =
		'rounded-full px-3 py-1.5 text-xs whitespace-nowrap text-ink-50 transition-colors hover:text-brand-400';
	const solidClass =
		'rounded-full bg-on-dark/10 px-3 py-1.5 text-xs whitespace-nowrap text-ink-50 transition-colors hover:bg-on-dark/20';
</script>

{#if client}
	<div class="flex items-center gap-1">
		<a href="/cabinet" class={solidClass} title={client.email}>
			<span class="sr-only">Личный кабинет</span>
			<span aria-hidden="true">{compact ? 'Кабинет' : client.name}</span>
		</a>
		<button type="button" onclick={logout} disabled={isLoggingOut} class={linkClass}>
			Выйти
		</button>
	</div>
{:else}
	<div class="flex items-center gap-1">
		<button type="button" onclick={() => clientAuthModal.open('login')} class={linkClass}>
			Войти
		</button>
		{#if !compact}
			<button type="button" onclick={() => clientAuthModal.open('register')} class={solidClass}>
				Регистрация
			</button>
		{/if}
	</div>
{/if}
