<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let busy = $state(false);
</script>

<svelte:head
	><title>Заявки партнёров — LEGET</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<main class="min-h-screen bg-surface-warm px-4 py-12 text-ink-950 sm:px-6">
	<div class="mx-auto max-w-4xl">
		<nav class="flex flex-wrap gap-5">
			<a href="/admin" class="text-link-600 underline">Кабинет суперадмина</a><a
				href="/admin/clients"
				class="text-link-600 underline">Пользователи и кураторы</a
			><a href="/admin/crm/members" class="text-link-600 underline">Менеджеры сайтов</a>
		</nav>
		<h1 class="mt-8 text-4xl">Заявки партнёров</h1>
		<p class="mt-4 text-ink-600">
			Одобрение открывает кабинет партнёра. Статус деятельности указан в каждой заявке.
		</p>
		<nav aria-label="Статус заявок" class="my-8 flex flex-wrap gap-4">
			{#each [['pending', 'На рассмотрении'], ['approved', 'Подключены'], ['rejected', 'Отклонены']] as [status, label]}<a
					href={`?status=${status}`}
					aria-current={data.status === status ? 'page' : undefined}
					class="rounded-lg border border-border-medium px-4 py-3 {data.status === status
						? 'bg-ink-950 text-on-dark'
						: ''}">{label}</a
				>{/each}
		</nav>
		{#if data.apiError || form?.error}<p role="alert" class="mb-6 border border-border-medium p-4">
				{data.apiError || form?.error}
			</p>{/if}
		{#if form?.success}<p role="status" class="mb-6 border border-border-medium p-4">
				{form.success}
			</p>{/if}
		{#each data.applications?.data || [] as application (application.id)}
			<section class="ym-hide-content border-t border-border-medium py-6">
				<h2 class="text-2xl">{application.company || application.applicant.name}</h2>
				<p class="mt-2">
					{application.partner_type_label} · {application.city || 'Город не указан'}
				</p>
				<p class="mt-2 text-sm text-ink-600">
					{application.applicant.name} · {application.applicant.email} · {application.applicant
						.phone || 'Телефон не указан'}
				</p>
				{#if application.inn}<p class="mt-2">ИНН: {application.inn}</p>{/if}
				{#if application.website}<p class="mt-2 break-all">Сайт: {application.website}</p>{/if}
				{#if application.comment}<p class="mt-4 whitespace-pre-wrap">{application.comment}</p>{/if}
				{#if application.review_note}<p class="mt-3 text-ink-600">
						Решение: {application.review_note}
					</p>{/if}
				<form
					method="POST"
					action="?/review"
					use:enhance={() => {
						busy = true;
						return async ({ update }) => {
							try {
								await update();
							} finally {
								busy = false;
							}
						};
					}}
					class="mt-5 space-y-4"
				>
					<input type="hidden" name="id" value={application.id} />
					<label class="block text-sm"
						>Комментарий к решению<textarea
							name="note"
							maxlength="2000"
							rows="2"
							class="mt-2 w-full rounded-lg border border-border-medium bg-surface-raised p-3"
						></textarea></label
					>
					<div class="flex flex-wrap gap-3">
						{#if application.status !== 'approved'}<button
								type="submit"
								name="decision"
								value="approve"
								disabled={busy}
								class="rounded-lg bg-link-600 px-5 py-3 text-on-accent disabled:opacity-50"
								data-metrika-goal="admin_partner_approve"
								data-goal-action="submit_click">Подключить партнёра</button
							>{/if}
						<button
							type="submit"
							name="decision"
							value="reject"
							disabled={busy}
							class="rounded-lg border border-border-medium px-5 py-3 disabled:opacity-50"
							data-metrika-goal="admin_partner_reject"
							data-goal-action="submit_click"
							>{application.status === 'approved' ? 'Отозвать доступ' : 'Отклонить заявку'}</button
						>
					</div>
				</form>
			</section>
		{:else}{#if !data.apiError}<p>В этом разделе заявок пока нет.</p>{/if}{/each}
		{#if data.applications && data.applications.last_page > 1}<nav
				aria-label="Страницы"
				class="mt-8 flex gap-5"
			>
				{#if data.applications.current_page > 1}<a
						href={`?status=${data.status}&page=${data.applications.current_page - 1}`}>Предыдущая</a
					>{/if}
				<span>{data.applications.current_page} / {data.applications.last_page}</span>
				{#if data.applications.current_page < data.applications.last_page}<a
						href={`?status=${data.status}&page=${data.applications.current_page + 1}`}>Следующая</a
					>{/if}
			</nav>{/if}
	</div>
</main>
