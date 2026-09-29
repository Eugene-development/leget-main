<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import SmartCaptcha from '$lib/components/SmartCaptcha.svelte';
	import { SITE_KEY } from '$lib/antibot/smartcaptcha.js';
	let registering = $state(page.url.searchParams.get('mode') !== 'login');
	$effect(() => {
		if (page.url.searchParams.get('mode') === 'login') registering = false;
	});
	let busy = $state(false);
	let problem = $state('');
	let captchaToken = $state('');
	let captcha: SmartCaptcha;
	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (busy) return;
		busy = true;
		problem = '';
		const form = event.currentTarget as HTMLFormElement;
		const payload = Object.fromEntries(new FormData(form));
		try {
			const response = await fetch(`/university/api/${registering ? 'register' : 'login'}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...payload, captcha_token: captchaToken })
			});
			const result = await response.json();
			if (!response.ok) {
				const details = result.errors ? Object.values(result.errors).flat().join(' ') : '';
				throw new Error(details || result.message || 'Не удалось войти. Повторите попытку.');
			}
			if (!registering) {
				const enrollment = await fetch('/university/api/enroll', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: '{}'
				});
				const enrolled = await enrollment.json();
				if (!enrollment.ok)
					throw new Error(enrolled.message || 'Этот аккаунт не может стать студентом.');
			}
			await goto('/university/student', { invalidateAll: true });
		} catch (e) {
			problem = e instanceof Error ? e.message : 'Не удалось связаться с университетом.';
			captchaToken = '';
			captcha?.reset();
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
		<div class="academy-switch">
			<button
				type="button"
				class:active={registering}
				aria-pressed={registering}
				disabled={busy}
				onclick={() => {
					registering = true;
					problem = '';
				}}
				data-metrika-goal="university_registration_tab"
				data-goal-action="open">Регистрация</button
			><button
				type="button"
				class:active={!registering}
				aria-pressed={!registering}
				disabled={busy}
				onclick={() => {
					registering = false;
					problem = '';
				}}
				data-metrika-goal="university_login_tab"
				data-goal-action="open">Уже учусь</button
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
						autocomplete={registering ? 'new-password' : 'current-password'}
						minlength="8"
						required
					/><small>Не менее 8 символов</small></label
				>
				{#if registering}<label
						>Повторите пароль<input
							type="password"
							name="password_confirmation"
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
				>{busy ? 'Подождите…' : registering ? 'Зарегистрироваться' : 'Войти и учиться'}</button
			>
		</form>
	</section>
</div>
