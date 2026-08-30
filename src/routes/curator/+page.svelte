<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		discount,
		formatDate,
		money,
		statusLabel,
		statusTone,
		STATUS_ORDER
	} from '$lib/utils/promo';
	import type { PromoCard, PromoFormResult } from '$lib/utils/promo';
	import type { PageData } from './$types';

	let { data, form }: { data: PageData; form: PromoFormResult | null } = $props();

	const codes = $derived(data.promoCodes?.data ?? []);
	const total = $derived(data.promoCodes?.total ?? 0);
	const today = new Date().toISOString().slice(0, 10);

	/** Открытая форма у строки: 'deal' | 'partner' | 'cancel' | null. */
	let openForm = $state<{ id: string; kind: string } | null>(null);

	function toggle(id: string, kind: string): void {
		openForm = openForm && openForm.id === id && openForm.kind === kind ? null : { id, kind };
	}

	function isOpen(id: string, kind: string): boolean {
		return openForm?.id === id && openForm.kind === kind;
	}

	let showCreate = $state(false);
	let discountType = $state('percent');

	function canReportDeal(code: PromoCard): boolean {
		return ['activated', 'presented', 'order_created'].includes(code.status) && !code.deal;
	}

	function canCancel(code: PromoCard): boolean {
		return !['closed', 'cancelled', 'refunded', 'expired'].includes(code.status);
	}
</script>

