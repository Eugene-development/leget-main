<script lang="ts">
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { ct, revealOnScroll } from '../../theme';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { cityStore } from '$lib/stores/city.svelte';
	import { formatPhone, isValidPhone } from '$lib/utils/phone';
	import { formHeading } from '$lib/utils/form-submission';
	import { submitServiceRequest } from '$lib/utils/service-request';
	import '../../../../theme.css';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'light'));
	let name = $state('');
	let phone = $state('');
	let objectAddress = $state('');
	let visitTime = $state('');
	let message = $state('');
	let isSubmitting = $state(false);
	let submitted = $state(false);
	let errorMessage = $state('');

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactAddress', updated);
		data = updated;
	}

	function handlePhoneInput(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		phone = input.value ? formatPhone(input.value) : '';
		input.value = phone;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (isSubmitting) return;
		errorMessage = '';
		if (!name.trim() || !isValidPhone(phone) || objectAddress.trim().length < 10) {
			errorMessage = 'Укажите имя, полный номер телефона и адрес объекта.';
			return;
		}
		isSubmitting = true;
		try {
			await submitServiceRequest({
				serviceType: 'consultation',
				formId: 'promo1-contacts-site-consultation',
				formTitle: formHeading(event),
				name,
				phone,
				objectAddress,
				visitTime,
				message,
				city: cityStore.city,
				sourceUrl: typeof window !== 'undefined' ? window.location.href : null
			});
			submitted = true;
		} catch {
			errorMessage = 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз.';
		} finally {
			isSubmitting = false;
		}
	}

	function resetForm() {
		name = '';
		phone = '';
		objectAddress = '';
		visitTime = '';
		message = '';
		errorMessage = '';
		submitted = false;
	}
</script>

