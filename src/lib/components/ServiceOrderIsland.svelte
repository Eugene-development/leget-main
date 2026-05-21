<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import { getGraphQLUrl, getAuthApiUrl } from '$lib/utils/config';
	import PhoneInput from './PhoneInput.svelte';
	import { isValidPhone, cleanPhone } from '$lib/utils/phone';

	let name = $state('');
	let phone = $state('');
	let message = $state('');
	let errors = $state({ name: '', phone: '' });
	let isSubmitting = $state(false);
	let submitSuccess = $state(false);
	let generalError = $state('');

	function validate() {
		errors = { name: '', phone: '' };
		let valid = true;

		if (!name.trim()) {
			errors.name = 'Пожалуйста, введите ваше имя';
			valid = false;
		}

		if (!phone.trim()) {
			errors.phone = 'Пожалуйста, введите ваш телефон';
			valid = false;
		} else if (!isValidPhone(phone)) {
			errors.phone = 'Пожалуйста, введите корректный номер телефона';
			valid = false;
		}

		return valid;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!validate()) return;

		isSubmitting = true;
		generalError = '';

		const payload = {
			service_type: serviceOrderStore.serviceType,
			name: name.trim(),
			phone: cleanPhone(phone),
			message: message.trim() || null,
			source_url: typeof window !== 'undefined' ? window.location.href : null,
			city: cityStore.city
		};

		try {
			// 1. Submit mutation to leget-api (GraphQL)
			const graphqlResponse = await fetch(getGraphQLUrl(), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: `
						mutation CreateServiceRequest($input: CreateServiceRequestInput!) {
							createServiceRequest(input: $input) {
								id
								status
							}
						}
					`,
					variables: { input: payload }
				})
			});

			const graphqlResult = await graphqlResponse.json();
			if (graphqlResult.errors) {
				throw new Error(graphqlResult.errors[0]?.message || 'Ошибка сохранения заявки');
			}

			// 2. Submit notification to leget-auth (REST)
			const authResponse = await fetch(`${getAuthApiUrl()}/notify/service-request`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			const authResult = await authResponse.json();
			if (!authResponse.ok) {
				throw new Error(authResult.message || 'Ошибка отправки уведомления');
			}

			submitSuccess = true;
			name = '';
			phone = '';
			message = '';
		} catch (err) {
			console.error('Service request submission error:', err);
			generalError = err instanceof Error ? err.message : 'Произошла непредвиденная ошибка';
		} finally {
			isSubmitting = false;
		}
	}

	function handleClose() {
		serviceOrderStore.close();
		submitSuccess = false;
		generalError = '';
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) handleClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && serviceOrderStore.isOpen) handleClose();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if serviceOrderStore.isOpen}
	<!-- Overlay Backdrop -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm overflow-hidden"
		onclick={handleBackdropClick}
		transition:fade={{ duration: 300 }}
	>
		<!-- Slide-out Drawer Panel -->
		<div
			class="relative w-full max-w-lg h-full bg-slate-900/95 border-l border-slate-800 p-8 md:p-10 shadow-2xl flex flex-col justify-between overflow-y-auto overflow-x-hidden"
			role="dialog"
			aria-modal="true"
			aria-labelledby="drawer-title"
			transition:fly={{ x: 200, duration: 400, easing: cubicOut }}
		>
			<!-- Decorative Background Glow -->
			<div class="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
			<div class="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

			<div class="relative z-10">
				<!-- Header -->
				<div class="flex items-center justify-between mb-10">
					<h2 id="drawer-title" class="text-2xl font-bold tracking-tight text-white sm:text-3xl">
						{serviceOrderStore.title}
					</h2>
					<button
						type="button"
						onclick={handleClose}
						class="rounded-full p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition duration-300 border border-slate-700/50 cursor-pointer"
						aria-label="Закрыть"
					>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{#if submitSuccess}
					<!-- Success Message Panel -->
					<div 
						class="flex flex-col items-center text-center py-12 px-4 rounded-3xl bg-slate-800/30 border border-slate-700/40"
						in:fly={{ y: 20, duration: 500, easing: cubicOut }}
					>
						<div class="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h3 class="text-xl font-bold text-white mb-3">Заявка успешно отправлена!</h3>
						<p class="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
							Спасибо за обращение. Наш специалист свяжется с вами в течение 15 минут для уточнения деталей.
						</p>
						<button
							type="button"
							onclick={handleClose}
							class="rounded-full bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 text-base font-bold transition duration-300 border border-slate-700/80 w-full cursor-pointer"
						>
							Отлично
						</button>
					</div>
				{:else}
					<!-- Form -->
					<form onsubmit={handleSubmit} class="space-y-6" novalidate>
						<!-- Name -->
						<div class="flex flex-col gap-1.5">
							<label for="client-name" class="text-sm font-semibold text-slate-300">
								Ваше имя <span class="text-red-400">*</span>
							</label>
							<input
								id="client-name"
								type="text"
								bind:value={name}
								class="w-full rounded-xl border bg-slate-900/60 border-slate-700/80 px-4 py-3.5 text-base text-white placeholder-slate-500 transition duration-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
								class:border-red-400={errors.name}
								placeholder="Иван Иванов"
							/>
							{#if errors.name}
								<span class="text-xs font-medium text-red-400 mt-1">{errors.name}</span>
							{/if}
						</div>

						<!-- Phone (custom masked component) -->
						<PhoneInput bind:value={phone} error={errors.phone} />

						<!-- Message -->
						<div class="flex flex-col gap-1.5">
							<label for="client-message" class="text-sm font-semibold text-slate-300">
								Сообщение или пожелания
							</label>
							<textarea
								id="client-message"
								rows="4"
								bind:value={message}
								class="w-full rounded-xl border bg-slate-900/60 border-slate-700/80 px-4 py-3.5 text-base text-white placeholder-slate-500 transition duration-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none resize-none"
								placeholder="Расскажите немного о вашем проекте или задайте вопрос..."
							></textarea>
						</div>

						<!-- City and URL context (Read-only badge info for premium feeling) -->
						<div class="flex flex-wrap items-center gap-2 pt-2">
							<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs font-medium">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
								Регион: {cityStore.city}
							</span>
						</div>

						{#if generalError}
							<div class="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3.5 text-sm text-red-400">
								{generalError}
							</div>
						{/if}

						<button
							type="submit"
							disabled={isSubmitting}
							class="w-full mt-8 group relative inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-sky-500/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-sky-500/40 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
						>
							{#if isSubmitting}
								<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
									<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
									<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								Отправка...
							{:else}
								<span>Отправить заявку</span>
								<svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
									<path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							{/if}
						</button>
					</form>
				{/if}
			</div>

			<div class="relative z-10 pt-10 text-center text-xs text-slate-500">
				Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
			</div>
		</div>
	</div>
{/if}
