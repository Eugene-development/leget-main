<script lang="ts">
	let {
		src,
		alt = '',
		class: className = ''
	}: {
		src?: string | null;
		alt?: string;
		class?: string;
	} = $props();

	let failed = $state(false);
	const hasImage = $derived(Boolean(src?.trim()) && !failed);

	$effect(() => {
		src;
		failed = false;
	});
</script>

{#if hasImage}
	<img {src} {alt} class={className} onerror={() => (failed = true)} />
{:else}
	<!--
		Заглушка следует теме блока, а не светится собственным цветом.

		Была захардкожена `bg-slate-200` / `rgb(148 163 184/.35)` / `text-slate-400`
		— холодный светлый квадрат в любой дизайн-системе и на любой поверхности.
		Цена этого выше, чем у обычного хардкода: картинка задана примерно в
		десятке из ~226 определений блоков, то есть заглушка — типовое состояние
		шаблона, а на тёмной секции она оказывалась самым ярким пятном страницы.

		`currentColor` вместо своего цвета: заглушка берёт цвет текста родителя,
		поэтому одна разметка годится и Promo-1 с его `p1-*`, и остальным
		шаблонам — общий компонент не вправе знать про роли конкретного шаблона.

		⚠️ Отсюда контракт к вызывающему: **на обёртке должна стоять текстовая
		роль темы** (`p1-body` в Promo-1). Тема принадлежит блоку, а не системе
		и не общему компоненту, — сам он тему не знает и знать не может. Без
		роли цвет достанется от `body`, то есть тёмный на тёмной секции, и
		заглушка растворится в фоне.
	-->
	<div
		class={`ph flex items-center justify-center overflow-hidden ${className}`}
		role="img"
		aria-label={alt || 'Изображение отсутствует'}
	>
		<svg class="ph-icon h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
			<circle cx="8.5" cy="9" r="1.5" fill="currentColor" />
			<path
				d="m4 18 5-5 3.5 3.5 2.5-2.5 5 4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>

	<style>
		/* Не утилитами: `bg-current/10` рядом с `text-current/25` считается уже
		   от приглушённого currentColor и даёт 2,5% вместо 10%. Здесь три доли
		   одного цвета берутся независимо. */
		.ph {
			background-color: color-mix(in oklab, currentColor 8%, transparent);
			background-image: linear-gradient(
				135deg,
				transparent 46%,
				color-mix(in oklab, currentColor 20%, transparent) 47%,
				color-mix(in oklab, currentColor 20%, transparent) 53%,
				transparent 54%
			);
		}
		.ph-icon {
			opacity: 0.45;
		}
	</style>
{/if}
