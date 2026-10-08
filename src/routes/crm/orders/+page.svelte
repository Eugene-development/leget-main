<script lang="ts">
	import { untrack } from 'svelte';
	import GrowthFrame from '$lib/growth/GrowthFrame.svelte';
	import ContentLoading from '$lib/components/ContentLoading.svelte';
	import { crmRequest, date, type Row } from '$lib/crm/api';
	let { data } = $props();
	let selectedDeal = $state(''),
		detail = $state<Row | null>(null),
		error = $state(''),
		notice = $state(''),
		busy = $state(false),
		loading = $state(false),
		inviteUrl = $state('');
	let milestones = $state<Row[]>([]),
		documentIds = $state<string[]>([]);
	let controller: AbortController | undefined,
		generation = 0;
	const pager = $derived(
		data.pagination || { current_page: 1, last_page: 1, total: data.deals.length }
	);
	function pageHref(number: number) {
		const q = new URLSearchParams({
			site: data.site,
			order_search: data.search || '',
			order_page: String(number)
		});
		return `${data.base}/orders?${q}`;
	}
	$effect(() => {
		const site = data.site;
		const first = data.deals[0]?.id || '';
		untrack(() => {
			selectedDeal = first;
			void load(first, site);
		});
		return () => controller?.abort();
	});
	async function load(deal: string, site = data.site) {
		const turn = ++generation;
		controller?.abort();
		controller = new AbortController();
		detail = null;
		milestones = [];
		documentIds = [];
		error = '';
		notice = '';
		inviteUrl = '';
		if (!deal) return;
		loading = true;
		try {
			const next = await crmRequest(data.base, `portal/sites/${site}/deals/${deal}`, undefined, {
				signal: controller.signal
			});
			if (turn !== generation) return;
			detail = next;
			milestones = next.milestones;
			documentIds = next.plan.document_ids;
		} catch (e) {
			if (turn === generation && !(e instanceof DOMException && e.name === 'AbortError'))
				error = e instanceof Error ? e.message : 'Не удалось загрузить заказ.';
		} finally {
			if (turn === generation) loading = false;
		}
	}
	async function act(action: 'plan' | 'invite' | 'revoke') {
		if (busy || !detail) return;
		busy = true;
		error = '';
		notice = '';
		const turn = generation,
			site = data.site,
			deal = selectedDeal;
		try {
			const body =
				action === 'plan'
					? {
							version: detail.plan.version,
							milestones: milestones.map((m) => ({
								id: m.id,
								status: m.status,
								due_at: m.due_at || null,
								note: m.note || null
							})),
							document_ids: documentIds
						}
					: {};
			const result = await crmRequest(
				data.base,
				`portal/sites/${site}/deals/${deal}/${action}`,
				body
			);
			if (turn !== generation) return;
			if (action === 'plan') {
				detail.plan.version = result.version;
				notice = 'Этапы и доступ к документам сохранены.';
			}
			if (action === 'invite') {
				inviteUrl = new URL(result.path, `https://${data.domain}`).href;
				notice = 'Приглашение готово. Предыдущий доступ завершён. Передайте ссылку заказчику.';
			}
			if (action === 'revoke') {
				inviteUrl = '';
				detail.access = null;
				notice = 'Доступ заказчика завершён.';
			}
		} catch (e) {
			if (turn === generation)
				error = e instanceof Error ? e.message : 'Не удалось выполнить действие.';
		} finally {
			busy = false;
		}
	}
	function toggleDocument(id: string, checked: boolean) {
		documentIds = checked ? [...documentIds, id] : documentIds.filter((v) => v !== id);
	}
</script>

