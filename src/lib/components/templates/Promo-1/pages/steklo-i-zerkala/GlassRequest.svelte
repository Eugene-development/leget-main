<script lang="ts">
	// Артикул: 1.34.1.1 — см. docs/architecture/component-articles-map.md
	import { tick } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { cityStore } from '$lib/stores/city.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { formatPhone, isValidPhone } from '$lib/utils/phone';
	import { formHeading } from '$lib/utils/form-submission';
	import { submitServiceRequest } from '$lib/utils/service-request';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	let name = $state('');
	let phone = $state('');
	let message = $state('');
	let loading = $state(false);
	let submitted = $state(false);
	let error = $state('');
	let nameInput = $state<HTMLInputElement>(null!);
	let phoneInput = $state<HTMLInputElement>(null!);
	let success = $state<HTMLDivElement>(null!);
	let phoneError = $state('');

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'GlassRequest', updated);
		data = updated;
	}

	function handlePhone(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		phone = input.value ? formatPhone(input.value) : '';
		input.value = phone;
		phoneError = '';
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (loading) return;
		if (!name.trim()) {
			nameInput.setCustomValidity('Введите ваше имя');
			nameInput.reportValidity();
			return;
		}
		if (!isValidPhone(phone)) {
			phoneError = 'Введите номер телефона полностью';
			phoneInput.focus();
			return;
		}
		loading = true;
		error = '';
		try {
			await submitServiceRequest({
				serviceType: 'glass-mirrors',
				formId: 'promo1-glass-mirrors',
				formTitle: formHeading(event),
				name,
				phone,
				message,
				city: cityStore.city
			});
			submitted = true;
			name = '';
			phone = '';
			message = '';
			await tick();
			success?.focus();
		} catch (cause) {
			error =
				cause instanceof Error ? cause.message : 'Не удалось отправить заявку. Попробуйте ещё раз.';
		} finally {
			loading = false;
		}
	}

	async function resetForm() {
		submitted = false;
		error = '';
		phoneError = '';
		await tick();
		nameInput?.focus();
	}
</script>

<section
	class="glass-request p1-surface"
	data-p1-theme={data?.theme ?? 'light'}
	aria-labelledby="glass-title"
