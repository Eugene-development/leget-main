<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { growthRequest } from '$lib/growth/selections/api';
	import { createFormSender } from '$lib/utils/form-submission';
	import SiteAnalytics from '$lib/components/SiteAnalytics.svelte';
	import '$lib/growth/selections/surfaces.css';
	let { data } = $props();
	const selection = $derived(data.selection);
	let author = $state('');
	let comment = $state('');
	let name = $state('');
	let phone = $state('');
	let message = $state('');
	let commenting = $state(false);
	let sending = $state(false);
	let revoking = $state(false);
	let revoked = $state(false);
	let copied = $state(false);
	let error = $state('');
	let accepted = $state(false);
	let commentRetry: { fingerprint: string; key: string } | null = null;
	const sendForm = createFormSender('selection-estimate');
	async function addComment(event: SubmitEvent) {
		event.preventDefault();
		if (commenting) return;
		commenting = true;
		error = '';
		const fingerprint = JSON.stringify({ author, comment });
		if (commentRetry?.fingerprint !== fingerprint)
			commentRetry = { fingerprint, key: crypto.randomUUID() };
		try {
			await growthRequest(`selections/${selection.token}/comments`, {
				author,
				body: comment,
				submission_key: commentRetry!.key
			});
			comment = '';
			commentRetry = null;
			await invalidateAll();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось добавить комментарий.';
		} finally {
			commenting = false;
		}
	}
	async function requestEstimate(event: SubmitEvent) {
		event.preventDefault();
		if (sending) return;
		sending = true;
		error = '';
		try {
			await sendForm(
				{
					service_type: 'selection-estimate',
					selection_token: selection.token,
					name,
					phone,
					message
				},
				'service-request',
				event
			);
			accepted = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось отправить заявку.';
		} finally {
			sending = false;
		}
	}
	async function copy() {
		error = '';
		try {
			await navigator.clipboard.writeText(`${page.url.origin}/selection/${selection.token}`);
			copied = true;
		} catch {
			error = 'Не удалось скопировать ссылку. Скопируйте её из поля ниже.';
		}
	}
	async function revoke() {
		if (revoking) return;
		revoking = true;
		error = '';
		try {
			await growthRequest(`selections/${selection.token}/revoke`, {});
			revoked = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось закрыть ссылку.';
		} finally {
			revoking = false;
		}
	}
</script>

<svelte:head
	><title>{selection.title} — подборка</title><meta
		name="robots"
		content="noindex, nofollow"
	/><meta name="referrer" content="no-referrer" /></svelte:head
