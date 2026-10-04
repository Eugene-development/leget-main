<script lang="ts">
	import SmartCaptcha from '$lib/components/SmartCaptcha.svelte';
	import { SITE_KEY } from '$lib/antibot/smartcaptcha.js';
	let {
		endpoint = '/sms',
		context = 'client',
		remember = false,
		busy = $bindable(false),
		onlogin
	}: {
		endpoint?: string;
		context?: string;
		remember?: boolean;
		busy?: boolean;
		onlogin: (result: any) => void | Promise<void>;
	} = $props();
	let opened = $state(false);
	let phone = $state('');
	let code = $state('');
	let challenge = $state('');
	let testCode = $state('');
	let problem = $state('');
	let remaining = $state(0);
	let captchaToken = $state<string | null>(null);
	let captcha = $state<{ reset: () => void }>();
	const uid = $props.id();
	$effect(() => {
		if (!remaining) return;
		const timer = setTimeout(() => (remaining = Math.max(0, remaining - 1)), 1000);
		return () => clearTimeout(timer);
	});
	function reset() {
		challenge = '';
		code = '';
		testCode = '';
		problem = '';
		captchaToken = null;
		captcha?.reset();
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		if (!challenge && SITE_KEY && !captchaToken) {
			problem = 'Подтвердите, что вы не робот.';
			return;
		}
		busy = true;
		problem = '';
		try {
			const response = await fetch(`${endpoint}/${challenge ? 'verify' : 'request'}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify({
					phone,
					context,
					remember,
					code,
					challenge_id: challenge,
					captcha_token: captchaToken
				})
			});
			const result = await response.json();
			if (!response.ok || !result.success)
				throw new Error(
					result.errors
						? Object.values(result.errors).flat().join(' ')
						: result.message || 'Не удалось войти.'
				);
			if (challenge) {
				reset();
				await onlogin(result);
			} else {
				challenge = result.challenge_id;
				testCode = result.test_code || '';
				remaining = result.retry_after || 60;
			}
		} catch (error) {
			problem = error instanceof Error ? error.message : 'Сеть недоступна. Повторите попытку.';
		} finally {
			busy = false;
			captchaToken = null;
			captcha?.reset();
		}
	}
</script>

<div class="sms-login">
	<button
		type="button"
		onclick={() => {
			opened = !opened;
			reset();
		}}
		disabled={busy}
		data-metrika-goal="sms_login_toggle"
		data-goal-action="open"
		aria-expanded={opened}
	>
		{opened ? 'Скрыть вход по SMS' : 'Войти по SMS'}
	</button>
	{#if opened}
		<form class="ym-hide-content" onsubmit={submit}>
			<p>Введите телефон, сохранённый в вашем аккаунте. Вход по паролю остаётся доступен.</p>
			<label for={`${uid}-phone`}>Телефон с кодом страны</label>
			<input
				id={`${uid}-phone`}
				type="tel"
				autocomplete="tel"
				bind:value={phone}
				required
				maxlength="30"
				readonly={!!challenge}
				placeholder="+7 999 123-45-67"
			/>
			{#if challenge}
				<p>Код действует 5 минут.</p>
				{#if testCode}<p role="status">
						Тестовый режим: SMS не отправлено. Код: <strong>{testCode}</strong>
					</p>{/if}
				<label for={`${uid}-code`}>Код из SMS</label>
				<input
					id={`${uid}-code`}
					type="text"
					inputmode="numeric"
					autocomplete="one-time-code"
					bind:value={code}
					required
					pattern="[0-9]{6}"
					minlength="6"
					maxlength="6"
				/>
			{:else if SITE_KEY}
				<SmartCaptcha
					bind:this={captcha}
					onverify={(token: string) => (captchaToken = token)}
					onerror={() => (captchaToken = null)}
				/>
			{/if}
			{#if problem}<p role="alert">{problem}</p>{/if}
			<button
				type="submit"
				disabled={busy || (!challenge && remaining > 0)}
				data-goal-label="Получить код / подтвердить вход по SMS"
				data-metrika-goal="sms_login_submit"
				data-goal-action="submit_click"
			>
				{busy
					? 'Подождите…'
					: challenge
						? 'Подтвердить и войти'
						: remaining
							? `Новый код через ${remaining} с`
							: 'Получить код'}
			</button>
			{#if challenge}
				<button
					type="button"
					onclick={reset}
					disabled={busy}
					data-goal-ignore="Изменение номера или подготовка повторного запроса SMS"
				>
					{remaining
						? `Изменить номер · повтор через ${remaining} с`
						: 'Изменить номер / запросить новый код'}
				</button>
			{/if}
		</form>
	{/if}
</div>

<style>
	.sms-login {
		margin-block: 1.5rem;
		color: inherit;
	}
	form {
		display: grid;
		gap: 0.75rem;
		margin-top: 1rem;
	}
	p {
		font-size: 0.875rem;
		line-height: 1.5;
	}
	input {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid currentColor;
		border-radius: 0.5rem;
		background: transparent;
		color: inherit;
	}
	button {
		padding: 0.65rem 1rem;
		border: 1px solid currentColor;
		border-radius: 0.5rem;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: wait;
	}
	input:focus-visible,
	button:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 3px;
	}
</style>
