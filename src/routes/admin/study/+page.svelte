<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let busy = $state(false);
</script>

<svelte:head
	><title>Моё обучение — LEGET</title><meta name="robots" content="noindex,nofollow" /></svelte:head
>
<main class="min-h-screen bg-surface-warm px-4 py-12 text-ink-950">
	<section class="mx-auto max-w-xl space-y-6">
		<a href="/admin" class="text-link-600 underline">Кабинет суперадмина</a>
		<h1 class="text-3xl">Моё обучение</h1>
		<p class="ym-hide-content">{data.profile.name} · {data.profile.email}</p>
		<p>
			Откройте университет под этим аккаунтом. Роль суперадмина и сессия панели сохранятся. Если на
			сайте открыт другой аккаунт, учебная сессия переключится на этот.
		</p>
		{#if form?.error}<p role="alert">{form.error}</p>{/if}
		<form
			method="POST"
			action="?/enroll"
			use:enhance={() => {
				busy = true;
				return async ({ update }) => {
					try {
						await update();
					} finally {
						busy = false;
					}
				};
			}}
		>
			<button
				type="submit"
				disabled={busy}
				class="rounded-xl bg-ink-950 px-5 py-3 text-on-dark disabled:opacity-50"
				data-metrika-goal="superadmin_student_enroll"
				data-goal-action="submit_click"
				>{busy
					? 'Открываем…'
					: data.profile.roles?.includes('student')
						? 'Открыть учебный кабинет'
						: 'Стать студентом'}</button
			>
		</form>
	</section>
</main>
