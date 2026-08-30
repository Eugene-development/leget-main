<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		discount,
		duration,
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
	const filters = $derived(data.filters);

	let openAction = $state<{ id: string; kind: string } | null>(null);

	function toggle(id: string, kind: string): void {
		openAction =
			openAction && openAction.id === id && openAction.kind === kind ? null : { id, kind };
	}

	function isOpen(id: string, kind: string): boolean {
		return openAction?.id === id && openAction.kind === kind;
	}

	function tabHref(tab: string): string {
		const params = new URLSearchParams();
		params.set('tab', tab);
		if (filters.from) params.set('from', filters.from);
		if (filters.to) params.set('to', filters.to);
		return `?${params.toString()}`;
	}

	function cardHref(id: string): string {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(filters)) {
			if (value) params.set(key, String(value));
		}
		params.set('open', id);
		return `?${params.toString()}`;
	}

	function canConfirm(code: PromoCard): boolean {
		return ['deal_reported', 'disputed'].includes(code.status);
	}

	function canClose(code: PromoCard): boolean {
		return code.status === 'client_confirmed';
	}
</script>

<svelte:head>
	<title>Промокоды — панель платформы</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="min-h-screen bg-surface-warm px-4 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-6xl">
		{#if !data.authenticated}
			<section class="rounded-3xl border border-border-light bg-surface-raised p-8 shadow-card">
				<h1 class="text-3xl text-ink-950">Требуется вход</h1>
				<p class="mt-3 text-sm text-ink-500">
					Раздел доступен сотрудникам платформы. Войдите в панели и вернитесь сюда.
				</p>
				<a
					href="/admin"
					class="mt-6 inline-flex rounded-xl bg-ink-950 px-5 py-3 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
				>
					Войти в панель
				</a>
			</section>
		{:else}
			<header class="mb-6">
				<p class="text-xs tracking-[0.18em] text-ink-400 uppercase">Панель платформы</p>
				<h1 class="mt-1 text-3xl text-ink-950">Промокоды и сделки</h1>
			</header>

			<nav class="mb-6 flex flex-wrap gap-2">
				{#each [['registry', 'Реестр'], ['sources', 'Рекламные источники'], ['curators', 'Кураторы'], ['partners', 'Партнёры']] as [tab, label] (tab)}
					<a
						href={tabHref(tab)}
						class="rounded-xl border px-4 py-2 text-sm transition {data.tab === tab
							? 'border-ink-950 bg-ink-950 text-on-dark'
							: 'border-border-medium text-ink-700 hover:bg-surface-muted'}"
					>
						{label}
					</a>
				{/each}
				<a
					href="/admin"
					class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-700 transition hover:bg-surface-muted"
				>
					Конверсии
				</a>
			</nav>

			{#if data.apiError}
				<p
					class="mb-6 rounded-2xl border border-border-light bg-surface-muted p-5 text-sm text-ink-600"
				>
					{data.apiError}
				</p>
			{/if}

			{#if data.tab === 'registry'}
				{#if data.summary}
					<div class="mb-6 flex flex-wrap gap-2">
						{#each STATUS_ORDER as status (status)}
							{#if data.summary[status]}
								<span class="rounded-full px-3 py-1 text-xs {statusTone(status)}">
									{statusLabel(status)}: {data.summary[status]}
								</span>
							{/if}
						{/each}
					</div>
				{/if}

				<form method="GET" class="mb-6 flex flex-wrap items-end gap-3">
					<input type="hidden" name="tab" value="registry" />
					<div>
						<label class="block text-xs text-ink-400" for="status">Статус</label>
						<select
							id="status"
							name="status"
							class="mt-1 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-800"
						>
							<option value="">Все</option>
							{#each STATUS_ORDER as status (status)}
								<option value={status} selected={filters.status === status}>
									{statusLabel(status)}
								</option>
							{/each}
						</select>
					</div>
					<div>
						<label class="block text-xs text-ink-400" for="utm">Рекламный источник</label>
						<input
							id="utm"
							name="utm_source"
							value={filters.utm_source ?? ''}
							placeholder="yandex-direct"
							class="mt-1 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
						/>
					</div>
					<div>
						<label class="block text-xs text-ink-400" for="curator">ID куратора</label>
						<input
							id="curator"
							name="curator_id"
							value={filters.curator_id ?? ''}
							class="mt-1 w-28 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
						/>
					</div>
					<div>
						<label class="block text-xs text-ink-400" for="partner">ID партнёра</label>
						<input
							id="partner"
							name="partner_id"
							value={filters.partner_id ?? ''}
							class="mt-1 w-28 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
						/>
					</div>
					<div>
						<label class="block text-xs text-ink-400" for="from">С</label>
						<input
							id="from"
							name="from"
							type="date"
							value={filters.from ?? ''}
							class="mt-1 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
						/>
					</div>
					<div>
						<label class="block text-xs text-ink-400" for="to">По</label>
						<input
							id="to"
							name="to"
							type="date"
							value={filters.to ?? ''}
							class="mt-1 rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
						/>
					</div>
					<button
						type="submit"
						class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-700 transition hover:bg-surface-muted"
					>
						Применить
					</button>
				</form>

				{#if codes.length === 0}
					<section
						class="rounded-3xl border border-dashed border-border-medium bg-surface-muted p-7"
					>
						<h2 class="text-xl text-ink-950">Ничего не найдено</h2>
						<p class="mt-2 text-sm text-ink-600">
							Измените фильтры или дождитесь первых промокодов.
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
											Клиент: {code.client?.name ?? '—'} · Куратор: {code.curator?.name ?? '—'} · Партнёр:
											{code.partner?.company || code.partner?.name || '—'}
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
									</div>
								</div>

								{#if code.deal}
									<dl
										class="grid gap-x-4 gap-y-3 border-t border-border-light bg-surface-muted px-7 py-4 sm:grid-cols-5"
									>
										<div>
											<dt class="text-xs text-ink-400">Заказ</dt>
											<dd class="text-sm text-ink-900">{code.deal.order_number}</dd>
										</div>
										<div>
											<dt class="text-xs text-ink-400">Сумма</dt>
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

								{#if form?.message && form?.id === code.id}
									<p class="border-t border-border-light px-7 py-3 text-sm text-cat-1-700">
										{form.message}
									</p>
								{/if}

								<div class="flex flex-wrap gap-3 border-t border-border-light px-7 py-4">
									<a
										href={cardHref(code.id)}
										class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
									>
										Карточка и журнал
									</a>

									{#if canConfirm(code)}
										<button
											type="button"
											onclick={() => toggle(code.id, 'confirm')}
											class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
										>
											Подтвердить с основанием
										</button>
									{/if}

									{#if canClose(code)}
										<form method="POST" action="?/close" use:enhance>
											<input type="hidden" name="id" value={code.id} />
											<button
												type="submit"
												class="rounded-xl bg-ink-950 px-4 py-2 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
											>
												Закрыть сделку
											</button>
										</form>
									{/if}

									{#if code.status === 'closed'}
										<button
											type="button"
											onclick={() => toggle(code.id, 'refund')}
											class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
										>
											Оформить возврат
										</button>
									{/if}

									{#if !['closed', 'cancelled', 'refunded', 'expired'].includes(code.status)}
										<button
											type="button"
											onclick={() => toggle(code.id, 'cancel')}
											class="rounded-xl border border-border-medium px-4 py-2 text-sm text-ink-800 transition hover:bg-surface-muted"
										>
											Отменить
										</button>
									{/if}
								</div>

								{#each [['confirm', 'Основание подтверждения без ответа клиента'], ['cancel', 'Основание отмены'], ['refund', 'Основание возврата']] as [kind, label] (kind)}
									{#if isOpen(code.id, kind)}
										<form
											method="POST"
											action="?/{kind}"
											use:enhance
											class="flex flex-wrap items-end gap-3 border-t border-border-light bg-surface-muted px-7 py-5"
										>
											<input type="hidden" name="id" value={code.id} />
											<div class="grow">
												<label class="block text-xs text-ink-400" for="{kind}-{code.id}">
													{label}
												</label>
												<input
													id="{kind}-{code.id}"
													name="reason"
													required
													minlength="3"
													maxlength="2000"
													class="mt-1 w-full rounded-xl border border-border-medium bg-surface-raised px-4 py-2 text-sm text-ink-900"
												/>
											</div>
											<button
												type="submit"
												class="rounded-xl bg-ink-950 px-5 py-2 text-sm font-semibold text-on-dark transition hover:bg-ink-800"
											>
												Подтвердить действие
											</button>
										</form>
									{/if}
								{/each}

								{#if data.selected?.id === code.id}
									<div class="border-t border-border-light px-7 py-5">
										{#if data.selected.attribution}
											<h3 class="p1-title-sub text-ink-950">Рекламная атрибуция</h3>
											<dl class="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-4">
												{#each [['Источник', data.selected.attribution.first.utm_source], ['Кампания', data.selected.attribution.first.utm_campaign], ['ID кампании', data.selected.attribution.first.campaign_id], ['ID группы', data.selected.attribution.first.ad_group_id], ['ID объявления', data.selected.attribution.first.ad_id], ['ID фразы', data.selected.attribution.first.keyword_id], ['yclid', data.selected.attribution.first.yclid], ['Первое касание', data.selected.attribution.first.touched_at]] as [label, value] (label)}
													<div>
														<dt class="text-xs text-ink-400">{label}</dt>
														<dd class="text-sm break-all text-ink-900">{value ?? '—'}</dd>
													</div>
												{/each}
											</dl>

											{#if data.selected.timings}
												<dl class="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-4">
													<div>
														<dt class="text-xs text-ink-400">Реклама → регистрация</dt>
														<dd class="text-sm text-ink-900">
															{duration(data.selected.timings.ad_to_registration)}
														</dd>
													</div>
													<div>
														<dt class="text-xs text-ink-400">Регистрация → активация</dt>
														<dd class="text-sm text-ink-900">
															{duration(data.selected.timings.registration_to_activation)}
														</dd>
													</div>
													<div>
														<dt class="text-xs text-ink-400">Активация → сделка</dt>
														<dd class="text-sm text-ink-900">
															{duration(data.selected.timings.activation_to_deal)}
														</dd>
													</div>
													<div>
														<dt class="text-xs text-ink-400">Сделка → закрытие</dt>
														<dd class="text-sm text-ink-900">
															{duration(data.selected.timings.deal_to_close)}
														</dd>
													</div>
												</dl>
											{/if}
										{:else}
											<p class="text-sm text-ink-500">Рекламной атрибуции у клиента нет.</p>
										{/if}

										<h3 class="p1-title-sub mt-6 text-ink-950">Журнал аудита</h3>
										<div class="mt-3 overflow-x-auto">
											<table class="w-full min-w-160 text-left text-sm">
												<thead class="text-xs text-ink-400">
													<tr>
														<th class="py-2 pr-4">Когда</th>
														<th class="py-2 pr-4">Действие</th>
														<th class="py-2 pr-4">Кто</th>
														<th class="py-2 pr-4">Переход</th>
														<th class="py-2 pr-4">Основание</th>
														<th class="py-2">IP</th>
													</tr>
												</thead>
												<tbody class="divide-y divide-border-light">
													{#each data.history as event (event.id)}
														<tr>
															<td class="py-2 pr-4 text-ink-500">{formatDate(event.created_at)}</td>
															<td class="py-2 pr-4 text-ink-900">{event.action_label}</td>
															<td class="py-2 pr-4 text-ink-700">
																{event.actor_role ?? '—'}{event.actor_id
																	? ` #${event.actor_id}`
																	: ''}
															</td>
															<td class="py-2 pr-4 text-ink-700">
																{event.from_status ? statusLabel(event.from_status) : '—'} →
																{event.to_status ? statusLabel(event.to_status) : '—'}
															</td>
															<td class="py-2 pr-4 text-ink-700">{event.reason ?? '—'}</td>
															<td class="py-2 text-ink-500">{event.ip_address ?? '—'}</td>
														</tr>
													{/each}
												</tbody>
											</table>
										</div>
									</div>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			{:else if data.tab === 'sources'}
				<div
					class="overflow-x-auto rounded-3xl border border-border-light bg-surface-raised shadow-card"
				>
					<table class="w-full min-w-240 text-left text-sm">
						<thead class="border-b border-border-light text-xs text-ink-400">
							<tr>
								<th class="px-4 py-3">Код</th>
								<th class="px-4 py-3">Источник</th>
								<th class="px-4 py-3">Кампания</th>
								<th class="px-4 py-3">Объявление</th>
								<th class="px-4 py-3">Фраза</th>
								<th class="px-4 py-3">yclid</th>
								<th class="px-4 py-3">Клиент</th>
								<th class="px-4 py-3">Куратор</th>
								<th class="px-4 py-3">Партнёр</th>
								<th class="px-4 py-3">Сумма</th>
								<th class="px-4 py-3">Скидка</th>
								<th class="px-4 py-3">Итог</th>
								<th class="px-4 py-3">Реклама → сделка</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border-light">
							{#each data.sources?.data ?? [] as row (row.promo_code)}
								<tr>
									<td class="px-4 py-3 font-mono text-ink-950">{row.promo_code}</td>
									<td class="px-4 py-3 text-ink-700">{row.source ?? '—'}</td>
									<td class="px-4 py-3 text-ink-700">{row.campaign ?? '—'}</td>
									<td class="px-4 py-3 text-ink-700">{row.ad_id ?? '—'}</td>
									<td class="px-4 py-3 text-ink-700">{row.keyword_id ?? '—'}</td>
									<td class="px-4 py-3 break-all text-ink-500">{row.yclid ?? '—'}</td>
									<td class="px-4 py-3 text-ink-700">{row.client ?? '—'}</td>
									<td class="px-4 py-3 text-ink-700">{row.curator ?? '—'}</td>
									<td class="px-4 py-3 text-ink-700">{row.partner ?? '—'}</td>
									<td class="px-4 py-3 text-ink-900">{money(row.gross_amount)}</td>
									<td class="px-4 py-3 text-ink-900">{money(row.discount_amount)}</td>
									<td class="px-4 py-3 text-ink-950">{money(row.net_amount)}</td>
									<td class="px-4 py-3 text-ink-500">
										{duration(row.timings?.ad_to_registration)} / {duration(
											row.timings?.activation_to_deal
										)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else if data.tab === 'curators'}
				<div
					class="overflow-x-auto rounded-3xl border border-border-light bg-surface-raised shadow-card"
				>
					<table class="w-full min-w-160 text-left text-sm">
						<thead class="border-b border-border-light text-xs text-ink-400">
							<tr>
								<th class="px-4 py-3">Куратор</th>
								<th class="px-4 py-3">Закрытых сделок</th>
								<th class="px-4 py-3">Сумма сделок</th>
								<th class="px-4 py-3">Скидки</th>
								<th class="px-4 py-3">Итог</th>
								<th class="px-4 py-3">Вознаграждение</th>
								<th class="px-4 py-3">Сторно</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border-light">
							{#each data.curators ?? [] as row (row.curator.id)}
								<tr>
									<td class="px-4 py-3 text-ink-950">
										{row.curator.name}
										<span class="block text-xs text-ink-400">{row.curator.email}</span>
									</td>
									<td class="px-4 py-3 text-ink-900">{row.closed_deals}</td>
									<td class="px-4 py-3 text-ink-900">{money(row.deals_total)}</td>
									<td class="px-4 py-3 text-ink-900">{money(row.discount_total)}</td>
									<td class="px-4 py-3 text-ink-900">{money(row.net_total)}</td>
									<td class="px-4 py-3 text-ink-900">
										{#if row.commission_configured}
											{money(row.commission_total)}
										{:else}
											<span class="text-ink-400">формула не настроена</span>
										{/if}
									</td>
									<td class="px-4 py-3 text-ink-700">{row.reversals}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else if data.tab === 'partners'}
				<div
					class="overflow-x-auto rounded-3xl border border-border-light bg-surface-raised shadow-card"
				>
					<table class="w-full min-w-160 text-left text-sm">
						<thead class="border-b border-border-light text-xs text-ink-400">
							<tr>
								<th class="px-4 py-3">Партнёр</th>
								<th class="px-4 py-3">Закрытых сделок</th>
								<th class="px-4 py-3">Оборот</th>
								<th class="px-4 py-3">Скидки</th>
								<th class="px-4 py-3">Итог</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border-light">
							{#each data.partners ?? [] as row (row.partner_id)}
								<tr>
									<td class="px-4 py-3 text-ink-950">{row.partner_name ?? '—'}</td>
									<td class="px-4 py-3 text-ink-900">{row.deals}</td>
									<td class="px-4 py-3 text-ink-900">{money(row.gross_total)}</td>
									<td class="px-4 py-3 text-ink-900">{money(row.discount_total)}</td>
									<td class="px-4 py-3 text-ink-950">{money(row.net_total)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		{/if}
	</div>
</main>
