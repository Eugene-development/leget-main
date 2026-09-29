<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import { createFormSender } from '$lib/utils/form-submission';
	let { data } = $props();
	const send = createFormSender('platform-partner-registration');
	let busy = $state(false);
	let error = $state('');
	let saved = $state(false);
	const types = [
		['designer', 'Дизайнер'],
		['supplier', 'Поставщик'],
		['manufacturer', 'Производитель'],
		['assembler', 'Сборщик'],
		['repair_team', 'Ремонтная бригада'],
		['furniture_seller', 'Продавец мебели'],
		['individual', 'Физическое лицо']
	];
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		busy = true;
		error = '';
		saved = false;
		try {
			await send(
				new FormData(event.currentTarget as HTMLFormElement),
				'partner-application',
				event
			);
			saved = true;
			await invalidateAll();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Не удалось отправить заявку.';
		} finally {
			busy = false;
		}
	}
	const inputClass =
		'mt-2 w-full rounded-lg border border-border-medium bg-surface-raised px-3 py-3 text-ink-950 focus-visible:outline-2 focus-visible:outline-link-600';
</script>

<svelte:head
	><title>Подключение партнёра — LEGET</title><meta name="robots" content="noindex" /></svelte:head
>
<main class="min-h-screen bg-surface-warm px-4 py-12 text-ink-950 sm:px-6">
	<div class="mx-auto max-w-2xl">
		<a href="/partnership" class="text-link-600 underline underline-offset-4">Условия партнёрства</a
		>
		<h1 class="mt-6 text-4xl">Подключение партнёра</h1>
		<p class="mt-4 text-ink-600">
			Создайте аккаунт, выберите свой статус и отправьте заявку. После одобрения появится кабинет
			партнёра.
		</p>
		{#if data.apiError}<p role="alert" class="mt-6 rounded-lg border border-border-medium p-4">
				{data.apiError}
			</p>
		{:else if !data.profile}
			<section class="mt-8 border-t border-border-light pt-6">
				<h2 class="text-2xl">Аккаунт для партнёрства</h2>
				<p class="mt-3 text-ink-600">
					Используйте существующий клиентский аккаунт или зарегистрируйте новый. Затем заполните
					сведения о партнёре.
				</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<button
						class="rounded-lg bg-link-600 px-5 py-3 text-on-accent"
						onclick={() => clientAuthModal.open('register')}
						data-metrika-goal="partner_registration_open"
						data-goal-action="open">Создать аккаунт</button
					>
					<button
						class="rounded-lg border border-border-medium px-5 py-3"
						onclick={() => clientAuthModal.open('login')}
						data-metrika-goal="partner_login_open"
						data-goal-action="open">Уже есть аккаунт</button
					>
				</div>
			</section>
		{:else if !['client', 'student', 'partner'].includes(data.profile.role)}
			<p class="mt-8">
				Вы вошли как сотрудник или администратор сайта. Для партнёрства нужен отдельный клиентский
				аккаунт.
			</p>
		{:else}
			<p class="mt-6 text-sm text-ink-600">{data.profile.name} · {data.profile.email}</p>
			{#if saved}<p role="status" class="mt-4 rounded-lg border border-border-medium p-4">
					Заявка принята и сохранена. Статус рассмотрения появится здесь.
				</p>{/if}
			{#if data.application}
				<section class="mt-6 border-y border-border-light py-5" aria-label="Статус подключения">
					<h2 class="text-xl">{data.application.status_label}</h2>
					<p class="mt-2">{data.application.partner_type_label}</p>
					{#if data.application.review_note}<p class="mt-2">{data.application.review_note}</p>{/if}
					{#if data.application.status === 'approved'}<a
							class="mt-3 inline-block text-link-600 underline"
							href="/partner">Открыть кабинет партнёра</a
						>{/if}
				</section>
			{/if}
			<form onsubmit={submit} class="ym-hide-content mt-8 space-y-5" aria-busy={busy}>
				<h2 class="text-2xl">Сведения о партнёре</h2>
				<fieldset disabled={busy} class="space-y-5">
					<legend class="sr-only">Контакты и статус партнёра</legend>
					<label class="block"
						>Ваш статус<select
							name="partner_type"
							required
							class={inputClass}
							value={data.application?.partner_type || ''}
							><option value="" disabled>Выберите статус</option
							>{#each types as [value, label]}<option {value}>{label}</option>{/each}</select
						></label
					>
					<label class="block"
						>Компания или название практики<input
							name="company"
							autocomplete="organization"
							maxlength="255"
							value={data.application?.company || ''}
							class={inputClass}
						/></label
					>
					<div class="grid gap-5 sm:grid-cols-2">
						<label class="block"
							>ИНН, если есть<input
								name="inn"
								inputmode="numeric"
								maxlength="12"
								value={data.application?.inn || ''}
								class={inputClass}
							/></label
						>
						<label class="block"
							>Город<input
								name="city"
								autocomplete="address-level2"
								maxlength="100"
								value={data.application?.city || ''}
								class={inputClass}
							/></label
						>
					</div>
					<label class="block"
						>Сайт<input
							name="website"
							type="url"
							maxlength="255"
							placeholder="https://"
							value={data.application?.website || ''}
							class={inputClass}
						/></label
					>
					<label class="block"
						>Расскажите о своей работе<textarea
							name="comment"
							maxlength="2000"
							rows="4"
							class={inputClass}>{data.application?.comment || ''}</textarea
						></label
					>
				</fieldset>
				{#if error}<p role="alert">{error}</p>{/if}
				<button
					type="submit"
					disabled={busy}
					data-metrika-goal="partner_application_submit"
					data-goal-action="submit_click"
					class="rounded-lg bg-link-600 px-6 py-3 text-on-accent disabled:opacity-60"
					>{busy
						? 'Сохраняем…'
						: data.application
							? 'Обновить заявку'
							: 'Отправить заявку на подключение'}</button
				>
			</form>
		{/if}
	</div>
</main>
