<script lang="ts">
	import { notifyError } from '$lib/utils/notify-error';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import PageRenderer from '$lib/components/PageRenderer.svelte';
	import * as Promo1Layout from '$lib/components/templates/Promo-1/layout';
	import type { TemplateLayout } from '$lib/components/templates/types';
	import '$lib/components/templates/Promo-1/theme.css';
	import { clientAuthModal } from '$lib/stores/client-auth.svelte';
	import { createFormSender } from '$lib/utils/form-submission';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const promo1Site = $derived(data.site?.templateId === 1 ? data.site : null);
	const send = createFormSender('platform-partner-registration');
	let partnerType = $derived(data.application?.partner_type ?? '');
	let company = $derived(data.application?.company ?? '');
	let inn = $derived(data.application?.inn ?? '');
	let city = $derived(data.application?.city ?? '');
	let website = $derived(data.application?.website ?? '');
	let comment = $derived(data.application?.comment ?? '');
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
			error = notifyError(e, 'Не удалось отправить заявку.');
		} finally {
			busy = false;
		}
	}
	const inputClass =
		'p1-card p1-title mt-2 w-full rounded-xl border px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600';
	const actionClass =
		'inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600';
</script>

<svelte:head>
	<title>Подключение партнёра — {promo1Site?.name || 'LEGET'}</title>
	{#if promo1Site?.faviconUrl}
		<link rel="icon" href={promo1Site.faviconUrl} />
	{/if}
</svelte:head>

{#if promo1Site}
	<PageRenderer
		layout={Promo1Layout as TemplateLayout}
		componentMap={{}}
		templateId={promo1Site.templateId}
		slug="/partner/register"
		components={data.footer ? [data.footer] : []}
		headerData={promo1Site.header?.data ?? null}
		footerData={promo1Site.footer?.data ?? null}
		seo={null}
		editContext={null}
	>
		{@render registration()}
	</PageRenderer>
{:else}
	{@render registration()}
{/if}

{#snippet registration()}
	<main class="p1-surface p1-title px-4 py-section-sm sm:px-6 sm:py-section" data-p1-theme="light">
		<div class="mx-auto max-w-2xl">
			<a
				href={resolve('/[...slug]', { slug: 'partnership' })}
				class="ds-accent text-sm font-semibold underline underline-offset-4">Условия партнёрства</a
			>
			<h1 class="mt-5 text-3xl text-balance sm:text-5xl">Подключение партнёра</h1>
			<p class="p1-body mt-4 max-w-prose leading-relaxed">
				Создайте аккаунт, выберите свой статус и отправьте заявку. После одобрения появится кабинет
				партнёра.
			</p>
			{#if data.apiError}<p role="alert" class="p1-card mt-6 rounded-xl border p-4">
					{data.apiError}
				</p>
			{:else if !data.profile}
				<section class="p1-border mt-8 border-t pt-6 sm:mt-10 sm:pt-8">
					<h2 class="text-2xl">Аккаунт для партнёрства</h2>
					<p class="p1-body mt-3 max-w-prose leading-relaxed">
						Используйте существующий клиентский аккаунт или зарегистрируйте новый. Затем заполните
						сведения о партнёре.
					</p>
					<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
						<button
							type="button"
							class="ds-action {actionClass}"
							onclick={() => clientAuthModal.open('register')}
							data-metrika-goal="partner_registration_open"
							data-goal-action="open">Создать аккаунт</button
						>
						<button
							type="button"
							class="p1-border border hover:bg-(--p1-surface-alt) {actionClass}"
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
				<p class="ym-hide-content p1-body mt-6 text-sm wrap-anywhere">
					{data.profile.name} · {data.profile.email}
				</p>
				{#if saved}<p role="status" class="p1-card mt-4 rounded-xl border p-4">
						Заявка принята и сохранена. Статус рассмотрения появится здесь.
					</p>{/if}
				{#if data.application}
					<section
						class="ym-hide-content p1-border mt-6 border-y py-5"
						aria-label="Статус подключения"
					>
						<h2 class="text-xl">{data.application.status_label}</h2>
						<p class="mt-2">{data.application.partner_type_label}</p>
						{#if data.application.review_note}<p class="mt-2">
								{data.application.review_note}
							</p>{/if}
						{#if data.application.status === 'approved'}<a
								class="ds-accent mt-3 inline-block underline underline-offset-4"
								href={resolve('/partner')}>Открыть кабинет партнёра</a
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
								bind:value={partnerType}
								><option value="" disabled>Выберите статус</option
								>{#each types as [value, label] (value)}<option {value}>{label}</option
									>{/each}</select
							></label
						>
						<label class="block"
							>Компания или название практики<input
								name="company"
								autocomplete="organization"
								maxlength="255"
								bind:value={company}
								class={inputClass}
							/></label
						>
						<div class="grid gap-5 sm:grid-cols-2">
							<label class="block"
								>ИНН, если есть<input
									name="inn"
									inputmode="numeric"
									maxlength="12"
									bind:value={inn}
									class={inputClass}
								/></label
							>
							<label class="block"
								>Город<input
									name="city"
									autocomplete="address-level2"
									maxlength="100"
									bind:value={city}
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
								bind:value={website}
								class={inputClass}
							/></label
						>
						<label class="block"
							>Расскажите о своей работе<textarea
								name="comment"
								maxlength="2000"
								rows="4"
								bind:value={comment}
								class={inputClass}
							></textarea></label
						>
					</fieldset>
					{#if error}<p role="alert">{error}</p>{/if}
					<button
						type="submit"
						disabled={busy}
						data-metrika-goal="partner_application_submit"
						data-goal-label="Отправить заявку на подключение / Обновить заявку"
						data-goal-action="submit_click"
						class="ds-action w-full disabled:opacity-60 sm:w-auto {actionClass}"
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
{/snippet}