>
<SiteAnalytics data={data.site.header?.data} />
<main class="planning-surface ym-hide-content">
	<div class="planning-wrap">
		<nav class="planning-nav" aria-label="Навигация">
			<a href="/">{data.site.name || 'Главная'}</a><a href="/favorites">Избранное</a><a
				href="/calculator">Рассчитать кухню</a
			>
		</nav>
		<header class="planning-heading">
			<h1>{selection.title}</h1>
			<p>
				Обсуждайте проекты и материалы, затем отправьте подборку на расчёт. Ссылка действует до {new Date(
					selection.expires_at
				).toLocaleDateString('ru-RU')}.
			</p>
		</header>
		{#if revoked}<section class="planning-notice" role="status">
				<h2>Ссылка закрыта</h2>
				<p>Эта подборка больше не доступна другим посетителям.</p>
				<a href="/favorites">Собрать новую подборку</a>
			</section>
		{:else}<div class="planning-layout">
				<div>
					<section class="planning-section" aria-label="Проекты и материалы">
						<h2>Выбрано для обсуждения</h2>
						{#if selection.items.length}<ul class="planning-items">
								{#each selection.items as item (`${item.kind}:${item.id}`)}<li>
										<a href={item.path}
											>{item.kind === 'project' ? `Проект ${item.title}` : item.title}</a
										><small
											>{item.kind === 'project'
												? 'Мебель на заказ'
												: 'Материал или комплектация'}</small
										>
									</li>{/each}
							</ul>
						{:else}<p>
								Выбранные позиции сейчас не опубликованы. Соберите новую подборку из каталога.
							</p>{/if}
						<div class="planning-actions">
							<button
								type="button"
								class="planning-button"
								onclick={copy}
								data-goal-ignore="Копирование ссылки на подборку"
								>{copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}</button
							>
						</div>
						<label class="planning-fields mt-4"
							>Ссылка для обсуждения<input
								class="planning-link-input"
								readonly
								value={`${page.url.origin}/selection/${selection.token}`}
								aria-label="Ссылка на подборку"
							/></label
						>
					</section>
					<section class="planning-section">
						<h2>Комментарии</h2>
						<p>
							Комментарии видны всем, у кого есть ссылка. Контактные данные оставьте в заявке на
							расчёт.
						</p>
						{#each selection.comments as entry (entry.id)}<article class="planning-comment">
								<strong>{entry.author}</strong><small
									>{new Date(entry.created_at).toLocaleDateString('ru-RU')}</small
								>
								<p>{entry.body}</p>
							</article>{/each}
						<form
							onsubmit={addComment}
							class="planning-fields ym-hide-content"
							data-form-business="selection-comment"
						>
							<label
								>Ваше имя<input
									class="ym-disable-keys"
									bind:value={author}
									required
									maxlength="80"
									autocomplete="nickname"
								/></label
							><label
								>Комментарий<textarea
									class="ym-disable-keys"
									bind:value={comment}
									required
									maxlength="2000"
									rows="3"
								></textarea></label
							><button
								class="planning-button"
								disabled={commenting}
								data-goal-ignore="Обсуждение подборки — операция каталога"
								>{commenting ? 'Добавляем…' : 'Добавить комментарий'}</button
							>
						</form>
					</section>
				</div>
				<aside>
					<section class="planning-section">
						<h2>Рассчитать подборку</h2>
						{#if accepted}<p class="planning-notice" role="status">
								Заявка принята. Менеджер свяжется с вами и обсудит выбранные проекты и материалы.
							</p>
						{:else}<p>
								Оставьте номер телефона. Менеджер получит ссылку на подборку вместе с вашим
								пожеланием.
							</p>
							<form onsubmit={requestEstimate} class="planning-fields ym-hide-content">
								<label
									>Имя<input
										class="ym-disable-keys"
										bind:value={name}
										required
										maxlength="255"
										autocomplete="name"
									/></label
								><label
									>Телефон<input
										class="ym-disable-keys"
										type="tel"
										bind:value={phone}
										required
										maxlength="50"
										autocomplete="tel"
									/></label
								><label
									>Пожелания<textarea
										class="ym-disable-keys"
										bind:value={message}
										maxlength="2000"
										rows="4"
									></textarea></label
								>
								<p>Отправляя заявку, вы соглашаетесь с обработкой персональных данных.</p>
								<button
									class="planning-button primary"
									disabled={sending || selection.items.length === 0}
									data-metrika-goal="selection_estimate_submit"
									data-goal-action="submit_click"
									>{sending ? 'Отправляем…' : 'Отправить на расчёт'}</button
								>
							</form>{/if}
					</section>
					{#if selection.can_manage}<section class="planning-section">
							<h2>Управление ссылкой</h2>
							<p>
								После закрытия ссылкой больше нельзя пользоваться. Заявка, которую вы уже отправили,
								сохранится у менеджера.
							</p>
							<button
								class="planning-button"
								type="button"
								onclick={revoke}
								disabled={revoking}
								data-goal-ignore="Отзыв ссылки создателем подборки"
								>{revoking ? 'Закрываем…' : 'Закрыть доступ по ссылке'}</button
							>
						</section>{/if}
				</aside>
			</div>{/if}
		{#if error}<p class="planning-error" role="alert">{error}</p>{/if}
	</div>
</main>
