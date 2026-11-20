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
		const content = node.firstElementChild as HTMLElement;
		const upper = content.firstElementChild as HTMLElement;
		const root = document.documentElement;
		const previousOverlay = root.style.getPropertyValue('--chrome-overlay');
		let revealed = true;
		let lastScrollY = 0;
		let frame = 0;
		let motionFrame = 0;
		// Те же пороги, что у Header Promo-2: не меняем направление перехода
		// от небольшого движения тачпада или инерции прокрутки.
		const HIDE_THRESHOLD = 60;
		const SHOW_THRESHOLD = 40;

		function update() {
			frame = 0;
			const y = Math.max(0, Math.min(window.scrollY, root.scrollHeight - window.innerHeight));
			if (y <= 50) {
				revealed = true;
			} else if (y > lastScrollY + HIDE_THRESHOLD) {
				revealed = false;
				lastScrollY = y;
			} else if (y < lastScrollY - SHOW_THRESHOLD) {
				revealed = true;
				lastScrollY = y;
			}
			position();
		}

		function position() {
			// Как в Promo-2: sticky всегда привязан к top: 0, а transform
			// поднимает шапку ровно на высоту верхних полос, оставляя меню видимым.
			const height = upper.getBoundingClientRect().height;
			content.style.setProperty('--scroll-chrome-offset', revealed ? '0px' : `${-height}px`);
			measure();
		}

		function measure() {
			root.style.setProperty(
				'--chrome-overlay',
				`${Math.max(0, content.getBoundingClientRect().bottom)}px`
			);
			node.dispatchEvent(new Event('scroll-chrome-position'));
		}

		function trackMotion(event: TransitionEvent) {
			if (event.target !== content || event.propertyName !== 'transform') return;
			if (motionFrame) cancelAnimationFrame(motionFrame);
			const sample = () => {
				measure();
				motionFrame = requestAnimationFrame(sample);
			};
			motionFrame = requestAnimationFrame(sample);
		}

		function finishMotion(event: TransitionEvent) {
			if (event.target !== content || event.propertyName !== 'transform') return;
			if (motionFrame) cancelAnimationFrame(motionFrame);
			motionFrame = 0;
			measure();
		}

		function schedule() {
			if (!frame) frame = requestAnimationFrame(update);
		}

		function revealForFocus() {
			revealed = true;
			lastScrollY = Math.max(0, window.scrollY);
			position();
		}

		// Первичный замер выполняем без анимации, затем включаем переходы.
		content.style.transition = 'none';
		position();
		// Фиксируем начальное значение до включения переходов.
		getComputedStyle(content).transform;
		content.style.removeProperty('transition');
		node.addEventListener('transitionrun', trackMotion);
		node.addEventListener('transitionend', finishMotion);
		node.addEventListener('transitioncancel', finishMotion);
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
				node.removeEventListener('transitionrun', trackMotion);
				node.removeEventListener('transitionend', finishMotion);
				node.removeEventListener('transitioncancel', finishMotion);
				if (frame) cancelAnimationFrame(frame);
				if (motionFrame) cancelAnimationFrame(motionFrame);
				if (previousOverlay) root.style.setProperty('--chrome-overlay', previousOverlay);
				else root.style.removeProperty('--chrome-overlay');
			}
		};
	}
</script>

{#if enabled}
	<div class="scroll-chrome" data-scroll-chrome use:followScroll>
		<div class="scroll-chrome-content">
			<div>
				{@render above()}
			</div>
			{@render children()}
		</div>
	</div>
{:else}
	{@render above()}
	{@render children()}
{/if}

<style>
	.scroll-chrome {
		position: sticky;
		top: 0;
		z-index: 150;
	}

	.scroll-chrome-content {
		position: relative;
		transform: translateY(var(--scroll-chrome-offset, 0px));
	}

	@media (prefers-reduced-motion: no-preference) {
		.scroll-chrome-content {
			transition: transform var(--ds-motion-duration-ui-slow) var(--ds-motion-ease-ui);
		}
	}
</style>
