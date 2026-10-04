<script lang="ts">
	import '$lib/growth/growth.css';
	import { createFormSender } from '$lib/utils/form-submission';
	import { money, date } from '$lib/crm/api';
	let { data } = $props();
	const portal = $derived(data.portal);
	const sender = createFormSender('order-question');
	let question = $state(''),
		busy = $state(false),
		notice = $state(''),
		failure = $state('');
	const status: Record<string, string> = {
		planned: 'Запланировано',
		in_progress: 'В работе',
		completed: 'Готово'
	};
	async function ask(event: SubmitEvent) {
		event.preventDefault();
		if (busy || !portal) return;
		busy = true;
		failure = '';
		notice = '';
		try {
			const body = new FormData(event.currentTarget as HTMLFormElement);
			body.set('service_type', 'order-question');
			body.set('order_id', portal.order.id);
			body.set('order_title', portal.order.title);
			const result = await sender(body, 'service-request', event);
			notice = `Вопрос принят. ${result.mail_status === 'sent' ? 'Уведомление отправлено менеджеру.' : 'Уведомление ожидает доставки.'}`;
			question = '';
		} catch (e) {
			failure = e instanceof Error ? e.message : 'Не удалось отправить вопрос. Повторите попытку.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head
	><title>Ваш заказ — LEGET</title><meta name="robots" content="noindex,nofollow" /><meta
		name="referrer"
		content="no-referrer"
	/></svelte:head
>
<main class="order-page ym-hide-content">
	<div class="order-content">
		{#if !portal}
			<h1>Кабинет заказчика</h1>
			<p>
				Откройте приглашение от менеджера, чтобы посмотреть этапы работ и документы своего заказа.
				Если доступ завершён, попросите новую ссылку.
			</p>
			<a href="/">Вернуться на сайт</a>
		{:else}
			<header>
				<h1>{portal.order.title}</h1>
				<p>
					{portal.order.stage}{#if portal.order.contract_number}
						· Договор {portal.order.contract_number}{/if}
				</p>
				<div class="growth-actions">
					<strong>{money(portal.order.amount)}</strong>{#if portal.order.due_at}<span
							>Срок исполнения: {date(portal.order.due_at)}</span
						>{/if}
				</div>
			</header>
			<h2>Этапы работ</h2>
			<ol class="order-timeline">
				{#each portal.milestones as m (m.name)}<li>
						<strong>{m.name}</strong> — {status[m.status] || m.status}{#if m.due_at}<p
								class="growth-note"
							>
								Плановая дата: {date(m.due_at)}
							</p>{/if}{#if m.note}<p>{m.note}</p>{/if}
					</li>{/each}
			</ol>
			{#if portal.order.specification.length}<h2>Согласованная комплектация</h2>
				<table class="order-spec">
					<thead><tr><th scope="col">Наименование</th><th scope="col">Количество</th></tr></thead
					><tbody
						>{#each portal.order.specification as line, i (i)}<tr
								><td>{line.name}</td><td>{line.quantity}</td></tr
							>{/each}</tbody
					>
				</table>{/if}
			<h2>Документы</h2>
			{#if portal.documents.length}<ul>
					{#each portal.documents as document (document.id)}<li>
							<a href={`/orders/documents/${document.id}`} download>{document.name}</a>
						</li>{/each}
				</ul>{:else}<p class="growth-note">
					Менеджер ещё не открыл документы для этого заказа.
				</p>{/if}
			<h2>Задать вопрос по заказу</h2>
			<form class="order-form ym-hide-content" onsubmit={ask}>
				<label
					>Имя<input
						name="name"
						required
						maxlength="255"
						value={portal.client?.name || ''}
						autocomplete="name"
					/></label
				>
				<label
					>Email<input
						class="ym-disable-keys"
						name="email"
						type="email"
						required
						maxlength="255"
						value={portal.client?.email || ''}
						autocomplete="email"
					/></label
				>
				<label
					>Вопрос<textarea
						class="ym-disable-keys"
						name="message"
						bind:value={question}
						required
						maxlength="5000"
					></textarea></label
				>
				{#if failure}<p role="alert" class="growth-error">{failure}</p>{/if}{#if notice}<p
						role="status"
					>
						{notice}
					</p>{/if}
				<button
					class="primary"
					disabled={busy}
					aria-busy={busy}
					data-metrika-goal="order_question_submit"
					data-goal-action="submit_click"
					data-goal-label="Отправить вопрос по заказу"
					>{busy ? 'Отправка…' : 'Отправить вопрос'}</button
				>
			</form>
			<form
				method="POST"
				action="?/logout"
				data-form-business="session-logout"
				class="growth-actions"
			>
				<button data-goal-ignore="Выход из кабинета заказчика">Выйти из кабинета</button>
			</form>
		{/if}
	</div>
</main>
