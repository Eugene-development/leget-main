<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { untrack } from 'svelte';
	import InsightsShell from '$lib/growth/InsightsShell.svelte';
	import { crmRequest, money, dateTime } from '$lib/crm/api';
	let { data } = $props();
	let busy = $state(false),
		message = $state(''),
		failure = $state('');
	let token = $state('');
	let retryConfirmed = $state<Record<string, boolean>>({});
	const activeSite = $derived(data.siteId);
	$effect(() => {
		const site = activeSite;
		untrack(() => {
			token = '';
			retryConfirmed = {};
			failure = '';
			message = '';
		});
	});
	const sourceNames: Record<string, string> = {
		unknown: 'Источник не указан',
		manual: 'Сделки без заявки',
		call: 'Звонок',
		visit: 'Личное обращение',
		email: 'Email',
		referral: 'Рекомендация',
		other: 'Другой'
	};
	const deliveryNames: Record<string, string> = {
		queued: 'В очереди',
		sending: 'Загружается',
		uploaded: 'Обрабатывается Метрикой',
		delivered: 'Обработана',
		failed: 'Требует исправления',
		uncertain: 'Результат загрузки неизвестен'
	};
	function deliveryError(code: string) {
		if (code === 'metrika_http_401' || code === 'metrika_http_403')
			return 'Проверьте токен и право изменения счётчика.';
		if (code === 'metrika_http_429')
			return 'Метрика ограничила частоту запросов; повтор запланирован.';
		if (code === 'identifier_not_matched') return 'Метрика не сопоставила идентификатор с визитом.';
		if (code === 'upload_outcome_unknown' || code === 'invalid_provider_response')
			return 'Проверьте загрузки счётчика перед повтором.';
		if (code === 'delivery_configuration_error') return 'Проверьте настройки подключения Метрики.';
		return 'Передача временно недоступна. Проверьте счётчик и настройки.';
	}
	async function save(event: SubmitEvent) {
		event.preventDefault();
		busy = true;
		failure = '';
		message = '';
		const form = new FormData(event.currentTarget as HTMLFormElement);
		try {
			await crmRequest(data.base, `growth/sites/${data.siteId}/metrika`, {
				counter_id: form.get('counter_id'),
				oauth_token: token || null,
				signed_goal: form.get('signed_goal') || null,
				paid_goal: form.get('paid_goal') || null,
				enabled: form.get('enabled') === 'on',
				version: data.metrika?.settings?.version
			});
			token = '';
			await invalidateAll();
			message = 'Настройки Метрики сохранены.';
		} catch (error) {
			failure = (error as Error).message;
		} finally {
			busy = false;
		}
	}
	async function retry(id: string) {
		busy = true;
		failure = '';
		message = '';
		try {
			await crmRequest(data.base, `growth/sites/${data.siteId}/metrika/${id}/retry`, {
				confirm_possible_duplicate: !!retryConfirmed[id]
			});
			await invalidateAll();
			message = 'Проверка конверсии запланирована.';
		} catch (error) {
			failure = (error as Error).message;
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Результаты сайта — CRM LEGET</title></svelte:head>
<InsightsShell {data}>
	<h1>Что приносит сайт</h1>
	<p class="muted">
		Заявки за выбранный период и их текущий результат. Сделка учитывается по первой связанной
		заявке; платежи включают возвраты.
	</p>
	<form class="date-filter" method="GET">
		<input type="hidden" name="site" value={data.siteId} />
		<label>Заявки с <input type="date" name="from" value={data.report?.from} required /></label>
		<label>По <input type="date" name="to" value={data.report?.to} required /></label>
		<button class="primary" type="submit" data-goal-ignore="crm-report-filter"
			>Показать результат</button
		>
	</form>
	{#if data.report}
		<div class="table-wrap">
			<table>
				<caption>Путь обращения к заказу</caption><thead
					><tr
						><th>Заявки</th><th>Сделки</th><th>Подписанные договоры</th><th>Оплаченные заказы</th
						><th>Получено за вычетом возвратов</th></tr
					></thead
				><tbody
					><tr
						><td data-label="Заявки"><span class="cell">{data.report.totals.requests}</span></td><td
							data-label="Сделки"><span class="cell">{data.report.totals.deals}</span></td
						><td data-label="Договоры"><span class="cell">{data.report.totals.signed}</span></td><td
							data-label="Оплаченные заказы"
							><span class="cell">{data.report.totals.paid_orders}</span></td
						><td data-label="Чистые поступления"
							><span class="cell">{money(data.report.totals.net_paid)}</span></td
						></tr
					></tbody
				>
			</table>
		</div>
		<h2>Источники и кампании</h2>
		{#if data.report.sources.length}
			<div class="table-wrap">
				<table>
					<thead
						><tr
							><th>Источник</th><th>Кампания / канал</th><th>Заявки</th><th>Сделки</th><th
								>Договоры</th
							><th>Оплачено</th><th>Возвраты</th><th>Чистые поступления</th></tr
						></thead
					><tbody
						>{#each data.report.sources as source}<tr
								><td data-label="Источник"
									><span class="cell">{sourceNames[source.source] || source.source}</span></td
								><td data-label="Кампания / канал"
									><span class="cell">{source.campaign || source.medium || '—'}</span></td
								><td data-label="Заявки"><span class="cell">{source.requests}</span></td><td
									data-label="Сделки"
									><span class="cell"
										>{source.deals}{#if source.conversion !== null}<small>
												· {source.conversion}%</small
											>{/if}</span
									></td
								><td data-label="Договоры"><span class="cell">{source.signed}</span></td><td
									data-label="Оплачено"><span class="cell">{money(source.payments)}</span></td
								><td data-label="Возвраты"><span class="cell">{money(source.refunds)}</span></td><td
									data-label="Чистые поступления"
									><span class="cell">{money(source.net_paid)}</span></td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
		{:else}<p>
				За этот период заявок и сделок нет. Выберите другой период или откройте <a
					href={`${data.base}/incoming?site=${data.siteId}`}>входящие</a
				>.
			</p>{/if}
		<p class="muted">
			Стоимость рекламы и окупаемость появятся после подключения данных о расходах. Заявка сама по
			себе ещё не подтверждает продажу. Обновлено {dateTime(data.report.generated_at)}.
		</p>
	{/if}
	{#if data.metrika}
		<section class="metrika">
			<h2>Подтверждённые конверсии в Метрике</h2>
			<p>
				Создайте в своём счётчике цели JavaScript с условием «совпадает». Передача начнётся для
				новых подтверждённых договоров и оплат после включения. Нужен ClientID или yclid исходной
				заявки.
			</p>
			<form onsubmit={save} class="settings">
				<label
					>Номер счётчика <input
						name="counter_id"
						inputmode="numeric"
						pattern={'[1-9][0-9]{0,19}'}
						value={data.metrika.settings?.counter_id || ''}
						required
					/></label
				>
				<label
					>OAuth-токен <input
						type="password"
						autocomplete="new-password"
						bind:value={token}
						placeholder={data.metrika.settings?.has_token
							? 'Сохранён; оставьте пустым для сохранения'
							: 'Введите токен с доступом к счётчику'}
					/></label
				>
				<label
					>Цель подписанного договора <input
						name="signed_goal"
						value={data.metrika.settings?.signed_goal || ''}
						placeholder="crm_signed"
					/></label
				>
				<label
					>Цель полной оплаты <input
						name="paid_goal"
						value={data.metrika.settings?.paid_goal || ''}
						placeholder="crm_paid"
					/></label
				>
				<label class="check"
					><input type="checkbox" name="enabled" checked={!!data.metrika.settings?.enabled} /> Включить
					передачу подтверждённых конверсий</label
				>
				<button class="primary" disabled={busy} data-goal-ignore="crm-metrika-settings"
					>{busy ? 'Сохранение…' : 'Сохранить настройки'}</button
				>
			</form>
			{#if message}<p role="status">{message}</p>{/if}{#if failure}<p role="alert">
					{failure}
				</p>{/if}
			<h3>Очередь передачи</h3>
			{#if data.metrika.deliveries.length}<div class="table-wrap">
					<table>
						<thead
							><tr
								><th>Сделка</th><th>Событие</th><th>Состояние</th><th>Попытки</th><th>Действие</th
								></tr
							></thead
						><tbody
							>{#each data.metrika.deliveries as delivery (delivery.id)}<tr
									><td data-label="Сделка"
										><span class="cell"
											><a href={`${data.base}/deals/${delivery.deal_id}?site=${data.siteId}`}
												>Открыть сделку</a
											><small>{dateTime(delivery.created_at)}</small></span
										></td
									><td data-label="Событие"
										><span class="cell"
											>{delivery.milestone === 'paid' ? 'Полная оплата' : 'Договор подписан'}<small
												>{delivery.goal}</small
											></span
										></td
									><td data-label="Состояние"
										><span class="cell"
											>{deliveryNames[delivery.status] || delivery.status}{#if delivery.error}<small
													>{deliveryError(delivery.error)}</small
												>{/if}</span
										></td
									><td data-label="Попытки"><span class="cell">{delivery.attempts}</span></td><td
										data-label="Действие"
										><span class="cell"
											>{#if delivery.status === 'uncertain'}<label class="check"
													><input type="checkbox" bind:checked={retryConfirmed[delivery.id]} /> Проверил
													загрузки Метрики; принимаю возможный повтор</label
												>{/if}{#if ['failed', 'uncertain'].includes(delivery.status)}<button
													disabled={busy ||
														(delivery.status === 'uncertain' && !retryConfirmed[delivery.id])}
													onclick={() => retry(delivery.id)}
													data-goal-ignore="crm-metrika-retry"
													>{delivery.upload_id
														? 'Проверить обработку'
														: 'Повторить передачу'}</button
												>{:else}—{/if}</span
										></td
									></tr
								>{/each}</tbody
						>
					</table>
				</div>{:else}<p>
					Конверсий в очереди пока нет. После нового подписания или полной оплаты система добавит
					подтверждённое событие, если у заявки сохранён идентификатор визита.
				</p>{/if}
		</section>
	{/if}
</InsightsShell>

<style>
	.date-filter {
		display: flex;
		align-items: end;
		gap: 16px;
		flex-wrap: wrap;
		margin: 28px 0;
	}
	label {
		display: grid;
		gap: 6px;
	}
	.table-wrap {
		overflow-x: auto;
		margin: 24px 0 32px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}
	caption {
		text-align: left;
		font-weight: 600;
		padding-bottom: 12px;
	}
	th,
	td {
		padding: 14px 12px;
		border-bottom: 1px solid var(--crm-line);
		vertical-align: top;
	}
	th {
		font-weight: 500;
		color: var(--crm-muted);
	}
	td {
		font-variant-numeric: tabular-nums;
	}
	td small {
		display: block;
		margin-top: 5px;
	}
	.metrika {
		margin-top: 48px;
		padding-top: 32px;
		border-top: 1px solid var(--crm-line);
	}
	.settings {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 20px;
		max-width: 900px;
	}
	.check {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.check input {
		min-height: 20px;
		accent-color: var(--crm-accent);
	}
	@media (max-width: 720px) {
		.settings {
			grid-template-columns: 1fr;
		}
		.table-wrap {
			overflow: visible;
		}
		table,
		tbody,
		tr,
		td,
		caption {
			display: block;
		}
		thead {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			overflow: hidden;
			clip-path: inset(50%);
		}
		tbody {
			display: grid;
			gap: 24px;
		}
		tr {
			border-top: 1px solid var(--crm-line);
		}
		td {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			gap: 16px;
			padding: 12px 0;
		}
		td::before {
			content: attr(data-label);
			color: var(--crm-muted);
		}
		td .cell {
			min-width: 0;
			overflow-wrap: anywhere;
		}
		td[data-label='Действие'] {
			grid-template-columns: 1fr;
		}
	}
</style>
