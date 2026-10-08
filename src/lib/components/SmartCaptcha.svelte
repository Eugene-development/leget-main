<script lang="ts">
	import { onMount } from 'svelte';
	import { SITE_KEY, loadCaptchaScript } from '$lib/antibot/smartcaptcha.js';
	import { createCaptchaWidget, type CaptchaState } from '$lib/antibot/captcha-widget';

	let {
		onverify = () => {},
		onerror = () => {}
	}: {
		onverify?: (token: string) => void;
		onerror?: (err: unknown) => void;
	} = $props();

	let container = $state<HTMLDivElement>();
	let captchaState = $state<CaptchaState>('loading');
	let widget: ReturnType<typeof createCaptchaWidget> | undefined;

	onMount(() => {
		if (!SITE_KEY || !container) return;
		widget = createCaptchaWidget({
			container,
			sitekey: SITE_KEY,
			load: loadCaptchaScript,
			onverify: (token) => onverify(token),
			onerror: (error) => onerror(error),
			onstate: (value) => (captchaState = value)
		});
		void widget.retry();
		return () => widget?.destroy();
	});

	/** Also clears the parent's token, including when the SDK is still loading. */
	export function reset() {
		widget?.reset();
	}
</script>

{#if SITE_KEY}
	<div class="smartcaptcha">
		<div bind:this={container}></div>
		{#if captchaState === 'error'}
			<p role="alert">Не удалось загрузить проверку. Проверьте подключение и повторите попытку.</p>
			<button
				type="button"
				onclick={() => widget?.retry()}
				data-goal-ignore="Повторная загрузка капчи после сбоя, без отправки формы"
				>Повторить загрузку</button
			>
		{:else}
			<p role="status">
				{#if captchaState === 'loading'}Загружаем проверку… Поля формы уже можно заполнить.
				{:else if captchaState === 'expired'}Срок проверки истёк. Подтвердите ещё раз, что вы не
					робот.
				{:else if captchaState === 'ready'}Перед отправкой подтвердите, что вы не робот.
				{/if}
			</p>
		{/if}
	</div>
{/if}

<style>
	.smartcaptcha {
		min-height: 76px;
	}
	p {
		margin-block: 0.5rem;
		line-height: 1.5;
		color: inherit;
	}
	button {
		min-height: 44px;
		padding-inline: 0.5rem;
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.2em;
		cursor: pointer;
	}
	button:hover {
		text-decoration-thickness: 2px;
	}
	button:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
