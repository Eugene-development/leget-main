<script lang="ts">
	import { tick } from 'svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import { createFormSender } from '$lib/utils/form-submission';
	const sendForm = createFormSender('promo1-partnership');
	let { open = $bindable(false) }: { open?: boolean } = $props();
	const id = $props.id();
	let status = $state('');
	let statusFields = $state<HTMLFieldSetElement>();
	let name = $state('');
	let company = $state('');
	let phone = $state('');
	let email = $state('');
	let city = $state('');
	let comment = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let error = $state('');
	const business = $derived(status === 'manufacturer' || status === 'supplier');
	const statusOptions = [
		{ value: 'referral', label: 'Вы приводите клиентов' },
		{ value: 'manufacturer', label: 'Вы фабрика изготовитель' },
		{ value: 'supplier', label: 'Вы поставщик' },
		{ value: 'other', label: 'Иное' }
	];
	const inputClass =
		'mt-2 block w-full rounded-lg border border-on-dark/25 bg-ink-900 px-3 py-3 text-base text-on-dark focus:border-link-400 focus:outline-2 focus:outline-offset-2 focus:outline-link-400';
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (sending || !status) return;
		error = '';
		const normalizedPhone = phone.trim() ? phone.replace(/[\s()\-]/g, '') : '';
		if (normalizedPhone && !/^\+?[0-9]{7,15}$/.test(normalizedPhone)) {
			error = 'Проверьте телефон: укажите от 7 до 15 цифр с кодом страны.';
			return;
		}
		if ((!business && !normalizedPhone) || (business && !normalizedPhone && !email.trim())) {
			error = business ? 'Укажите телефон или почту для связи.' : 'Укажите телефон для связи.';
			return;
		}
		if (!name.trim() || (business && !company.trim())) {
			error = business ? 'Укажите наименование компании и контактное лицо.' : 'Укажите ваше имя.';
			return;
		}
		sending = true;
		try {
			await sendForm(
				{
					service_type: 'partnership',
					partnership_status: status,
					name: name.trim(),
					phone: normalizedPhone || null,
					email: business ? email.trim() || null : null,
					company: business ? company.trim() : null,
					city: business ? null : city.trim(),
					message: comment.trim(),
					source_url: window.location.href.slice(0, 500)
				},
				'service-request',
				event
			);

			sent = true;
			name = company = phone = email = city = comment = '';
		} catch {
			error = 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.';
		} finally {
			sending = false;
		}
	}
</script>

<SideDrawer goalPrefix="partnership_drawer" bind:open title="Партнёрство">
	{#if sent}
		<div class="space-y-5 text-on-dark" role="status">
			<p class="text-xl font-semibold">Заявка принята</p>
			<p class="text-sm leading-relaxed text-on-dark/80">
				Свяжемся с вами, чтобы обсудить условия партнёрства.
			</p>
			<button
				data-metrika-goal="pages_partnership_partnershipdrawer_close_1"
				data-goal-action="close"
				type="button"
				class="min-h-11 rounded-lg border border-on-dark/30 px-5 py-3 focus-visible:outline-2 focus-visible:outline-link-400"
				onclick={() => {
					open = false;
					sent = false;
					status = '';
				}}>Закрыть</button
			>
		</div>
	{:else}
		<form onsubmit={submit} class="space-y-6 text-sm text-on-dark" aria-busy={sending}>
			<input type="hidden" name="partnership_status" value={status} />
			<fieldset bind:this={statusFields} disabled={sending} class="space-y-3">
				<legend class="mb-3 text-base font-semibold text-link-400">Выберите ваш статус</legend>
				{#if status}
					<button
						type="button"
						aria-label="Назад к выбору статуса"
						title="Назад к выбору статуса"
						data-metrika-goal="pages_partnership_partnershipdrawer_status_back"
						data-goal-action="reset"
						class="flex size-11 items-center justify-center rounded-lg text-link-400 transition-colors hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-link-400"
						onclick={async () => {
							status = '';
							error = '';
							await tick();
							statusFields?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus();
						}}
					>
						<svg
							aria-hidden="true"
							class="size-5"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"><path d="m12 19-7-7 7-7M5 12h14" /></svg
						>
					</button>
				{/if}
				{#each statusOptions.filter((option) => !status || option.value === status) as option (option.value)}
					<label
						class="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors {status ===
						option.value
							? 'border-link-400 bg-on-dark/10'
							: 'border-on-dark/25 hover:bg-on-dark/5'}"
					>
						<input
							type="radio"
							name={`${id}-status`}
							value={option.value}
							bind:group={status}
							onchange={() => {
								error = '';
							}}
							class="size-4 shrink-0 accent-link-400"
						/>
						<span>{option.label}</span>
					</label>
				{/each}
			</fieldset>
			{#if status}
				<fieldset disabled={sending} class="space-y-5">
					<legend class="mb-4 text-base font-semibold text-link-400">Контактные данные</legend>
					{#if business}<label class="block"
							>Наименование компании *<input
								name="company"
								autocomplete="organization"
								bind:value={company}
								required
								maxlength="255"
								class={inputClass}
							/></label
						>{/if}
					<label class="block"
						>{business ? 'Контактное лицо' : 'Ваше имя'} *<input
							name="name"
							autocomplete="name"
							bind:value={name}
							required
							maxlength="255"
							class={inputClass}
						/></label
					>
					<label class="block"
						>Телефон{business ? '' : ' *'}<input
							name="phone"
							type="tel"
							autocomplete="tel"
							bind:value={phone}
							required={!business || !email.trim()}
							maxlength="50"
							class={inputClass}
						/></label
					>
					{#if business}
						<label class="block"
							>Почта<input
								name="email"
								type="email"
								autocomplete="email"
								bind:value={email}
								required={!phone.trim()}
								maxlength="255"
								class={inputClass}
							/></label
						>
					{:else}
						<label class="block"
							>Город<input
								name="city"
								autocomplete="address-level2"
								bind:value={city}
								maxlength="100"
								class={inputClass}
							/></label
						>
					{/if}
					<label class="block"
						>Комментарий<textarea
							name="comment"
							bind:value={comment}
							maxlength="2000"
							rows="3"
							class={`${inputClass} resize-y`}
						></textarea></label
					>
				</fieldset>
				{#if error}<p role="alert" class="rounded-lg border border-on-dark/30 p-3 text-on-dark">
						{error}
					</p>{/if}
				<button
					data-metrika-goal="pages_partnership_partnershipdrawer_submit_click_1"
					data-goal-action="submit_click"
					type="submit"
					disabled={sending}
					class="min-h-12 w-full rounded-lg bg-link-600 px-5 py-3 text-base font-semibold text-on-accent transition-colors hover:bg-link-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link-400 disabled:cursor-wait disabled:opacity-60"
					>{sending ? 'Отправляем…' : 'Отправить заявку'}</button
				>
			{/if}
		</form>
	{/if}
</SideDrawer>
