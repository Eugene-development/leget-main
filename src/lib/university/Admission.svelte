<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import SmartCaptcha from '$lib/components/SmartCaptcha.svelte';
	import { SITE_KEY } from '$lib/antibot/smartcaptcha.js';
	import type { ClientProfile } from '$lib/server/client-session';
	let { profile = null }: { profile?: ClientProfile | null } = $props();
	let authenticated = $state<ClientProfile | null>(null);
	const account = $derived(authenticated || profile);
	let registering = $state(page.url.searchParams.get('mode') !== 'login');
	let email = $state('');
	let password = $state('');
	let confirmation = $state('');
	let accountExists = $state(false);
	let busy = $state(false);
	let problem = $state('');
	let captchaToken = $state('');
	let captcha = $state<SmartCaptcha>();
	function resetCaptcha() {
		captchaToken = '';
		captcha?.reset();
	}
	function switchMode(register: boolean) {
		registering = register;
		password = '';
		confirmation = '';
		accountExists = false;
		problem = '';
		resetCaptcha();
	}
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		busy = true;
		problem = '';
		const payload = Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement));
		try {
			const response = await fetch(`/university/api/${registering ? 'register' : 'login'}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...payload, captcha_token: captchaToken })
			});
			const result = await response.json();
			if (result.code === 'account_exists') {
				accountExists = true;
				password = '';
				confirmation = '';
				resetCaptcha();
				return;
			}
			if (!response.ok)
				throw new Error(
					result.errors
						? Object.values(result.errors).flat().join(' ')
						: result.message || 'Не удалось войти.'
				);
			password = '';
			confirmation = '';
			if (result.user?.role === 'student' || result.user?.roles?.includes('student')) {
				await goto('/university/student', { invalidateAll: true });
			} else {
				authenticated = result.user;
				await invalidateAll();
			}
		} catch (e) {
			problem = e instanceof Error ? e.message : 'Не удалось связаться с университетом.';
			resetCaptcha();
		} finally {
			busy = false;
		}
	}
	async function enroll() {
		if (busy) return;
		busy = true;
		problem = '';
		try {
			const response = await fetch('/university/api/enroll', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '{}'
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.message || 'Не удалось подключить обучение.');
			await goto('/university/student', { invalidateAll: true });
		} catch (e) {
			problem = e instanceof Error ? e.message : 'Не удалось подключить обучение.';
		} finally {
			busy = false;
		}
	}
	async function anotherAccount() {
		busy = true;
		problem = '';
		try {
			const response = await fetch('/cabinet/session', { method: 'DELETE' });
			if (!response.ok) throw new Error('Не удалось завершить сессию. Повторите попытку.');
			authenticated = null;
			switchMode(false);
			await invalidateAll();
		} catch (e) {
			problem = e instanceof Error ? e.message : 'Не удалось сменить аккаунт.';
		} finally {
			busy = false;
		}
	}
</script>

<div class="academy-admission">
	<div>
		<h1>Ваше место<br />в университете.</h1>
		<p class="academy-lead">Начните с любопытства.<br />Остальное — по шагам.</p>
		<p>
			Все семь дисциплин, личная зачётная книжка и сертификаты о прохождении курсов — в одном
			аккаунте.
		</p>
		<a class="academy-link" href="/university">Посмотреть программу</a>
	</div>
	<section class="academy-admission-form" aria-label="Поступление">
		{#if account}
			<h2>Стать студентом</h2>
			<div class="ym-hide-content">
				<p>{account.name}</p>
				<p>{account.email}</p>
			</div>
			<p>
				Обучение добавится к вашему аккаунту. Текущая роль и доступ к другим кабинетам сохранятся.
			</p>
			{#if problem}<p role="alert" class="academy-notice">{problem}</p>{/if}
			<button
				class="academy-button"
				disabled={busy}
				onclick={enroll}
				data-metrika-goal="university_enroll_confirm"
				data-goal-action="submit_click">{busy ? 'Подключаем…' : 'Стать студентом'}</button
			>
			<button
				class="academy-link"
				disabled={busy}
				onclick={anotherAccount}
				data-goal-ignore="Смена аккаунта перед зачислением">Использовать другой аккаунт</button
			>
		{:else if accountExists}
			<h2>Аккаунт уже существует</h2>
			<p>Использовать его для обучения? Войдите с прежним паролем. Текущая роль сохранится.</p>
			<button
				class="academy-button"
				onclick={() => switchMode(false)}
				data-metrika-goal="university_existing_account_open"
				data-goal-action="open">Использовать существующий аккаунт</button
			>
			<button
				class="academy-link"
				onclick={() => {
					email = '';
					switchMode(true);
				}}
				data-goal-ignore="Исправление email регистрации">Указать другой email</button
			>
		{:else}
			<div class="academy-switch">
				<button
					type="button"
					class:active={registering}
					aria-pressed={registering}
					disabled={busy}
					onclick={() => switchMode(true)}
					data-metrika-goal="university_registration_tab"
					data-goal-action="open">Регистрация</button
				><button
					type="button"
					class:active={!registering}
					aria-pressed={!registering}
					disabled={busy}
					onclick={() => switchMode(false)}
					data-metrika-goal="university_login_tab"
					data-goal-action="open">Уже есть аккаунт</button
				>
			</div>
			<h2>{registering ? 'Стать студентом' : 'Войти в университет'}</h2>
			<form class="ym-hide-content" onsubmit={submit}>
				{#if registering}<label
						>Имя и фамилия<input
							name="name"
							autocomplete="name"
							maxlength="255"
							required
							placeholder="Для вашего сертификата"
						/></label
					>{/if}
				<label
					>Электронная почта<input
						type="email"
						name="email"
						bind:value={email}
						autocomplete="email"
						maxlength="255"
						required
						placeholder="you@example.ru"
					/></label
				>
				<div class="academy-password-fields" class:single={!registering}>
					<label
						>Пароль<input
							type="password"
							name="password"
							bind:value={password}
							autocomplete={registering ? 'new-password' : 'current-password'}
							minlength="8"
							required
						/><small>Не менее 8 символов</small></label
					>
					{#if registering}<label
							>Повторите пароль<input
								type="password"
								name="password_confirmation"
								bind:value={confirmation}
								autocomplete="new-password"
								minlength="8"
								required
							/></label
						>{/if}
				</div>
				<SmartCaptcha
					bind:this={captcha}
					onverify={(token) => (captchaToken = token)}
					onerror={() => {
						captchaToken = '';
						problem = 'Проверка безопасности недоступна. Попробуйте ещё раз.';
					}}
				/>
				{#if problem}<p role="alert" class="academy-notice">{problem}</p>{/if}
				<button
					class="academy-button"
					type="submit"
					disabled={busy || (!!SITE_KEY && !captchaToken)}
					data-metrika-goal="university_auth_submit"
					data-goal-label="Регистрация или вход студента"
					data-goal-action="submit_click"
					>{busy ? 'Подождите…' : registering ? 'Зарегистрироваться студентом' : 'Войти'}</button
				>
			</form>
		{/if}
	</section>
</div>