>
	<div class="glass-layout mx-auto max-w-7xl">
		<div class="glass-intro">
			<EditableField
				fieldKey="GlassRequest.title"
				label="Заголовок"
				value={String(data?.title ?? 'Стекло и Зеркала')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(value)}<h1 id="glass-title" class="p1-title p1-catalog-display">
						<RichText {value} />
					</h1>{/snippet}
			</EditableField>
			<EditableField
				fieldKey="GlassRequest.description"
				label="Описание"
				value={String(
					data?.description ??
						'Для мебели и интерьера. Расскажите, что вы задумали — поможем подобрать стекло или зеркало под ваш проект.'
				)}
				{isEditable}
				onSave={(v) => saveField('description', v)}
				class="mt-8 block max-w-sm"
			>
				{#snippet children(value)}<p class="p1-body text-base"><RichText {value} /></p>{/snippet}
			</EditableField>
			<div class="glass-study" aria-hidden="true"><div class="glass-sheet"></div></div>
		</div>
		<div class="glass-form">
			{#if submitted}
				<div bind:this={success} class="glass-success p1-title" tabindex="-1" role="status">
					<svg class="mb-8 h-12 w-12" viewBox="0 0 48 48" fill="none" aria-hidden="true"
						><circle cx="24" cy="24" r="23" stroke="currentColor" /><path
							d="m14 24 7 7 14-15"
							stroke="currentColor"
							stroke-width="1.5"
						/></svg
					>
					<h2 class="p1-title-sub text-3xl">Заявка принята</h2>
					<p class="p1-body mt-5 max-w-sm">
						Спасибо! Свяжемся с вами по указанному телефону и обсудим детали проекта.
					</p>
					<button
						type="button"
						class="glass-button mt-10"
						onclick={resetForm}
						data-metrika-goal="glass_mirrors_reset"
						data-goal-action="reset">Отправить ещё одну заявку</button
					>
				</div>
			{:else}
				<form onsubmit={handleSubmit} aria-busy={loading} aria-labelledby="glass-form-title">
					<EditableField
						fieldKey="GlassRequest.formTitle"
						label="Заголовок формы"
						value={String(data?.formTitle ?? 'Обсудим ваш проект')}
						{isEditable}
						onSave={(v) => saveField('formTitle', v)}
						class="block"
					>
						{#snippet children(value)}<h2
								id="glass-form-title"
								class="p1-title p1-title-sub text-3xl"
							>
								<RichText {value} />
							</h2>{/snippet}
					</EditableField>
					<p class="p1-body mt-3 text-sm">Оставьте контакты — начнём с ваших пожеланий.</p>
					<fieldset disabled={loading} class="mt-10 space-y-7">
						<legend class="sr-only">Контакты и описание проекта</legend>
						<div>
							<label for="glass-name" class="p1-title text-sm"
								>Ваше имя <span class="p1-body">*</span></label
							>
							<input
								bind:this={nameInput}
								id="glass-name"
								name="name"
								bind:value={name}
								oninput={() => nameInput.setCustomValidity('')}
								required
								maxlength="100"
								autocomplete="name"
								placeholder="Как к вам обращаться"
								class="glass-field p1-title"
							/>
						</div>
						<div>
							<label for="glass-phone" class="p1-title text-sm"
								>Телефон <span class="p1-body">*</span></label
							>
							<input
								bind:this={phoneInput}
								id="glass-phone"
								name="phone"
								value={phone}
								oninput={handlePhone}
								type="tel"
								inputmode="tel"
								autocomplete="tel"
								required
								maxlength="20"
								placeholder="+7 (___) ___-__-__"
								class="glass-field p1-title"
								aria-invalid={phoneError ? 'true' : undefined}
								aria-describedby={phoneError ? 'glass-phone-error' : undefined}
							/>
							{#if phoneError}<p id="glass-phone-error" class="p1-title mt-2 text-sm" role="alert">
									{phoneError}
								</p>{/if}
						</div>
						<div>
							<label for="glass-message" class="p1-title text-sm"
								>Что хотите сделать? <span class="p1-body">Необязательно</span></label
							>
							<textarea
								id="glass-message"
								name="message"
								bind:value={message}
								rows="3"
								maxlength="2000"
								placeholder="Например, зеркало в прихожую 800 × 1800 мм, с подсветкой"
								class="glass-field p1-title"
							></textarea>
						</div>
					</fieldset>
					{#if error}<p class="p1-title mt-6 text-sm" role="alert">{error}</p>{/if}
					<EditableField
						fieldKey="GlassRequest.buttonText"
						label="Текст кнопки"
						value={String(data?.buttonText ?? 'Отправить заявку')}
						{isEditable}
						onSave={(v) => saveField('buttonText', v)}
						class="mt-8 block"
					>
						{#snippet children(value)}
							<button
								type="submit"
								class="glass-button w-full"
								disabled={loading}
								data-metrika-goal="glass_mirrors_submit"
								data-goal-action="submit_click"
								data-goal-label="Отправить заявку — Стекло и Зеркала"
							>
								<span><RichText value={loading ? 'Отправляем…' : value} /></span>
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"
									><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" /></svg
								>
							</button>
						{/snippet}
					</EditableField>
					<p class="p1-body mt-4 text-xs">
						Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
					</p>
				</form>
			{/if}
		</div>
	</div>
</section>

<style>
	.glass-request {
		padding: clamp(2rem, 5vw, 5rem) max(1.5rem, 4vw);
	}
	.glass-layout {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: clamp(3rem, 7vw, 7rem);
	}
	.glass-intro {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.glass-form {
		min-width: 0;
		padding-top: 0.75rem;
	}
	.glass-field {
		display: block;
		width: 100%;
		margin-top: 0.5rem;
		padding: 0.75rem 0;
		background: transparent;
		border: 0;
		border-bottom: 1px solid var(--p1-border);
		border-radius: 0;
		font: inherit;
		box-shadow: none;
		caret-color: var(--p1-title);
	}
	.glass-field::placeholder {
		color: var(--p1-body);
		opacity: 1;
	}
	.glass-field:focus {
		outline: none;
		border-color: var(--p1-title);
		box-shadow: 0 1px 0 var(--p1-title);
	}
	textarea.glass-field {
		resize: vertical;
		min-height: 7rem;
	}
	.glass-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		cursor: pointer;
		border: 1px solid var(--p1-title);
		border-radius: var(--ds-radius-full);
		padding: 1.1rem 1.5rem;
		background: var(--p1-title);
		color: var(--p1-surface);
		transition:
			background var(--ds-motion-duration-ui),
			color var(--ds-motion-duration-ui);
	}
	.glass-button:hover {
		color: var(--p1-title);
		background: var(--p1-surface);
	}
	.glass-button:disabled {
		opacity: 0.6;
		cursor: wait;
	}
	.glass-request button:focus-visible {
		outline: 2px solid var(--p1-title);
		outline-offset: 5px;
	}
	.glass-success {
		padding-top: 2rem;
		outline-offset: 8px;
	}
	.glass-study {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		min-height: 15rem;
		flex: 1;
		margin-top: 3rem;
		background: var(--ds-glass-spectrum);
	}
	.glass-study::before {
		content: '';
		position: absolute;
		inset: -40%;
		background: repeating-conic-gradient(
			from 30deg at 58% 60%,
			transparent 0deg 40deg,
			var(--ds-surface-raised) 55deg 70deg,
			transparent 95deg 180deg
		);
		filter: blur(22px);
		transform: rotate(-20deg);
		opacity: 0.8;
	}
	.glass-sheet {
		position: absolute;
		inset: -25% 22%;
		transform: rotate(24deg);
		border: 1px solid var(--ds-on-dark);
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--ds-on-dark) 60%, transparent) 3%,
			transparent 8% 90%,
			var(--ds-on-dark)
		);
		backdrop-filter: blur(16px);
	}
	@media (min-width: 1000px) and (prefers-reduced-motion: no-preference) {
		.glass-sheet {
			animation: glass-light 14s ease-in-out infinite alternate;
		}
	}
	@keyframes glass-light {
		to {
			transform: translateX(12%) rotate(30deg);
		}
	}
	@media (max-width: 800px) {
		.glass-layout {
			grid-template-columns: 1fr;
			gap: 2.5rem;
		}
		.glass-study {
			min-height: 10rem;
			margin-top: 2rem;
		}
		.glass-form {
			padding-top: 0;
		}
	}
</style>