<svelte:head><title>Кабинет заказчика — CRM</title></svelte:head>
<GrowthFrame title="Кабинет заказчика" sites={data.sites} site={data.site} base={data.base}>
	<p>
		Укажите этапы работ и откройте нужные документы. Заказчик получит доступ к одному заказу по
		личному приглашению.
	</p>
	<form method="GET" class="growth-actions">
		<input type="hidden" name="site" value={data.site} />
		<label
			>Найти заказ<input
				type="search"
				name="order_search"
				value={data.search || ''}
				placeholder="Название сделки"
				maxlength="255"
				disabled={busy}
			/></label
		>
		<button disabled={busy} data-goal-ignore="Поиск сделки для настройки кабинета заказчика"
			>Найти</button
		>
	</form>
	{#if pager.last_page > 1}<nav aria-label="Страницы списка заказов" class="growth-actions">
			{#if pager.current_page > 1}<a href={pageHref(pager.current_page - 1)}>Предыдущие заказы</a
				>{/if}
			<span>Страница {pager.current_page} из {pager.last_page} · Заказов: {pager.total}</span>
			{#if pager.current_page < pager.last_page}<a href={pageHref(pager.current_page + 1)}
					>Следующие заказы</a
				>{/if}
		</nav>{/if}
	{#if !data.deals.length}<p>
			{data.search
				? 'По этому запросу заказы не найдены. Измените название в поиске.'
				: 'Сначала создайте сделку в CRM.'}
		</p>
		<a href={`${data.base}/deals?site=${data.site}`}>Перейти к сделкам</a>
	{:else}<label
			>Заказ<select
				bind:value={selectedDeal}
				onchange={() => load(selectedDeal)}
				disabled={busy}
				data-goal-ignore="Выбор заказа для настройки кабинета"
				>{#each data.deals as deal (deal.id)}<option value={deal.id}
						>{deal.title}{deal.client_name ? ` — ${deal.client_name}` : ''}</option
					>{/each}</select
			></label
		>
		{#if loading}<ContentLoading label="Загрузка заказа…" />{/if}
		{#if detail}<h2>Этапы, видимые заказчику</h2>
			<div class="growth-table-wrap">
				<table>
					<thead
						><tr
							><th scope="col">Этап</th><th scope="col">Состояние</th><th scope="col"
								>Плановая дата</th
							><th scope="col">Комментарий заказчику</th></tr
						></thead
					><tbody
						>{#each milestones as milestone (milestone.id)}<tr
								><th scope="row">{milestone.name}</th><td
									><select
										bind:value={milestone.status}
										aria-label={`Состояние: ${milestone.name}`}
										disabled={busy}
										><option value="planned">Запланировано</option><option value="in_progress"
											>В работе</option
										><option value="completed">Готово</option></select
									></td
								><td
									><input
										type="date"
										bind:value={milestone.due_at}
										aria-label={`Плановая дата: ${milestone.name}`}
										disabled={busy}
									/></td
								><td
									><textarea
										bind:value={milestone.note}
										aria-label={`Комментарий: ${milestone.name}`}
										maxlength="2000"
										disabled={busy}
									></textarea></td
								></tr
							>{/each}</tbody
					>
				</table>
			</div>
			<h2>Доступные документы</h2>
			{#if detail.documents.length}{#each detail.documents as document (document.id)}<label
						class="growth-check"
						><input
							type="checkbox"
							checked={documentIds.includes(document.id)}
							onchange={(e) => toggleDocument(document.id, e.currentTarget.checked)}
							disabled={busy}
						/><span>{document.name}</span></label
					>{/each}{:else}<p class="growth-note">
					Добавьте документы в карточке сделки. Заказчик увидит только выбранные здесь файлы.
				</p>{/if}
			<div class="growth-actions">
				<button
					class="primary"
					disabled={busy}
					onclick={() => act('plan')}
					data-goal-ignore="Сохранение этапов и доступа к документам заказа"
					>{busy ? 'Сохранение…' : 'Сохранить для заказчика'}</button
				>
			</div>
			<h2>Приглашение</h2>
			<p>
				Ссылка действует 7 дней и принимается один раз. После принятия доступ на устройстве
				действует 30 дней. Новое приглашение завершает прежний доступ.
			</p>
			{#if detail.access}<p class="growth-note">
					{detail.access.used_at
						? 'Приглашение принято.'
						: `Приглашение действует до ${date(detail.access.expires_at)}.`}
				</p>{/if}
			<div class="growth-actions">
				<button
					disabled={busy}
					onclick={() => act('invite')}
					data-goal-ignore="Создание личного приглашения заказчика">Создать приглашение</button
				><button
					disabled={busy}
					onclick={() => act('revoke')}
					data-goal-ignore="Отзыв доступа к кабинету заказчика">Завершить доступ</button
				>
			</div>
			{#if inviteUrl}<label
					>Ссылка для заказчика<input
						value={inviteUrl}
						readonly
						aria-label="Личная ссылка приглашения"
					/></label
				>
				<p class="growth-note">Скопируйте ссылку и передайте её заказчику.</p>{/if}
		{/if}
	{/if}
	{#if error}<p class="growth-error" role="alert">
			{error}
			<button onclick={() => load(selectedDeal)} data-goal-ignore="Повтор загрузки заказа"
				>Обновить заказ</button
			>
		</p>{/if}{#if notice}<p role="status">{notice}</p>{/if}
</GrowthFrame>
