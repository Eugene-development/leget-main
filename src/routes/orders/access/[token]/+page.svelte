<script lang="ts">
	import '$lib/growth/growth.css';
	let { data, form } = $props();
</script>

<svelte:head
	><title>Приглашение в кабинет заказчика</title><meta
		name="robots"
		content="noindex,nofollow"
	/><meta name="referrer" content="no-referrer" /></svelte:head
>
<main class="order-page">
	<div class="order-content">
		<h1>Кабинет заказчика</h1>
		{#if data.available}<p>
				Примите приглашение, чтобы посмотреть этапы работ и документы заказа. Доступ сохранится на
				этом устройстве на 30 дней; менеджер может завершить его раньше.
			</p>
			<form method="POST">
				<input type="hidden" name="exchange_key" value={data.exchangeKey} /><button
					class="primary"
					data-goal-ignore="Принятие приватного приглашения в кабинет">Открыть мой заказ</button
				>
			</form>
		{:else}<p>
				Приглашение недействительно, истекло или уже использовано. Запросите новую ссылку у
				менеджера.
			</p>
			{#if data.existingSession}<a href="/orders">Открыть ранее принятый заказ</a>{/if}{/if}
		{#if form?.message}<p role="alert" class="growth-error">{form.message}</p>{/if}
	</div>
</main>