<svelte:head>
	<title>Кабинет куратора</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="min-h-screen bg-surface-warm px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-5xl">
		{#if data.serviceUnavailable}
			<section class="rounded-3xl border border-border-light bg-surface-raised p-8 shadow-card">
				<h1 class="text-3xl text-ink-950">Кабинет временно недоступен</h1>
				<p class="mt-3 text-sm text-ink-500">Сервис авторизации не отвечает. Обновите страницу.</p>
			</section>
		{:else}
			<header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p class="text-xs tracking-[0.18em] text-ink-400 uppercase">Кабинет куратора</p>
					<h1 class="mt-1 text-3xl text-ink-950">{data.profile?.name}</h1>
					<p class="mt-2 text-sm text-ink-500">Промокодов под сопровождением: {total}.</p>
				</div>
				<a
					href="/"
					class="self-start rounded-xl border border-border-medium px-5 py-3 text-sm text-ink-700 transition hover:bg-surface-muted"
				>
					На сайт
				</a>
			</header>

			{#if data.report}
				<section
					class="mb-8 grid gap-4 rounded-3xl border border-border-light bg-surface-raised p-7 shadow-card sm:grid-cols-4"
				>
					<div>
						<p class="text-xs text-ink-400">Закрытых сделок</p>
						<p class="mt-1 text-2xl text-ink-950">{data.report.closed_deals}</p>
					</div>
					<div>
						<p class="text-xs text-ink-400">Сумма сделок</p>
						<p class="mt-1 text-2xl text-ink-950">{money(data.report.deals_total)}</p>
					</div>
					<div>
						<p class="text-xs text-ink-400">Сумма скидок</p>
						<p class="mt-1 text-2xl text-ink-950">{money(data.report.discount_total)}</p>
					</div>
					<div>
						<p class="text-xs text-ink-400">Вознаграждение</p>
						{#if data.report.commission_configured}
							<p class="mt-1 text-2xl text-ink-950">{money(data.report.commission_total)}</p>
						{:else}
							<!--
								«Не настроено» и «ноль» — разные ответы. Показать 0 ₽ значило бы
								соврать про существующее, но нулевое начисление.
							-->
							<p class="mt-1 text-sm leading-relaxed text-ink-500">
								Формула вознаграждения не настроена администратором. Сделки учтены.
							</p>
						{/if}
					</div>
				</section>
			{/if}

			{#if data.queue.length > 0}
				<section
					class="mb-8 overflow-hidden rounded-3xl border border-border-light bg-surface-raised shadow-card"
				>
					<div class="border-b border-border-light px-7 py-5">
						<h2 class="text-xl text-ink-950">Очередь новых клиентов</h2>
						<p class="mt-1 text-sm text-ink-500">Зарегистрировались, промокода ещё нет.</p>
					</div>
					<ul class="divide-y divide-border-light">
						{#each data.queue as client (client.id)}
							<li class="flex flex-wrap items-center justify-between gap-3 px-7 py-4">
								<div>
									<p class="text-sm text-ink-950">{client.name}</p>
									<p class="text-xs text-ink-500">
										{client.email}
										{#if client.phone}
											· {client.phone}
										{/if}
										{#if client.region}
											· {client.region}
										{/if}
									</p>
								</div>
								<div class="flex items-center gap-3">
									{#if client.from_advertising}
										<span class="rounded-full bg-cat-4-50 px-2.5 py-1 text-xs text-cat-4-700">
											из рекламы
										</span>
									{/if}
									<span class="text-xs text-ink-400">{formatDate(client.registered_at, false)}</span
									>
								</div>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
				<form method="GET" class="flex flex-wrap items-end gap-3">
					<div>
						<label class="block text-xs text-ink-400" for="status">Статус</label>
						<select
							id="status"
							name="status"
							class="mt-1 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-800"
						>
							<option value="">Все</option>
							{#each STATUS_ORDER as status (status)}
								<option value={status} selected={data.status === status}>
									{statusLabel(status)}
								</option>
							{/each}
						</select>
					</div>
					<label class="flex items-center gap-2 pb-2 text-sm text-ink-700">
						<input type="checkbox" name="overdue" value="1" checked={data.overdue} class="size-4" />
						Просроченные действия
					</label>
					<button
						type="submit"
						class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-700 transition hover:bg-surface-muted"
					>
						Показать
					</button>
				</form>

				<button
					type="button"
					onclick={() => (showCreate = !showCreate)}
					class="rounded-xl bg-ink-950 px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
				>
					{showCreate ? 'Скрыть форму' : 'Создать промокод'}
				</button>
			</div>

			{#if showCreate}
				<form
					method="POST"
					action="?/create"
					use:enhance
					class="mb-8 rounded-3xl border border-border-light bg-surface-raised p-7 shadow-card"
				>
					<h2 class="text-xl text-ink-950">Новый промокод</h2>
					<p class="mt-1 text-sm text-ink-500">
						Код генерирует сервер — он случайный и не содержит данных клиента.
					</p>

					<div class="mt-5 grid gap-4 sm:grid-cols-2">
						<div>
							<label class="block text-xs text-ink-400" for="client_id">Клиент</label>
							<select
								id="client_id"
								name="client_id"
								required
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							>
								<option value="">Выберите из очереди</option>
								{#each data.queue as client (client.id)}
									<option value={client.id}>{client.name} — {client.email}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-xs text-ink-400" for="partner_id">Партнёр</label>
							<select
								id="partner_id"
								name="partner_id"
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							>
								<option value="">Назначить позже</option>
								{#each data.partners as partner (partner.id)}
									<option value={partner.id}>{partner.company || partner.name}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-xs text-ink-400" for="subject_type">Предмет скидки</label>
							<select
								id="subject_type"
								name="subject_type"
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							>
								<option value="category">Категория каталога</option>
								<option value="mebel_project">Проект мебели</option>
								<option value="service">Услуга</option>
								<option value="custom">Разовое предложение</option>
							</select>
						</div>
						<div>
							<label class="block text-xs text-ink-400" for="subject_title">
								Название для клиента
							</label>
							<input
								id="subject_title"
								name="subject_title"
								required
								maxlength="255"
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							/>
						</div>
						<div>
							<label class="block text-xs text-ink-400" for="discount_type">Вид скидки</label>
							<select
								id="discount_type"
								name="discount_type"
								bind:value={discountType}
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							>
								<option value="percent">Процент</option>
								<option value="fixed">Фиксированная сумма</option>
							</select>
						</div>
						<div>
							<label class="block text-xs text-ink-400" for="discount_value">
								{discountType === 'percent' ? 'Процент (1–100)' : 'Сумма скидки, ₽'}
							</label>
							<input
								id="discount_value"
								name="discount_value"
								inputmode="decimal"
								required
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							/>
						</div>
						<div>
							<label class="block text-xs text-ink-400" for="minimum_order_amount">
								Минимальная сумма заказа (необязательно)
							</label>
							<input
								id="minimum_order_amount"
								name="minimum_order_amount"
								inputmode="decimal"
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							/>
						</div>
						<div>
							<label class="block text-xs text-ink-400" for="expires_at">Действует до</label>
							<input
								id="expires_at"
								name="expires_at"
								type="date"
								min={today}
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							/>
						</div>
						<div class="sm:col-span-2">
							<label class="block text-xs text-ink-400" for="terms">Условия применения</label>
							<textarea
								id="terms"
								name="terms"
								rows="2"
								maxlength="2000"
								class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
							></textarea>
						</div>
					</div>

					{#if form?.action === 'create' && form?.message}
						<p class="mt-4 text-sm text-cat-1-700">{form.message}</p>
					{/if}

					<button
						type="submit"
						class="mt-5 rounded-xl bg-ink-950 px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
					>
						Создать
					</button>
				</form>
			{/if}

			{#if data.apiError}
				<p
					class="mb-6 rounded-2xl border border-border-light bg-surface-muted p-5 text-sm text-ink-600"
				>
					{data.apiError}
				</p>
			{/if}

			{#if codes.length === 0}
				<section class="rounded-3xl border border-dashed border-border-medium bg-surface-muted p-7">
					<h2 class="text-xl text-ink-950">Промокодов нет</h2>
					<p class="mt-2 text-sm text-ink-600">
						Создайте промокод клиенту из очереди — он появится здесь и станет виден клиенту после
						активации.
					</p>
				</section>
			{:else}
				<ul class="space-y-4">
					{#each codes as code (code.id)}
						<li class="rounded-3xl border border-border-light bg-surface-raised shadow-card">
							<div class="flex flex-wrap items-start justify-between gap-4 px-7 py-5">
								<div>
									<p class="font-mono text-lg tracking-wider text-ink-950">{code.code}</p>
									<p class="mt-1 text-sm text-ink-500">{code.subject_title}</p>
									<p class="mt-2 text-sm text-ink-700">
										{code.client?.name ?? '—'}
										{#if code.client?.phone}
											· {code.client.phone}
										{/if}
									</p>
									<p class="text-sm text-ink-500">
										Партнёр: {code.partner?.company || code.partner?.name || 'не назначен'}
									</p>
								</div>
								<div class="text-right">
									<p class="text-lg text-ink-950">
										{discount(code.discount_type, code.discount_value, code.currency)}
									</p>
									<span
										class="mt-1 inline-flex rounded-full px-2.5 py-1 text-xs {statusTone(
											code.status
										)}"
									>
										{statusLabel(code.status)}
									</span>
									<p class="mt-2 text-xs text-ink-400">до {formatDate(code.expires_at, false)}</p>
									{#if code.has_attribution}
										<p class="mt-1 text-xs text-ink-400">клиент пришёл из рекламы</p>
									{/if}
								</div>
							</div>

							{#if form?.message && form?.id === code.id}
								<p class="border-t border-border-light px-7 py-3 text-sm text-cat-1-700">
									{form.message}
								</p>
							{/if}

							<div class="flex flex-wrap gap-3 border-t border-border-light px-7 py-4">
								{#if code.status === 'created'}
									<form method="POST" action="?/activate" use:enhance>
										<input type="hidden" name="id" value={code.id} />
										<button
											type="submit"
											class="rounded-xl bg-ink-950 px-4 py-2 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
										>
											Активировать
										</button>
									</form>

									<button
										type="button"
										onclick={() => toggle(code.id, 'partner')}
										class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
									>
										Назначить партнёра
									</button>
								{/if}

								{#if canReportDeal(code)}
									<button
										type="button"
										onclick={() => toggle(code.id, 'deal')}
										class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
									>
										Внести сделку за партнёра
									</button>
								{/if}

								{#if canCancel(code)}
									<button
										type="button"
										onclick={() => toggle(code.id, 'cancel')}
										class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
									>
										Отменить
									</button>
								{/if}
							</div>

							{#if isOpen(code.id, 'partner')}
								<form
									method="POST"
									action="?/assignPartner"
									use:enhance
									class="flex flex-wrap items-end gap-3 border-t border-border-light bg-surface-muted px-7 py-5"
								>
									<input type="hidden" name="id" value={code.id} />
									<div>
										<label class="block text-xs text-ink-400" for="p-{code.id}">Партнёр</label>
										<select
											id="p-{code.id}"
											name="partner_id"
											required
											class="mt-1 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
										>
											{#each data.partners as partner (partner.id)}
												<option value={partner.id}>
													{partner.company || partner.name}{partner.city
														? ` — ${partner.city}`
														: ''}
												</option>
											{/each}
										</select>
									</div>
									<button
										type="submit"
										class="rounded-xl bg-ink-950 px-5 py-2 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
									>
										Назначить
									</button>
								</form>
							{/if}

							{#if isOpen(code.id, 'deal')}
								<form
									method="POST"
									action="?/reportDeal"
									use:enhance
									class="border-t border-border-light bg-surface-muted px-7 py-5"
								>
									<input type="hidden" name="id" value={code.id} />
									<h3 class="p1-title-sub text-ink-950">Сведения о сделке от имени партнёра</h3>
									<!--
										Прямая формулировка вместо тумблера: куратор не может внести
										сделку «как партнёр» незаметно — отметка и основание уходят
										на сервер всегда, и сервер без них откажет.
									-->
									<p class="mt-1 text-xs leading-relaxed text-ink-500">
										Действие будет записано в журнал как выполненное от имени партнёра.
										Подтверждённой сделка не станет: данные проверит клиент, а закрывает её
										платформа.
									</p>

									<div class="mt-4 grid gap-4 sm:grid-cols-2">
										<div>
											<label class="block text-xs text-ink-400" for="con-{code.id}">
												Номер заказа или договора
											</label>
											<input
												id="con-{code.id}"
												name="order_number"
												required
												maxlength="64"
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div>
											<label class="block text-xs text-ink-400" for="cd-{code.id}"
												>Дата сделки</label
											>
											<input
												id="cd-{code.id}"
												name="deal_date"
												type="date"
												required
												max={today}
												value={today}
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div>
											<label class="block text-xs text-ink-400" for="cg-{code.id}"
												>Сумма заказа</label
											>
											<input
												id="cg-{code.id}"
												name="gross_amount"
												inputmode="decimal"
												required
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div>
											<label class="block text-xs text-ink-400" for="cdi-{code.id}">
												Фактическая скидка
											</label>
											<input
												id="cdi-{code.id}"
												name="discount_amount"
												inputmode="decimal"
												required
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div class="sm:col-span-2">
											<label class="block text-xs text-ink-400" for="cb-{code.id}">
												Основание — почему сведения вносит куратор, а не партнёр
											</label>
											<input
												id="cb-{code.id}"
												name="behalf_reason"
												required
												minlength="3"
												maxlength="2000"
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div class="sm:col-span-2">
											<label class="block text-xs text-ink-400" for="cc-{code.id}"
												>Комментарий</label
											>
											<textarea
												id="cc-{code.id}"
												name="comment"
												rows="2"
												maxlength="2000"
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											></textarea>
										</div>
									</div>

									<button
										type="submit"
										class="mt-4 rounded-xl bg-ink-950 px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
									>
										Заявить сделку
									</button>
								</form>
							{/if}

							{#if isOpen(code.id, 'cancel')}
								<form
									method="POST"
									action="?/cancel"
									use:enhance
									class="flex flex-wrap items-end gap-3 border-t border-border-light bg-surface-muted px-7 py-5"
								>
									<input type="hidden" name="id" value={code.id} />
									<div class="grow">
										<label class="block text-xs text-ink-400" for="cr-{code.id}">
											Основание отмены
										</label>
										<input
											id="cr-{code.id}"
											name="reason"
											required
											minlength="3"
											maxlength="2000"
											class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
										/>
									</div>
									<button
										type="submit"
										class="rounded-xl border border-border-medium px-5 py-2 text-sm text-ink-800 transition hover:bg-surface-raised"
									>
										Отменить промокод
									</button>
								</form>
							{/if}

							{#if code.deal}
								<dl
									class="grid gap-x-4 gap-y-3 border-t border-border-light bg-surface-muted px-7 py-5 sm:grid-cols-4"
								>
									<div>
										<dt class="text-xs text-ink-400">Заказ</dt>
										<dd class="text-sm text-ink-900">{code.deal.order_number}</dd>
									</div>
									<div>
										<dt class="text-xs text-ink-400">Итог</dt>
										<dd class="text-sm text-ink-900">
											{money(code.deal.net_amount, code.deal.currency)}
										</dd>
									</div>
									<div>
										<dt class="text-xs text-ink-400">Внёс</dt>
										<dd class="text-sm text-ink-900">
											{code.deal.on_behalf_of_partner ? 'куратор за партнёра' : 'партнёр'}
										</dd>
									</div>
									<div>
										<dt class="text-xs text-ink-400">Ответ клиента</dt>
										<dd class="text-sm text-ink-900">
											{code.deal.client_response_label ?? 'ожидается'}
										</dd>
									</div>
								</dl>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</main>
