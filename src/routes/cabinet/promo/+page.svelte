<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		CLIENT_RESPONSES,
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

	/** Какая карточка раскрыта — состояние страницы, на сервер не уезжает. */
	let openId = $state<string | null>(null);

	function toggle(id: string): void {
		openId = openId === id ? null : id;
	}

	/**
	 * Ждёт ли промокод ответа клиента.
	 *
	 * Форма подтверждения показывается только здесь. Это не защита — сервер
	 * откажет в любом другом состоянии, — а способ не предлагать невозможное.
	 */
	function awaitsAnswer(code: PromoCard): boolean {
		return code.status === 'deal_reported' && !code.deal?.client_response;
	}
</script>

<svelte:head>
	<title>Мои промокоды</title>
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
			</section>
		{:else}
			<header class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p class="text-xs tracking-[0.18em] text-ink-400 uppercase">Личный кабинет</p>
					<h1 class="mt-1 text-3xl text-ink-950">Мои промокоды</h1>
					<p class="mt-2 text-sm text-ink-500">
						{total}
						{total === 1 ? 'промокод' : 'промокодов'} — код, условия, партнёр и срок действия.
					</p>
				</div>
				<a
					href="/cabinet"
					class="self-start rounded-xl border border-border-medium px-5 py-3 text-sm text-ink-700 transition hover:bg-surface-muted"
				>
					В кабинет
				</a>
			</header>

			<form method="GET" class="mb-6 flex flex-wrap items-center gap-3">
				<label class="text-sm text-ink-500" for="status">Статус</label>
				<select
					id="status"
					name="status"
					class="rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-800"
				>
					<option value="">Все</option>
					{#each STATUS_ORDER as status (status)}
						<option value={status} selected={data.status === status}>{statusLabel(status)}</option>
					{/each}
				</select>
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
						Промокод создаёт куратор после разговора с вами. Как только он будет активирован, код и
						условия появятся здесь.
					</p>
				</section>
			{:else}
				<ul class="space-y-4">
					{#each codes as code (code.id)}
						<li
							class="overflow-hidden rounded-3xl border border-border-light bg-surface-raised shadow-card"
						>
							<div class="flex flex-wrap items-start justify-between gap-4 px-7 py-5">
								<div>
									<p class="font-mono text-lg tracking-wider text-ink-950">{code.code}</p>
									<p class="mt-1 text-sm text-ink-500">{code.subject_title}</p>
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
								</div>
							</div>

							<dl
								class="grid gap-x-4 gap-y-3 border-t border-border-light px-7 py-4 sm:grid-cols-2"
							>
								<div>
									<dt class="text-xs text-ink-400">Партнёр</dt>
									<dd class="text-sm text-ink-900">
										{code.partner?.company || code.partner?.name || 'ещё не назначен'}
									</dd>
								</div>
								<div>
									<dt class="text-xs text-ink-400">Действует до</dt>
									<dd class="text-sm text-ink-900">{formatDate(code.expires_at, false)}</dd>
								</div>
								{#if code.minimum_order_amount}
									<div>
										<dt class="text-xs text-ink-400">Минимальный заказ</dt>
										<dd class="text-sm text-ink-900">{money(code.minimum_order_amount)}</dd>
									</div>
								{/if}
								{#if code.terms}
									<div class="sm:col-span-2">
										<dt class="text-xs text-ink-400">Условия</dt>
										<dd class="text-sm leading-relaxed text-ink-700">{code.terms}</dd>
									</div>
								{/if}
							</dl>

							{#if code.deal}
								<div class="border-t border-border-light bg-surface-muted px-7 py-5">
									<h3 class="p1-title-sub text-ink-950">Заявленная сделка</h3>

									{#if code.deal.on_behalf_of_partner}
										<!--
											Клиенту показывается, что данные внёс куратор, а не партнёр.
											Скрыть это значило бы просить подтвердить неизвестно чьи слова.
										-->
										<p class="mt-1 text-xs text-ink-500">
											Сведения внёс куратор от имени партнёра.
										</p>
									{/if}

									<dl class="mt-3 grid gap-x-4 gap-y-3 sm:grid-cols-2">
										<div>
											<dt class="text-xs text-ink-400">Номер заказа</dt>
											<dd class="text-sm text-ink-900">{code.deal.order_number}</dd>
										</div>
										<div>
											<dt class="text-xs text-ink-400">Дата сделки</dt>
											<dd class="text-sm text-ink-900">{formatDate(code.deal.deal_date, false)}</dd>
										</div>
										<div>
											<dt class="text-xs text-ink-400">Сумма до скидки</dt>
											<dd class="text-sm text-ink-900">
												{money(code.deal.gross_amount, code.deal.currency)}
											</dd>
										</div>
										<div>
											<dt class="text-xs text-ink-400">Скидка</dt>
											<dd class="text-sm text-ink-900">
												{money(code.deal.discount_amount, code.deal.currency)}
											</dd>
										</div>
										<div>
											<dt class="text-xs text-ink-400">Итог</dt>
											<dd class="text-sm font-semibold text-ink-950">
												{money(code.deal.net_amount, code.deal.currency)}
											</dd>
										</div>
										{#if code.deal.client_response}
											<div>
												<dt class="text-xs text-ink-400">Ваш ответ</dt>
												<dd class="text-sm text-ink-900">
													{CLIENT_RESPONSES[code.deal.client_response] ?? code.deal.client_response}
												</dd>
											</div>
										{/if}
									</dl>

									{#if awaitsAnswer(code)}
										<div class="mt-5">
											<button
												type="button"
												onclick={() => toggle(code.id)}
												class="rounded-xl border border-border-medium px-5 py-3 text-sm text-ink-800 transition hover:bg-surface-raised"
											>
												{openId === code.id ? 'Свернуть' : 'Проверить и ответить'}
											</button>
										</div>

										{#if openId === code.id}
											<form
												method="POST"
												action="?/respond"
												use:enhance
												class="mt-4 space-y-3 rounded-2xl border border-border-light bg-surface-raised p-5"
											>
												<input type="hidden" name="id" value={code.id} />

												<fieldset class="space-y-2">
													<legend class="text-sm text-ink-700">
														Всё верно или есть расхождения?
													</legend>
													{#each Object.entries(CLIENT_RESPONSES) as [value, label] (value)}
														<label class="flex items-center gap-2 text-sm text-ink-800">
															<input type="radio" name="response" {value} required class="size-4" />
															{label}
														</label>
													{/each}
												</fieldset>

												<label class="block text-sm text-ink-700" for="comment-{code.id}">
													Комментарий (необязательно)
												</label>
												<textarea
													id="comment-{code.id}"
													name="comment"
													rows="2"
													maxlength="2000"
													class="w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
												></textarea>

												{#if form?.message && form?.id === code.id}
													<p class="text-sm text-cat-1-700">{form.message}</p>
												{/if}

												<button
													type="submit"
													class="rounded-xl bg-ink-950 px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
												>
													Отправить ответ
												</button>
											</form>
										{/if}
									{:else if code.status === 'disputed'}
										<p class="mt-4 text-sm text-ink-600">
											Вы оспорили сведения. Разбирает администратор платформы — мы сообщим о
											решении.
										</p>
									{:else if code.status === 'closed'}
										<p class="mt-4 text-sm text-ink-600">Сделка принята платформой.</p>
									{/if}
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</main>
