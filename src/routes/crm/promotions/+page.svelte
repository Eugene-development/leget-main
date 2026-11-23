<script lang="ts">
	import { notifyError } from '$lib/utils/notify-error';
	import { invalidateAll } from '$app/navigation';
	import { tick } from 'svelte';
	import { crmRequest, dateTime, dateTimeInput } from '$lib/crm/api';
	import { promotionStatus, type Promotion, type PromotionRevision } from '$lib/promotions/cabinet';
	import { parsePromotionTime } from '$lib/promotions/time';
	import { usePromotionClock } from '$lib/promotions/clock.svelte';

	let { data }: { data: { base: string; site: string; items: Promotion[]; canCreate: boolean } } =
		$props();
	const now = usePromotionClock(() =>
		data.items.map((item) => (item.endsAt ? Date.parse(item.endsAt) : null))
	);
	const items = $derived(
		data.items.map(
			(item): Promotion =>
				item.status !== 'removed' && item.endsAt && Date.parse(item.endsAt) <= now()
					? { ...item, status: 'expired' }
					: item
		)
	);

	let filter = $state<'all' | Promotion['status']>('all');
	let edit = $state<{ item?: Promotion; site: string }>();
	let title = $state('');
	let deadline = $state('');
	let enabled = $state(true);
	let saving = $state(false);
	let failure = $state('');
	let notice = $state('');
	let editor = $state<HTMLFormElement>();
	let history = $state<{ id: string; site: string; items?: PromotionRevision[]; error?: string }>();
	let historyRequest: AbortController | undefined;
	const currentEdit = $derived(edit?.site === data.site ? edit : undefined);
	const visible = $derived(items.filter((item) => filter === 'all' || item.status === filter));

	async function start(item?: Promotion) {
		edit = { item, site: data.site };
		title = item?.title ?? '';
		deadline = item?.endsAt ? dateTimeInput(item.endsAt) : '';
		enabled =
			!item?.parentHidden &&
			(item?.status === 'removed' || item?.status === 'expired' || (item?.enabled ?? true));
		failure = '';
		notice = '';
		await tick();
		editor?.querySelector('input')?.focus();
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		if (saving || !currentEdit) return;
		const { item, site } = currentEdit;
		const changed = !item || deadline !== (item.endsAt ? dateTimeInput(item.endsAt) : '');
		const value = deadline ? parsePromotionTime(deadline) : null;
		if (deadline && value === null) {
			failure = 'Укажите действительную дату и время.';
			return;
		}
		saving = true;
		failure = '';
		const body = item ? { version: item.version, enabled } : { title: title.trim(), enabled };
		try {
			await crmRequest(data.base, `sites/${site}/promotions${item ? `/${item.id}` : ''}`, {
				...body,
				...(changed ? { ends_at: value === null ? null : new Date(value).toISOString() } : {})
			});
			if (site === data.site) {
				edit = undefined;
				history = undefined;
				notice = item?.status === 'removed' ? 'Акция восстановлена.' : 'Акция сохранена.';
				await invalidateAll();
			}
		} catch (error) {
			if (site === data.site)
				failure = notifyError(error, 'Не удалось сохранить акцию.');
		} finally {
			saving = false;
		}
	}

	async function openHistory(item: Promotion) {
		historyRequest?.abort();
		if (history?.site === data.site && history.id === item.id) {
			history = undefined;
			return;
		}
		const site = data.site;
		const controller = new AbortController();
		historyRequest = controller;
		history = { id: item.id, site };
		try {
			const result = await crmRequest(
				data.base,
				`sites/${site}/promotions/${item.id}/history`,
				undefined,
				{
					signal: controller.signal
				}
			);
			if (!controller.signal.aborted) history = { id: item.id, site, items: result.items };
		} catch (error) {
			if (!controller.signal.aborted)
				history = {
					id: item.id,
					site,
					error: notifyError(error, 'Не удалось загрузить историю.')
				};
		}
	}
</script>

<svelte:head><title>Акции · LEGET CRM</title></svelte:head>

