<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();
	let offlineType = $state('');
	let contactPlaceholder = $derived(
		offlineType === 'call'
			? 'Номер телефона'
			: offlineType === 'email'
				? 'Электронная почта'
				: 'Телефон или email'
	);
	const today = new Date().toISOString().slice(0, 10);

	const typeLabels = {
		consultation: 'Консультация',
		'design-project': 'Дизайн-проект',
		'furniture-project': 'Мебельный проект',
		assembly: 'Сборка',
		measurement: 'Замер',
		partnership: 'Партнёрство',
		offline_call: 'Звонок',
		offline_email: 'Почта'
	};

	function formatDate(value) {
		if (!value) return '—';
		return new Intl.DateTimeFormat('ru-RU', {
			dateStyle: 'short',
			timeStyle: 'short',
			timeZone: 'Europe/Moscow'
		}).format(new Date(value));
	}
</script>

<svelte:head>
	<title>Конверсии — LEGET Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="min-h-screen bg-surface-warm px-4 py-12 sm:px-6 lg:px-8">
	{#if !data.authenticated}
		<section class="mx-auto pt-8 sm:pt-16">
			<div
				class="mx-auto max-w-md overflow-hidden rounded-3xl border border-border-light bg-surface-card shadow-elevated"
			>
				<div class="bg-primary px-7 py-8 text-text-inverse sm:px-9">
					<p class="text-[10px] font-bold tracking-[0.22em] text-white/55 uppercase">LEGET</p>
					<h1 class="mt-3 text-3xl font-light">Панель конверсий</h1>
					<p class="mt-2 text-sm leading-relaxed text-white/65">
						Доступ разрешён только администраторам платформы.
					</p>
				</div>

				<form method="POST" action="?/login" use:enhance class="space-y-5 p-7 sm:p-9">
					<label class="block">
						<span
							class="mb-2 block text-[10px] font-bold tracking-wider text-text-secondary uppercase"
						>
							Email
						</span>
						<input
							name="email"
							type="email"
							autocomplete="username"
							required
							value={form?.action === 'login' ? form.email || '' : ''}
							class="w-full rounded-xl border-border-light bg-surface px-4 py-3 text-sm text-text-primary shadow-card focus:border-secondary focus:ring-secondary/20"
						/>
					</label>

					<label class="block">
						<span
							class="mb-2 block text-[10px] font-bold tracking-wider text-text-secondary uppercase"
						>
							Пароль
						</span>
						<input
							name="password"
							type="password"
							autocomplete="current-password"
							required
							class="w-full rounded-xl border-border-light bg-surface px-4 py-3 text-sm text-text-primary shadow-card focus:border-secondary focus:ring-secondary/20"
						/>
					</label>

					{#if data.sessionExpired}
						<p class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
							Сессия истекла. Войдите снова.
						</p>
					{/if}
					{#if form?.action === 'login' && form.message}
						<p class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
							{form.message}
						</p>
					{/if}

					<button
						type="submit"
						class="w-full rounded-xl bg-primary px-5 py-3.5 text-xs font-bold tracking-[0.16em] text-white uppercase transition hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
					>
						Войти
					</button>
				</form>
			</div>
		</section>
	{:else}
		<div class="mx-auto max-w-[1500px] pt-4 sm:pt-8">
			<header
				class="mb-8 flex flex-col gap-5 border-b border-border-light pb-8 md:flex-row md:items-end md:justify-between"
			>
				<div>
					<p class="text-[10px] font-bold tracking-[0.22em] text-secondary uppercase">
						Администрирование
					</p>
					<h1 class="mt-2 text-4xl font-light tracking-tight text-text-primary sm:text-5xl">
						Конверсии
					</h1>
					<p class="mt-2 max-w-2xl text-sm text-text-secondary">
						Онлайн-заявки с сайтов и офлайн-обращения, добавленные менеджером.
					</p>
				</div>

				<form method="POST" action="?/logout" use:enhance>
					<button
						type="submit"
						class="rounded-xl border border-border-medium bg-white px-5 py-3 text-xs font-bold tracking-wider text-text-primary uppercase transition hover:bg-surface focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
					>
						Выйти
					</button>
				</form>
			</header>

			{#if data.summary}
				<section class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Сводка конверсий">
					<div class="rounded-2xl border border-border-light bg-surface-card p-5 shadow-card">
						<span class="text-[10px] font-bold tracking-wider text-text-secondary uppercase"
							>Всего</span
						>
						<strong class="mt-2 block text-4xl font-light text-text-primary"
							>{data.summary.total}</strong
						>
					</div>
					<div class="rounded-2xl border border-border-light bg-surface-card p-5 shadow-card">
						<span class="text-[10px] font-bold tracking-wider text-emerald-700 uppercase"
							>Онлайн</span
						>
						<strong class="mt-2 block text-4xl font-light text-text-primary"
							>{data.summary.online}</strong
						>
					</div>
					<div class="rounded-2xl border border-border-light bg-surface-card p-5 shadow-card">
						<span class="text-[10px] font-bold tracking-wider text-amber-700 uppercase">Офлайн</span
						>
						<strong class="mt-2 block text-4xl font-light text-text-primary"
							>{data.summary.offline}</strong
						>
					</div>
				</section>
			{/if}

			<section
				class="mb-8 rounded-2xl border border-border-light bg-surface-card p-5 shadow-card md:p-6"
			>
				<div class="mb-5">
					<h2 class="text-2xl font-light text-text-primary">Добавить офлайн-конверсию</h2>
					<p class="mt-1 text-sm text-text-secondary">
						Зафиксируйте обращение из звонка или почты; идентификатор визита нужен для связки с
						рекламой.
					</p>
				</div>

				<form
					method="POST"
					action="?/createOffline"
					use:enhance
					class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
				>
					<select
						name="offline_type"
						required
						bind:value={offlineType}
						class="rounded-xl border-border-light bg-surface px-4 py-3 text-sm text-text-primary focus:border-secondary focus:ring-secondary/20"
					>
						<option value="" disabled>Тип обращения</option>
						<option value="call">Звонок</option>
						<option value="email">Почта</option>
					</select>
					<input
						name="name"
						required
						placeholder="Имя / компания"
						value={form?.action === 'createOffline' ? form.values?.name || '' : ''}
						class="rounded-xl border-border-light bg-surface px-4 py-3 text-sm text-text-primary focus:border-secondary focus:ring-secondary/20"
					/>
					<input
						name="contact"
						type={offlineType === 'email' ? 'email' : offlineType === 'call' ? 'tel' : 'text'}
						required
						placeholder={contactPlaceholder}
						value={form?.action === 'createOffline' ? form.values?.contact || '' : ''}
						class="rounded-xl border-border-light bg-surface px-4 py-3 text-sm text-text-primary focus:border-secondary focus:ring-secondary/20"
					/>
					<input
						name="ad_id"
						inputmode="numeric"
						pattern="[0-9]{(1, 32)}"
						placeholder="ID визита Яндекса"
						value={form?.action === 'createOffline' ? form.values?.ad_id || '' : ''}
						class="rounded-xl border-border-light bg-surface px-4 py-3 font-mono text-sm text-text-primary focus:border-secondary focus:ring-secondary/20"
					/>
					<button
						type="submit"
						class="rounded-xl bg-primary px-5 py-3 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-primary-light focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
					>
						Добавить
					</button>
					<textarea
						name="comment"
						rows="4"
						placeholder="Комментарий"
						class="min-h-28 resize-y rounded-xl border-border-light bg-surface px-4 py-3 text-sm leading-relaxed text-text-primary focus:border-secondary focus:ring-secondary/20 md:col-span-2 xl:col-span-5"
						>{form?.action === 'createOffline' ? form.values?.comment || '' : ''}</textarea
					>
				</form>

				{#if form?.action === 'createOffline' && form.message}
					<p
						class={`mt-4 rounded-xl border p-3 text-sm ${form.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}
					>
						{form.message}
					</p>
				{/if}
			</section>

			<section
				class="mb-8 rounded-2xl border border-border-light bg-surface-card p-5 shadow-card md:p-6"
			>
				<div class="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
					<div class="max-w-3xl">
						<h2 class="text-2xl font-light text-text-primary">Выгрузка офлайн-конверсий</h2>
						<p class="mt-1 text-sm leading-relaxed text-text-secondary">
							CSV для Центра конверсий Яндекс Директа: UTF-8, разделитель — точка с запятой. В файл
							попадут только корректные номера и email.
						</p>
					</div>

					<form
						method="GET"
						action="/admin/export"
						class="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(150px,1fr)_minmax(170px,1fr)_auto]"
					>
						<label class="block">
							<span
								class="mb-2 block text-[9px] font-bold tracking-wider text-text-secondary uppercase"
								>Период</span
							>
							<select
								name="period"
								class="h-11 w-full rounded-xl border-border-light bg-surface px-4 text-sm text-text-primary focus:border-secondary focus:ring-secondary/20"
							>
								<option value="day">День</option>
								<option value="week">Неделя</option>
								<option value="month">Месяц</option>
								<option value="quarter">Квартал</option>
								<option value="year">Год</option>
							</select>
						</label>
						<label class="block">
							<span
								class="mb-2 block text-[9px] font-bold tracking-wider text-text-secondary uppercase"
								>Дата внутри периода</span
							>
							<input
								name="date"
								type="date"
								required
								max={today}
								value={today}
								class="h-11 w-full rounded-xl border-border-light bg-surface px-4 text-sm text-text-primary focus:border-secondary focus:ring-secondary/20"
							/>
						</label>
						<button
							type="submit"
							class="h-11 self-end rounded-xl bg-secondary px-5 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-primary focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
						>
							Скачать CSV
						</button>
					</form>
				</div>
				<p class="mt-4 text-xs leading-relaxed text-text-secondary">
					Яндекс принимает конверсии не старше 113 дней. Для периода выгружается его часть в
					пределах этого окна.
				</p>
			</section>

			{#if data.apiError}
				<p class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
					{data.apiError}
				</p>
			{:else if data.conversions}
				<section
					class="overflow-hidden rounded-2xl border border-border-light bg-surface-card shadow-card"
				>
					<div class="overflow-x-auto">
						<table class="w-full min-w-[1040px] border-collapse text-left text-sm">
							<thead class="bg-primary text-white">
								<tr>
									<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Дата</th>
									<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Канал</th>
									<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Тип</th>
									<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Клиент</th>
									<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Контакт</th>
									<th class="px-5 py-4 text-[9px] tracking-wider uppercase">ID визита</th>
									<th class="px-5 py-4 text-[9px] tracking-wider uppercase">Комментарий</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-border-light">
								{#each data.conversions.data as conversion (conversion.id)}
									<tr class="align-top transition hover:bg-surface">
										<td class="px-5 py-4 text-xs whitespace-nowrap text-text-secondary"
											>{formatDate(conversion.created_at)}</td
										>
										<td class="px-5 py-4">
											<span
												class={`rounded-full px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase ${conversion.channel === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
											>
												{conversion.channel === 'online' ? 'Онлайн' : 'Офлайн'}
											</span>
										</td>
										<td class="px-5 py-4 text-xs font-semibold text-text-primary"
											>{typeLabels[conversion.type] || conversion.type}</td
										>
										<td class="max-w-56 px-5 py-4 font-semibold text-text-primary"
											>{conversion.name || '—'}</td
										>
										<td class="max-w-56 px-5 py-4 text-xs text-text-secondary"
											>{conversion.contact || '—'}</td
										>
										<td class="px-5 py-4">
											{#if conversion.ad_id}
												<code
													class="rounded-md bg-surface-muted px-2 py-1 font-mono text-xs font-bold text-secondary"
													>{conversion.ad_id}</code
												>
											{:else}
												<span class="text-text-muted">—</span>
											{/if}
										</td>
										<td class="max-w-72 px-5 py-4 text-xs leading-relaxed text-text-secondary"
											>{conversion.comment || '—'}</td
										>
									</tr>
								{:else}
									<tr
										><td colspan="7" class="px-5 py-12 text-center text-text-secondary"
											>Конверсий пока нет.</td
										></tr
									>
								{/each}
							</tbody>
						</table>
					</div>

					{#if data.conversions.last_page > 1}
						<nav
							class="flex items-center justify-between border-t border-border-light px-5 py-4 text-sm"
						>
							<span class="text-text-secondary"
								>Страница {data.conversions.current_page} из {data.conversions.last_page}</span
							>
							<div class="flex gap-2">
								{#if data.conversions.current_page > 1}
									<a
										href={`?page=${data.conversions.current_page - 1}`}
										class="rounded-lg border border-border-light px-3 py-2 text-xs font-bold uppercase transition hover:bg-surface"
										>Назад</a
									>
								{/if}
								{#if data.conversions.current_page < data.conversions.last_page}
									<a
										href={`?page=${data.conversions.current_page + 1}`}
										class="rounded-lg border border-border-light px-3 py-2 text-xs font-bold uppercase transition hover:bg-surface"
										>Далее</a
									>
								{/if}
							</div>
						</nav>
					{/if}
				</section>
			{/if}
		</div>
	{/if}
</main>
