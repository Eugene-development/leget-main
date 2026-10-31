<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		enabled,
		above,
		children
	}: {
		enabled: boolean;
		above: Snippet;
		children: Snippet;
	} = $props();

	function followScroll(node: HTMLElement) {
		const upper = node.firstElementChild as HTMLElement;
		const root = document.documentElement;
		const previousOverlay = root.style.getPropertyValue('--chrome-overlay');
		let revealed = false;
		let previousY = Math.max(0, window.scrollY);
		let travel = 0;
		let frame = 0;

		function update() {
			frame = 0;
			const y = Math.max(0, Math.min(window.scrollY, root.scrollHeight - window.innerHeight));
			const delta = y - previousY;
			previousY = y;
			// Не переключаем шапку от мелкого дрожания тачпада или упругого скролла.
			if (delta !== 0) {
				travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
				if (Math.abs(travel) >= 8) {
					revealed = travel < 0;
					travel = 0;
				}
			}
			if (y === 0) revealed = false;
			position();
		}

		function position() {
			// Общая sticky-обёртка сохраняет место в потоке. Отрицательный top
			// прячет только верхние полосы, оставляя строку меню у края окна.
			node.style.top = revealed ? '0px' : `${-upper.offsetHeight}px`;
			root.style.setProperty(
				'--chrome-overlay',
				`${Math.max(0, node.getBoundingClientRect().bottom)}px`
			);
		}

		function schedule() {
			if (!frame) frame = requestAnimationFrame(update);
		}

		function revealForFocus() {
			revealed = true;
			travel = 0;
			position();
		}

		position();
		const observer = new ResizeObserver(schedule);
		observer.observe(node);
		observer.observe(upper);
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		upper.addEventListener('focusin', revealForFocus);

		return {
			destroy() {
				observer.disconnect();
				window.removeEventListener('scroll', schedule);
				window.removeEventListener('resize', schedule);
				upper.removeEventListener('focusin', revealForFocus);
				if (frame) cancelAnimationFrame(frame);
				if (previousOverlay) root.style.setProperty('--chrome-overlay', previousOverlay);
				else root.style.removeProperty('--chrome-overlay');
			}
		};
	}
</script>

{#if enabled}
	<div class="scroll-chrome" use:followScroll>
		<div>
			{@render above()}
		</div>
		{@render children()}
	</div>
{:else}
	{@render above()}
	{@render children()}
{/if}

<style>
	.scroll-chrome {
		position: sticky;
		top: calc(-1 * (var(--promo-h, 0px) + var(--banner-h, 0px)));
		z-index: 150;
	}
</style>
