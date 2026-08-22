<script lang="ts">
	import { enhance } from '$app/forms';

	let { data } = $props();

	const profile = $derived(data.profile);

	function formatDate(value: string | null | undefined): string {
		if (!value) return '—';
		return new Intl.DateTimeFormat('ru-RU', {
			dateStyle: 'long',
			timeStyle: 'short',
			timeZone: 'Europe/Moscow'
		}).format(new Date(value));
	}

	/** Первые буквы имени — заглушка вместо аватара, файлов у клиента пока нет. */
	const initials = $derived(
		(profile?.name ?? '')
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part: string) => part[0]?.toUpperCase() ?? '')
			.join('') || '—'
	);
</script>

<svelte:head>
	<title>Личный кабинет</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="min-h-screen bg-surface-warm px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-3xl">
		{#if data.serviceUnavailable}
			<section class="rounded-3xl border border-border-light bg-surface-raised p-8 shadow-card">
				<h1 class="text-3xl text-ink-950">Кабинет временно недоступен</h1>
				<p class="mt-3 text-sm leading-relaxed text-ink-500">
					Сервис авторизации не отвечает. Обновите страницу через минуту — сессия сохранена.
				</p>
				<a
					href="/"
					class="mt-6 inline-flex rounded-xl border border-border-medium px-5 py-3 text-sm text-ink-700 transition hover:bg-surface-muted"
				>
					На главную
				</a>
			</section>
		{:else if profile}
			<header class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-center gap-4">
					<span
						class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-ink-950 text-lg font-semibold text-on-dark"
					>
						{initials}
					</span>
					<div>
						<p class="text-xs tracking-[0.18em] text-ink-400 uppercase">Личный кабинет</p>
						<h1 class="mt-1 text-3xl text-ink-950">{profile.name}</h1>
					</div>
				</div>

				<div class="flex items-center gap-3">
					<a
						href="/"
						class="rounded-xl border border-border-medium px-5 py-3 text-sm text-ink-700 transition hover:bg-surface-muted"
					>
						На сайт
					</a>
					<form method="POST" action="?/logout" use:enhance>
						<button
							type="submit"
							class="rounded-xl bg-ink-950 px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
						>
							Выйти
						</button>
					</form>
				</div>
			</header>

			<section
				class="overflow-hidden rounded-3xl border border-border-light bg-surface-raised shadow-card"
			>
				<div class="border-b border-border-light px-7 py-5">
					<h2 class="text-xl text-ink-950">Ваши данные</h2>
					<p class="mt-1 text-sm text-ink-500">
						Пока в кабинете только профиль — заказы и документы появятся позже.
					</p>
				</div>

				<dl class="divide-y divide-border-light">
					<div class="grid gap-1 px-7 py-4 sm:grid-cols-3 sm:gap-4">
						<dt class="text-sm text-ink-500">Имя</dt>
						<dd class="text-sm text-ink-950 sm:col-span-2">{profile.name}</dd>
					</div>
					<div class="grid gap-1 px-7 py-4 sm:grid-cols-3 sm:gap-4">
						<dt class="text-sm text-ink-500">Email</dt>
						<dd class="flex flex-wrap items-center gap-2 text-sm text-ink-950 sm:col-span-2">
							{profile.email}
							{#if profile.email_verified}
								<span class="rounded-full bg-cat-2-50 px-2.5 py-1 text-xs text-cat-2-700">
									подтверждён
								</span>
							{:else}
								<span class="rounded-full bg-cat-1-50 px-2.5 py-1 text-xs text-cat-1-700">
									ждёт подтверждения
								</span>
							{/if}
						</dd>
					</div>
					<div class="grid gap-1 px-7 py-4 sm:grid-cols-3 sm:gap-4">
						<dt class="text-sm text-ink-500">Телефон</dt>
						<dd class="text-sm text-ink-950 sm:col-span-2">{profile.phone || '—'}</dd>
					</div>
					<div class="grid gap-1 px-7 py-4 sm:grid-cols-3 sm:gap-4">
						<dt class="text-sm text-ink-500">Регион</dt>
						<dd class="text-sm text-ink-950 sm:col-span-2">{profile.region || '—'}</dd>
					</div>
					<div class="grid gap-1 px-7 py-4 sm:grid-cols-3 sm:gap-4">
						<dt class="text-sm text-ink-500">Роль</dt>
						<dd class="text-sm text-ink-950 sm:col-span-2">Клиент</dd>
					</div>
					<div class="grid gap-1 px-7 py-4 sm:grid-cols-3 sm:gap-4">
						<dt class="text-sm text-ink-500">Регистрация</dt>
						<dd class="text-sm text-ink-950 sm:col-span-2">{formatDate(profile.created_at)}</dd>
					</div>
					<div class="grid gap-1 px-7 py-4 sm:grid-cols-3 sm:gap-4">
						<dt class="text-sm text-ink-500">Номер профиля</dt>
						<dd class="font-mono text-sm text-ink-950 sm:col-span-2">#{profile.id}</dd>
					</div>
				</dl>
			</section>

			{#if !profile.email_verified}
				<p
					class="mt-6 rounded-2xl border border-border-light bg-surface-muted p-5 text-sm text-ink-600"
				>
					Мы отправили письмо со ссылкой подтверждения на {profile.email}. Проверьте почту, включая
					папку «Спам».
				</p>
			{/if}
		{/if}
	</div>
</main>
