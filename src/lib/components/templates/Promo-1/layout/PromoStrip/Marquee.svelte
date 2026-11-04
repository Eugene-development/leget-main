<script lang="ts">
	let { text }: { text: string } = $props();
	let overflowing = $state(false);
	let distance = $state(0);
	let paused = $state(false);
	let inView = $state(false);
	let pageVisible = $state(true);
	let reducedMotion = $state(false);
	const running = $derived(inView && pageVisible && !paused);
	const line = $derived(text.replace(/\s+/g, ' ').trim());

	function measure(node: HTMLElement) {
		const content = node.querySelector<HTMLElement>('[data-promo-text]')!;
		const update = () => {
			const width = content.getBoundingClientRect().width;
			overflowing = width > node.parentElement!.clientWidth + 1;
			distance = width + 48;
		};
		const resize = new ResizeObserver(update);
		resize.observe(node);
		resize.observe(node.parentElement!);
		resize.observe(content);
		const intersection = new IntersectionObserver(([entry]) => {
			inView = entry.isIntersecting;
		});
		intersection.observe(node);
		const visibility = () => (pageVisible = !document.hidden);
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const motion = () => (reducedMotion = preference.matches);
		visibility();
		motion();
		update();
		document.addEventListener('visibilitychange', visibility);
		preference.addEventListener('change', motion);
		return {
			destroy() {
				resize.disconnect();
				intersection.disconnect();
				document.removeEventListener('visibilitychange', visibility);
				preference.removeEventListener('change', motion);
			}
		};
	}
</script>

<div class="marquee flex min-w-0 flex-1 items-center gap-2">
	<!-- svelte-ignore a11y_no_noninteractive_tabindex — переполненный текст прокручивается с клавиатуры -->
	<div
		use:measure
		class="viewport min-w-0 flex-1"
		class:overflowing
		role="region"
		aria-label="Текст информационной полосы"
		tabindex={overflowing ? 0 : undefined}
	>
		<div
			class="track flex w-max items-center"
			class:moving={overflowing && !reducedMotion}
			style:--promo-distance={`${-distance}px`}
			style:--promo-duration={`${distance / 40}s`}
			style:animation-play-state={running ? 'running' : 'paused'}
		>
			<span
				data-promo-text
				class="p1-title shrink-0 text-xs font-semibold tracking-[0.02em] whitespace-nowrap"
				>{line}</span
			>
			{#if overflowing && !reducedMotion}
				<span
					aria-hidden="true"
					class="copy p1-title shrink-0 text-xs font-semibold tracking-[0.02em] whitespace-nowrap"
					>{line}</span
				>
			{/if}
		</div>
	</div>
	{#if overflowing && !reducedMotion}
		<button
			type="button"
			onclick={() => (paused = !paused)}
			data-goal-ignore="Управление движением информационной строки"
			class="p1-muted p1-accent-hover flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400"
			aria-label={paused ? 'Продолжить бегущую строку' : 'Приостановить бегущую строку'}
			aria-pressed={paused}
			title={paused ? 'Продолжить' : 'Пауза'}
		>
			<svg
				viewBox="0 0 24 24"
				class="size-3.5"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				{#if paused}<path d="m9 5 10 7-10 7z" />{:else}<path d="M8 5v14M16 5v14" />{/if}
			</svg>
		</button>
	{/if}
</div>

<style>
	.viewport {
		overflow: hidden;
	}
	.viewport:focus-visible {
		outline: 2px solid var(--p1-accent);
		outline-offset: 2px;
	}
	.copy {
		margin-left: 48px;
	}
	.moving {
		animation: promo-marquee var(--promo-duration) linear infinite;
	}
	.marquee:hover .track,
	.marquee:focus-within .track {
		animation-play-state: paused !important;
	}
	@keyframes promo-marquee {
		to {
			transform: translateX(var(--promo-distance));
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.track {
			animation: none;
		}
		.copy {
			display: none;
		}
		.viewport.overflowing {
			overflow-x: auto;
		}
	}
</style>
