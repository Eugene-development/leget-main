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

	/** Можно ли ещё заявить сделку по коду. */
	function canReportDeal(code: PromoCard): boolean {
		return ['activated', 'presented', 'order_created'].includes(code.status) && !code.deal;
	}

	function canPresent(code: PromoCard): boolean {
		return code.status === 'activated';
	}

	function canCreateOrder(code: PromoCard): boolean {
		return ['activated', 'presented'].includes(code.status);
	}

	function cardHref(id: string): string {
		const params = new URLSearchParams();
		if (data.status) params.set('status', data.status);
		if (data.code) params.set('code', data.code);
		params.set('open', id);
		return `?${params.toString()}`;
	}
</script>

<svelte:head>
	<title>Промокоды — кабинет партнёра</title>
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
					<p class="text-xs tracking-[0.18em] text-ink-400 uppercase">Кабинет партнёра</p>
					<h1 class="mt-1 text-3xl text-ink-950">Промокоды</h1>
					<p class="mt-2 text-sm text-ink-500">
						Назначено вашей организации: {total}. Клиент предъявляет код — вы отмечаете предъявление
						и вносите сведения о сделке.
					</p>
				</div>
				<a
					href="/partner"
					class="self-start rounded-xl border border-border-medium px-5 py-3 text-sm text-ink-700 transition hover:bg-surface-muted"
				>
					В кабинет
				</a>
			</header>

			<form method="GET" class="mb-6 flex flex-wrap items-end gap-3">
				<div>
					<label class="block text-xs text-ink-400" for="code">Поиск по коду</label>
					<input
						id="code"
						name="code"
						value={data.code ?? ''}
						placeholder="LG-…"
						class="mt-1 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
					/>
				</div>
				<div>
					<label class="block text-xs text-ink-400" for="status">Статус</label>
					<select
						id="status"
						name="status"
						class="mt-1 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-800"
					>
						<option value="">Все</option>
						{#each STATUS_ORDER as status (status)}
							<option value={status} selected={data.status === status}>{statusLabel(status)}</option
							>
						{/each}
					</select>
				</div>
				<button
					type="submit"
					class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-700 transition hover:bg-surface-muted"
				>
					Показать
				</button>
			</form>

			{#if data.apiError}
				<p
					class="mb-6 rounded-2xl border border-border-light bg-surface-muted p-5 text-sm text-ink-600"
				>
					{data.apiError}
				</p>
			{/if}

			{#if codes.length === 0}
				<section class="rounded-3xl border border-dashed border-border-medium bg-surface-muted p-7">
					<h2 class="text-xl text-ink-950">Промокодов пока нет</h2>
					<p class="mt-2 text-sm leading-relaxed text-ink-600">
						Коды назначает куратор платформы. Здесь появятся только активированные — черновики
						кураторов вам не видны.
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
										Клиент: {code.client?.name ?? '—'}
										{#if code.client?.phone}
											· {code.client.phone}
										{/if}
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
								</div>
							</div>

							{#if code.terms}
								<p class="border-t border-border-light px-7 py-3 text-sm text-ink-600">
									{code.terms}
								</p>
							{/if}

							{#if form?.message && form?.id === code.id}
								<p class="border-t border-border-light px-7 py-3 text-sm text-cat-1-700">
									{form.message}
								</p>
							{/if}

							<div class="flex flex-wrap gap-3 border-t border-border-light px-7 py-4">
								{#if canPresent(code)}
									<form method="POST" action="?/present" use:enhance>
										<input type="hidden" name="id" value={code.id} />
										<button
											type="submit"
											class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
										>
											Код предъявлен
										</button>
									</form>
								{/if}

								{#if canCreateOrder(code)}
									<form method="POST" action="?/order" use:enhance>
										<input type="hidden" name="id" value={code.id} />
										<button
											type="submit"
											class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
										>
											Оформлен заказ
										</button>
									</form>
								{/if}

								<a
									href={cardHref(code.id)}
									class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
								>
									История действий
								</a>
							</div>

							{#if canReportDeal(code)}
								<form
									method="POST"
									action="?/reportDeal"
									use:enhance
									class="border-t border-border-light bg-surface-muted px-7 py-5"
								>
									<input type="hidden" name="id" value={code.id} />
									<h3 class="p1-title-sub text-ink-950">Заявить сделку</h3>
									<p class="mt-1 text-xs text-ink-500">
										Сведения проверит клиент. Итоговую сумму считает платформа: заказ минус
										фактическая скидка.
									</p>

									<div class="mt-4 grid gap-4 sm:grid-cols-2">
										<div>
											<label class="block text-xs text-ink-400" for="order-{code.id}">
												Номер заказа или договора
											</label>
											<input
												id="order-{code.id}"
												name="order_number"
												required
												maxlength="64"
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div>
											<label class="block text-xs text-ink-400" for="date-{code.id}">
												Дата сделки
											</label>
											<input
												id="date-{code.id}"
												name="deal_date"
												type="date"
												required
												max={today}
												value={today}
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div>
											<label class="block text-xs text-ink-400" for="gross-{code.id}">
												Сумма заказа
											</label>
											<input
												id="gross-{code.id}"
												name="gross_amount"
												inputmode="decimal"
												required
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div>
											<label class="block text-xs text-ink-400" for="disc-{code.id}">
												Фактическая скидка
											</label>
											<input
												id="disc-{code.id}"
												name="discount_amount"
												inputmode="decimal"
												required
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div>
											<label class="block text-xs text-ink-400" for="cat-{code.id}">
												Категория товара или услуги
											</label>
											<input
												id="cat-{code.id}"
												name="category"
												maxlength="120"
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div>
											<label class="block text-xs text-ink-400" for="doc-{code.id}">
												Ссылка на документ (необязательно)
											</label>
											<input
												id="doc-{code.id}"
												name="document_url"
												type="url"
												class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
											/>
										</div>
										<div class="sm:col-span-2">
											<label class="block text-xs text-ink-400" for="cmt-{code.id}">
												Комментарий
											</label>
											<textarea
												id="cmt-{code.id}"
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
							{:else if code.deal}
								<dl
									class="grid gap-x-4 gap-y-3 border-t border-border-light bg-surface-muted px-7 py-5 sm:grid-cols-3"
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
										<dt class="text-xs text-ink-400">Ответ клиента</dt>
										<dd class="text-sm text-ink-900">
											{code.deal.client_response_label ?? 'ожидается'}
										</dd>
									</div>
								</dl>
							{/if}

							{#if data.selected?.id === code.id}
								<div class="border-t border-border-light px-7 py-5">
									<h3 class="p1-title-sub text-ink-950">История действий</h3>
									<ol class="mt-3 space-y-2">
										{#each data.history as event (event.id)}
											<li class="flex flex-wrap gap-2 text-sm text-ink-700">
												<span class="text-ink-400">{formatDate(event.created_at)}</span>
												<span>{event.action_label}</span>
												{#if event.reason}
													<span class="text-ink-500">— {event.reason}</span>
												{/if}
											</li>
										{/each}
									</ol>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</main>
