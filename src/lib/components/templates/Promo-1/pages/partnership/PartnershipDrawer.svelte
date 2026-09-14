<script lang="ts">
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import { getAuthApiUrl } from '$lib/utils/config';
	let { open = $bindable(false) }: { open?: boolean } = $props();
	const id = $props.id();
	let status = $state('');
	let name = $state('');
	let company = $state('');
	let phone = $state('');
	let email = $state('');
	let city = $state('');
	let comment = $state('');
	let sending = $state(false);
	let sent = $state(false);
	let error = $state('');
	const supplier = $derived(status === 'supplier');
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
		if ((!supplier && !normalizedPhone) || (supplier && !normalizedPhone && !email.trim())) {
			error = supplier ? 'Укажите телефон или почту для связи.' : 'Укажите телефон для связи.';
			return;
		}
		if (!name.trim() || (supplier && !company.trim())) {
			error = supplier ? 'Укажите наименование компании и контактное лицо.' : 'Укажите ваше имя.';
			return;
		}
		sending = true;
		try {
			const response = await fetch(`${getAuthApiUrl()}/notify/service-request`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				signal: AbortSignal.timeout(20000),
				body: JSON.stringify({
					service_type: 'partnership',
					partnership_status: status,
					name: name.trim(),
					phone: normalizedPhone || null,
					email: supplier ? email.trim() || null : null,
					company: supplier ? company.trim() : null,
					city: supplier ? null : city.trim(),
					message: supplier ? null : comment.trim(),
					source_url: window.location.href.slice(0, 500)
				})
			});
			const result = await response.json().catch(() => null);
			if (!response.ok || !result?.success) {
				error =
					response.status === 429
						? 'Слишком много попыток. Подождите минуту и отправьте заявку ещё раз.'
						: 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.';
				return;
			}
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
			<p class="text-xl font-semibold">Заявка отправлена</p>
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
			<fieldset disabled={sending} class="space-y-3">
				<legend class="mb-3 text-base font-semibold">Выберите ваш статус</legend>
				{#each [{ value: 'referral', label: 'Вы приводите клиентов' }, { value: 'supplier', label: 'Вы фабрика или поставщик' }] as option}
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
					<legend class="mb-4 text-base font-semibold">Контактные данные</legend>
					{#if supplier}<label class="block"
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
						>{supplier ? 'Контактное лицо' : 'Ваше имя'} *<input
							name="name"
							autocomplete="name"
							bind:value={name}
							required
							maxlength="255"
							class={inputClass}
						/></label
					>
					{#if supplier}<p id={`${id}-contact-hint`} class="text-on-dark/80">
							Заполните телефон или почту — достаточно одного способа связи.
						</p>{/if}
					<label class="block"
						>Телефон{supplier ? '' : ' *'}<input
							name="phone"
							type="tel"
							autocomplete="tel"
							bind:value={phone}
							required={!supplier || !email.trim()}
							maxlength="50"
							aria-describedby={supplier ? `${id}-contact-hint` : undefined}
							class={inputClass}
						/></label
					>
					{#if supplier}
						<label class="block"
							>Почта<input
								name="email"
								type="email"
								autocomplete="email"
								bind:value={email}
								required={!phone.trim()}
								maxlength="255"
								aria-describedby={`${id}-contact-hint`}
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
						<label class="block"
							>Комментарий<textarea
								name="comment"
								bind:value={comment}
								maxlength="2000"
								rows="3"
								class={`${inputClass} resize-y`}
							></textarea></label
						>
					{/if}
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
