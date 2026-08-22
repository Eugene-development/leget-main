<script>
	import { enhance } from '$app/forms';

	let { data } = $props();

	function formatDate(value) {
		if (!value) return '—';
		return new Intl.DateTimeFormat('ru-RU', {
			dateStyle: 'short',
			timeStyle: 'short',
			timeZone: 'Europe/Moscow'
		}).format(new Date(value));
	}

	/** Ссылка постраничной навигации сохраняет активный поиск. */
	function pageHref(page) {
		const params = new URLSearchParams();
		params.set('page', String(page));
		if (data.search) params.set('search', data.search);
		return `?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>Мои клиенты — LEGET Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="min-h-screen bg-surface-warm px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-[1500px] pt-4 sm:pt-8">
		<header
			class="mb-8 flex flex-col gap-5 border-b border-border-light pb-8 md:flex-row md:items-end md:justify-between"
		>
			<div>
				<p class="text-[10px] font-bold tracking-[0.22em] text-secondary uppercase">
					Администрирование
				</p>
				<h1 class="mt-2 text-4xl text-text-primary sm:text-5xl">Мои клиенты</h1>
				<p class="mt-2 max-w-2xl text-sm text-text-secondary">
					Регистрации в личном кабинете. Администраторы платформы в список не попадают — роль
					определяется тем же allowlist, что и доступ к этой панели.
				</p>
			</div>

			<div class="flex items-center gap-3">
				<a
					href="/admin"
					class="rounded-xl border border-border-medium bg-white px-5 py-3 text-xs font-bold tracking-wider text-text-primary uppercase transition hover:bg-surface"
				>
					Конверсии
				</a>
				<form method="POST" action="?/logout" use:enhance>
					<button
						type="submit"
						class="rounded-xl border border-border-medium bg-white px-5 py-3 text-xs font-bold tracking-wider text-text-primary uppercase transition hover:bg-surface"
					>
						Выйти
					</button>
				</form>
			</div>
		</header>

		{#if data.summary}
			<section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Сводка по клиентам">
				<div class="rounded-2xl border border-border-light bg-surface-card p-5 shadow-card">
					<span class="text-[10px] font-bold tracking-wider text-text-secondary uppercase">
						Всего
					</span>
					<strong class="mt-2 block text-4xl font-light text-text-primary">
						{data.summary.total}
					</strong>
				</div>
				<div class="rounded-2xl border border-border-light bg-surface-card p-5 shadow-card">
					<span class="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">
						Email подтверждён
					</span>
					<strong class="mt-2 block text-4xl font-light text-text-primary">
						{data.summary.verified}
					</strong>
				</div>
				<div class="rounded-2xl border border-border-light bg-surface-card p-5 shadow-card">
					<span class="text-[10px] font-bold tracking-wider text-amber-700 uppercase">
						За 30 дней
					</span>
					<strong class="mt-2 block text-4xl font-light text-text-primary">
						{data.summary.last_30_days}
					</strong>
				</div>
			</section>
		{/if}

		<form
			method="GET"
			class="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(220px,1fr)_auto_auto]"
		>
			<input
				name="search"
				value={data.search}
				placeholder="Имя, email, телефон или регион"
				class="h-11 rounded-xl border-border-light bg-surface px-4 text-sm text-text-primary focus:border-secondary focus:ring-secondary/20"
			/>
			<button
				type="submit"
				class="h-11 rounded-xl bg-primary px-5 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
			>
				Найти
			</button>
			{#if data.search}
				<a
					href="/admin/clients"
					class="flex h-11 items-center justify-center rounded-xl border border-border-medium px-5 text-xs font-bold tracking-wider text-text-primary uppercase transition hover:bg-surface"
				>
					Сбросить
				</a>
			{/if}
		</form>

		{#if data.apiError}
			<p class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
				{data.apiError}
			</p>
		{:else if data.clients}
			<section
				class="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card"
			>
				<div class="overflow-x-auto">
					<table class="w-full min-w-[980px] border-collapse text-left text-sm">
						<thead class="bg-primary text-white">
							<tr>
								<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Регистрация</th>
								<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Имя</th>
								<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Email</th>
								<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Телефон</th>
								<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Регион</th>
								<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Подтверждение</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border-light">
							{#each data.clients.data as client (client.id)}
								<tr class="align-top transition hover:bg-surface">
									<td class="px-5 py-4 text-xs whitespace-nowrap text-text-secondary">
										{formatDate(client.created_at)}
									</td>
									<td class="max-w-56 px-5 py-4 font-semibold text-text-primary">
										{client.name || '—'}
									</td>
									<td class="max-w-72 px-5 py-4 text-xs text-text-secondary">{client.email}</td>
									<td class="px-5 py-4 text-xs whitespace-nowrap text-text-secondary">
										{client.phone || '—'}
									</td>
									<td class="max-w-48 px-5 py-4 text-xs text-text-secondary">
										{client.region || '—'}
									</td>
									<td class="px-5 py-4">
										<span
											class={`rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase ${client.email_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
										>
											{client.email_verified ? 'Подтверждён' : 'Ожидает'}
										</span>
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="6" class="px-5 py-12 text-center text-text-secondary">
										{data.search ? 'По запросу никого не нашлось.' : 'Регистраций пока нет.'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				{#if data.clients.last_page > 1}
					<nav
						class="flex items-center justify-between border-t border-border-light px-5 py-4 text-sm"
					>
						<span class="text-text-secondary">
							Страница {data.clients.current_page} из {data.clients.last_page}
						</span>
						<div class="flex gap-2">
							{#if data.clients.current_page > 1}
								<a
									href={pageHref(data.clients.current_page - 1)}
									class="rounded-lg border border-border-light px-3 py-2 text-xs font-bold uppercase transition hover:bg-surface"
								>
									Назад
								</a>
							{/if}
							{#if data.clients.current_page < data.clients.last_page}
								<a
									href={pageHref(data.clients.current_page + 1)}
									class="rounded-lg border border-border-light px-3 py-2 text-xs font-bold uppercase transition hover:bg-surface"
								>
									Далее
								</a>
							{/if}
						</div>
					</nav>
				{/if}
			</section>
		{/if}
	</div>
</main>
