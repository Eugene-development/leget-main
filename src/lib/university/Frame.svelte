<script lang="ts">
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { toast } from '$lib/stores/toast.svelte';
	let leaving = $state(false);
	let logoutProblem = $state('');
	async function logout() {
		leaving = true;
		logoutProblem = '';
		try {
			const r = await fetch('/cabinet/session', { method: 'DELETE' });
			if (!r.ok) throw new Error();
			await goto('/university/auth', { invalidateAll: true });
		} catch {
			logoutProblem = 'Не удалось выйти. Проверьте соединение и нажмите «Выйти» ещё раз.';
		} finally {
			leaving = false;
		}
	}
	import UniversityMark from '$lib/components/templates/Promo-1/pages/university/UniversityMark.svelte';
	import '$lib/components/templates/Promo-1/theme.css';
	import './university.css';
	let { children }: { children: Snippet } = $props();
</script>

<div class="academy p1-surface-paper" data-p1-theme="light">
	<div class="academy-shell">
		<header class="academy-header">
			<a class="academy-brand" href="/university"
				><UniversityMark class="academy-mark" /><span>Универ<small>Университет о доме</small></span
				></a
			>
			<nav aria-label="Университет">
				<a href="/university#university-program">Программа</a><a
					href={page.data.client ? '/university/student' : '/university/auth?mode=login'}
					onclick={() => {
						if (!page.data.client) toast.info('Чтобы открыть кабинет студента, войдите в систему.');
					}}
					data-goal-ignore="Навигация в кабинет студента с подсказкой о входе">Кабинет студента</a
				>
				{#if page.data.client}<button
						disabled={leaving}
						onclick={logout}
						data-goal-ignore="Выход из учебной сессии">{leaving ? 'Выходим…' : 'Выйти'}</button
					>{/if}
				<a class="academy-site-exit" href="/" data-sveltekit-reload>Вернуться на сайт</a>
			</nav>
		</header>
		{#if logoutProblem}<p class="academy-notice" role="alert">{logoutProblem}</p>{/if}
		{@render children()}
		<footer class="academy-footer">
			Учиться понимать. Создавать своё.<a href="/university">Все дисциплины</a>
		</footer>
	</div>
</div>