<main class="crm-main promotions" aria-labelledby="promotions-heading">
	<header class="promotions-header">
		<div>
			<h1 id="promotions-heading">Акции</h1>
			<p>Сроки показа и история акций выбранного сайта.</p>
		</div>
		{#if data.canCreate}
			<button
				type="button"
				class="promotion-primary"
				onclick={() => start()}
				data-goal-ignore="Создание акции сайта">Добавить акцию</button
			>
		{/if}
	</header>

	{#if notice}<p class="crm-notice" role="status">{notice}</p>{/if}

	{#if currentEdit}
		<form
			class="promotion-editor"
			bind:this={editor}
			onsubmit={save}
			data-goal-ignore="Сохранение акции сайта"
		>
			<h2>{currentEdit.item?.title || 'Новая акция'}</h2>
			{#if !currentEdit.item}
				<label>Название <input required maxlength="160" bind:value={title} /></label>
			{/if}
			<label>
				Окончание по Москве
				<input
					type="datetime-local"
					bind:value={deadline}
					required={currentEdit.item?.requiresDeadline}
				/>
				{#if !currentEdit.item?.requiresDeadline}<small
						>Пустое поле означает бессрочную акцию.</small
					>{/if}
			</label>
			<label class="promotion-visibility"
				><input type="checkbox" bind:checked={enabled} disabled={currentEdit.item?.parentHidden} /> Показывать
				на сайте</label
			>
			{#if currentEdit.item?.parentHidden}<small>Блок или компания скрыты в редакторе сайта.</small
				>{/if}
			{#if failure}<p class="crm-error" role="alert">{failure}</p>{/if}
			<div class="promotion-actions">
				<button
					type="submit"
					class="promotion-primary"
					disabled={saving}
					data-goal-ignore="Сохранение акции сайта"
				>
					{saving
						? 'Сохраняем…'
						: currentEdit.item?.status === 'removed'
							? 'Восстановить'
							: 'Сохранить'}
				</button>
				<button
					type="button"
					disabled={saving}
					onclick={() => (edit = undefined)}
					data-goal-ignore="Закрытие настроек акции">Отмена</button
				>
			</div>
		</form>
	{/if}

	{#if items.length}
		<div class="crm-toolbar">
			<label>
				<span class="sr-only">Статус акции</span>
				<select bind:value={filter} aria-label="Статус акции">
					<option value="all">Все статусы</option>
					{#each Object.entries(promotionStatus) as [key, label] (key)}
						<option value={key}>{label}</option>
					{/each}
				</select>
			</label>
		</div>
	{/if}

	{#if !visible.length}
		<div class="crm-empty">
			{#if !data.site}
				<p>Выберите сайт, чтобы посмотреть акции.</p>
			{:else if !data.canCreate && !items.length}
				<p>В шаблоне этого сайта нет блока акций.</p>
			{:else if !items.length}
				<p>Акций пока нет. Создайте первую, чтобы показать её на сайте.</p>
			{:else}
				<p>Акций с этим статусом нет.</p>
			{/if}
		</div>
	{:else}
		<ul class="promotion-list">
			{#each visible as item (item.id)}
				<li>
					<div class="promotion-row">
						<div class="promotion-name">
							<h2>{item.title || 'Без названия'}</h2>
							<p>{item.placement} · {item.slug}</p>
						</div>
						<div class="promotion-status">
							<strong>{promotionStatus[item.status]}</strong>
							<span>{item.endsAt ? `${dateTime(item.endsAt)} мск` : 'Бессрочно'}</span>
						</div>
						<div class="promotion-actions">
							<button
								type="button"
								onclick={() => start(item)}
								disabled={saving}
								data-goal-ignore="Редактирование акции сайта"
							>
								{item.status === 'removed'
									? 'Восстановить'
									: item.status === 'expired'
										? 'Продлить'
										: 'Настроить'}
							</button>
							<button
								type="button"
								aria-expanded={history?.id === item.id && history.site === data.site}
								onclick={() => openHistory(item)}
								data-goal-ignore="История акции сайта">История</button
							>
						</div>
					</div>
					{#if history?.id === item.id && history.site === data.site}
						<div class="promotion-history" aria-live="polite">
							{#if history.error}<p role="alert">{history.error}</p>
							{:else if !history.items}<p>Загружаем историю…</p>
							{:else if !history.items.length}<p>Изменений пока нет.</p>
							{:else}
								<ol>
									{#each history.items as revision (revision.id)}
										<li>
											<time datetime={revision.date}>{dateTime(revision.date)} мск</time>
											{#if revision.author}<span>{revision.author}</span>{/if}
											<span
												>{!revision.present
													? 'Удалена'
													: revision.enabled
														? 'Включена'
														: 'Скрыта'}</span
											>
											{#if revision.present}<span
													>{revision.endsAt
														? `До ${dateTime(revision.endsAt)} мск`
														: 'Бессрочно'}</span
												>{/if}
										</li>
									{/each}
								</ol>
							{/if}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>

<style>
	.promotions-header,
	.promotion-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.promotions-header {
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	h1,
	h2,
	p {
		margin: 0;
	}
	h1 {
		font-size: var(--text-3xl);
		font-weight: 680;
		line-height: 1.2;
	}
	h2 {
		font-size: var(--text-base);
		font-weight: 650;
	}
	.promotions-header p,
	.promotion-name p {
		color: var(--crm-muted);
		margin-top: 0.3rem;
	}
	.promotions button.promotion-primary {
		background: var(--crm-accent);
		border-color: var(--crm-accent);
		color: var(--crm-on-accent);
		font-weight: 630;
	}
	.promotion-list,
	.promotion-history ol {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.promotion-list,
	.promotion-editor {
		background: var(--crm-paper);
		border: 1px solid var(--crm-line);
		border-radius: var(--crm-radius);
	}
	.promotion-list > li + li {
		border-top: 1px solid var(--crm-line);
	}
	.promotion-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(8rem, 11rem) auto;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
	}
	.promotion-name {
		overflow-wrap: anywhere;
	}
	.promotion-status {
		display: grid;
		gap: 0.2rem;
	}
	.promotion-status span,
	small {
		color: var(--crm-muted);
	}
	.promotion-editor {
		display: grid;
		justify-items: start;
		gap: 1rem;
		padding: 1rem;
		margin-bottom: 1rem;
	}
	.promotion-editor label {
		display: grid;
		gap: 0.3rem;
	}
	.promotion-editor .promotion-visibility {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.promotion-editor p {
		margin: 0;
	}
	.promotion-history {
		border-top: 1px solid var(--crm-line);
		padding: 0.8rem 1rem;
		background: var(--crm-subtle);
	}
	.promotion-history li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1rem;
		padding-block: 0.25rem;
	}
	.promotion-history time {
		color: var(--crm-muted);
	}
	@media (max-width: 740px) {
		.promotion-row {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.6rem;
		}
	}
</style>
