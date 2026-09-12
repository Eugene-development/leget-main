<script lang="ts">
	let { target, label, onOpen }: { target: HTMLElement; label: string; onOpen: () => void } =
		$props();

	/** Портал сохраняет вёрстку img и не создаёт кнопку внутри ссылки/кнопки карточки. */
	function place(button: HTMLButtonElement) {
		document.body.appendChild(button);
		let frame = 0;
		let inViewport = true;
		const observer = new IntersectionObserver(([entry]) => {
			inViewport = entry.isIntersecting;
		});
		observer.observe(target);
		function position() {
			frame = requestAnimationFrame(position);
			if (!inViewport || !target.isConnected || document.hidden) {
				button.hidden = true;
				return;
			}
			const rect = target.getBoundingClientRect();
			let left = Math.max(rect.left, 0),
				top = Math.max(rect.top, 0);
			let right = Math.min(rect.right, window.innerWidth),
				bottom = Math.min(rect.bottom, window.innerHeight);
			let shown = rect.width > 0 && rect.height > 0;
			// Учитываем обрезку каруселей и скрытые responsive-копии логотипа.
			for (let node: HTMLElement | null = target; node; node = node.parentElement) {
				const style = getComputedStyle(node);
				if (
					style.visibility === 'hidden' ||
					style.display === 'none' ||
					Number(style.opacity) < 0.05 ||
					node.getAttribute('aria-hidden') === 'true'
				)
					shown = false;
				if (
					node !== target &&
					/(hidden|clip|auto|scroll)/.test(style.overflow + style.overflowX + style.overflowY)
				) {
					const bounds = node.getBoundingClientRect();
					left = Math.max(left, bounds.left);
					right = Math.min(right, bounds.right);
					top = Math.max(top, bounds.top);
					bottom = Math.min(bottom, bounds.bottom);
				}
			}
			button.hidden = !shown || right - left < 20 || bottom - top < 20;
			button.style.left = `${Math.max(left, right - 40)}px`;
			button.style.top = `${top + Math.min(8, Math.max(0, bottom - top - 32))}px`;
		}
		position();
		return {
			destroy() {
				cancelAnimationFrame(frame);
				observer.disconnect();
				button.remove();
			}
		};
	}
</script>

<button
	use:place
	type="button"
	hidden
	class="image-add-control"
	aria-label={`Добавить изображение по ссылке: ${label}`}
	title={`Добавить изображение по ссылке: ${label}`}
	onclick={(event) => {
		event.preventDefault();
		event.stopPropagation();
		onOpen();
	}}
>
	<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
	</svg>
</button>

<style>
	.image-add-control {
		position: fixed;
		z-index: 180;
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		cursor: pointer;
		border: 1px solid var(--color-ink-300);
		background: var(--color-surface-raised);
		color: var(--color-link-600);
		box-shadow: 0 2px 8px color-mix(in oklab, var(--color-scrim) 20%, transparent);
	}
	.image-add-control[hidden] {
		display: none;
	}
	.image-add-control:hover {
		background: var(--color-link-50);
	}
	.image-add-control:focus-visible {
		outline: 2px solid var(--color-link-600);
		outline-offset: 2px;
	}
</style>