<section
	class="{ct.section.shell} {ct.section.pad} {ct.surface.paper}"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ct-rules"></div>
		<div class={ct.accent.toplineOnLight}></div>
	</div>
	<div class={ct.section.container}>
		<div
			use:revealOnScroll
			class="ct-reveal grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-20"
		>
			<div class="lg:pt-8">
				<EditableField
					fieldKey="ContactAddress.visitTitle"
					label="Заголовок встречи на объекте"
					value={String(data?.visitTitle ?? 'Встретимся у вас на объекте')}
					{isEditable}
					onSave={(value) => saveField('visitTitle', value)}
					class="ct-item block"
				>
					{#snippet children(displayValue)}
						<h2 class={ct.title.h2OnLight}><RichText value={displayValue} /></h2>
					{/snippet}
				</EditableField>
				<EditableField
					fieldKey="ContactAddress.visitDescription"
					label="Описание встречи на объекте"
					value={String(
						data?.visitDescription ??
							'Приедем к вам, посмотрим пространство и обсудим задачу на месте. Оставьте контакты и адрес объекта — свяжемся, чтобы согласовать встречу.'
					)}
					{isEditable}
					multiline
					onSave={(value) => saveField('visitDescription', value)}
					class="ct-item ct-d1 mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="{ct.body.onLight} max-w-xl text-lg"><RichText value={displayValue} /></p>
					{/snippet}
				</EditableField>
				<div class="ct-item ct-d2 p1-line mt-10 border-t pt-6">
					<p class="{ct.body.labelOnLight} text-sm">Встреча начинается с разговора</p>
					<p class="{ct.body.onLight} mt-2 max-w-md">
						Расскажите, где находится объект и что хотите обсудить. Детали и удобное время уточним
						лично.
					</p>
				</div>
				<div
					class="ct-item ct-d3 mt-8 inline-flex items-center gap-3 rounded-2xl border border-brand-600/20 bg-brand-600/5 px-5 py-4"
				>
					<span class="size-2 rounded-full bg-brand-600" aria-hidden="true"></span>
					<p class="{ct.body.labelOnLight} text-sm">Услуга бесплатная</p>
				</div>
			</div>

			<div class="ct-item ct-d2 {ct.card.onLight} p-6 sm:p-9">
				{#if submitted}
					<div role="status" aria-live="polite" class="py-8">
						<h3 class={ct.title.h3OnLight}>Заявка принята</h3>
						<p class="{ct.body.onLight} mt-3">
							Свяжемся с вами, чтобы уточнить детали и согласовать встречу на объекте.
						</p>
						<button
							type="button"
							onclick={resetForm}
							data-metrika-goal="contacts_site_consultation_reset"
							data-goal-action="reset"
							class="{ct.btn.link} mt-7 cursor-pointer">Оставить ещё одну заявку</button
						>
					</div>
				{:else}
					<form onsubmit={handleSubmit} aria-busy={isSubmitting} class="space-y-5">
						<h3 class={ct.title.h3OnLight}>Заявка на встречу</h3>
						<p class={ct.body.onLight}>Заполните поля, чтобы мы могли связаться с вами.</p>
						<div class="grid gap-5 sm:grid-cols-2">
							<div>
								<label for="site-consultation-name" class="{ct.body.labelOnLight} block text-sm"
									>Ваше имя</label
								>
								<input
									id="site-consultation-name"
									type="text"
									bind:value={name}
									required
									maxlength="100"
									autocomplete="name"
									class="p1-field mt-2 w-full rounded-xl border px-4 py-3"
								/>
							</div>
							<div>
								<label for="site-consultation-phone" class="{ct.body.labelOnLight} block text-sm"
									>Телефон</label
								>
								<input
									id="site-consultation-phone"
									type="tel"
									value={phone}
									oninput={handlePhoneInput}
									required
									autocomplete="tel"
									inputmode="tel"
									placeholder="+7 (___) ___-__-__"
									class="p1-field mt-2 w-full rounded-xl border px-4 py-3"
								/>
							</div>
						</div>
						<div>
							<label for="site-consultation-address" class="{ct.body.labelOnLight} block text-sm"
								>Адрес объекта</label
							>
							<input
								id="site-consultation-address"
								type="text"
								bind:value={objectAddress}
								required
								minlength="10"
								maxlength="500"
								autocomplete="street-address"
								placeholder="Город, улица, дом"
								class="p1-field mt-2 w-full rounded-xl border px-4 py-3"
							/>
						</div>
						<div>
							<label for="site-consultation-time" class="{ct.body.labelOnLight} block text-sm"
								>Когда удобно встретиться <span class="p1-muted font-normal">(необязательно)</span
								></label
							>
							<input
								id="site-consultation-time"
								type="text"
								bind:value={visitTime}
								maxlength="160"
								placeholder="Например, в будний день после 15:00"
								class="p1-field mt-2 w-full rounded-xl border px-4 py-3"
							/>
						</div>
						<div>
							<label for="site-consultation-message" class="{ct.body.labelOnLight} block text-sm"
								>Что хотите обсудить <span class="p1-muted font-normal">(необязательно)</span
								></label
							>
							<textarea
								id="site-consultation-message"
								bind:value={message}
								rows="3"
								maxlength="2000"
								class="p1-field mt-2 w-full rounded-xl border px-4 py-3"
							></textarea>
						</div>
						{#if errorMessage}<p role="alert" class="text-sm text-cat-6-600">{errorMessage}</p>{/if}
						<button
							type="submit"
							disabled={isSubmitting}
							data-metrika-goal="contacts_site_consultation_submit"
							data-goal-action="submit_click"
							class="{ct.btn
								.primary} w-full cursor-pointer disabled:cursor-wait disabled:opacity-65"
							>{isSubmitting ? 'Отправляем…' : 'Согласовать встречу'}</button
						>
						<p class="p1-note p1-body text-xs">
							Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
						</p>
					</form>
				{/if}
			</div>
		</div>
	</div>
</section>
