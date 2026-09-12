<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade } from 'svelte/transition';

	let {
		variant = 'picker',
		ariaLabel,
		ariaLabelledby,
		onkeydown,
		children
	}: {
		/** Picker лежит под cropper, когда второй шаг открыт поверх первого. */
		variant?: 'picker' | 'cropper';
		ariaLabel?: string;
		ariaLabelledby?: string;
		onkeydown?: (event: KeyboardEvent) => void;
		children: Snippet;
	} = $props();

	/**
	 * Все диалоги работы с изображениями живут в body: так fixed-позиционирование,
	 * фокус и слои не зависят от transform/overflow родительской панели настроек.
	 */
	function portal(node: HTMLElement) {
		const previousFocus =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		document.body.appendChild(node);
		queueMicrotask(() => node.focus());

		return {
			destroy() {
				node.parentNode?.removeChild(node);
				previousFocus?.focus();
			}
		};
	}
</script>

<div
	use:portal
	class="image-workspace-backdrop"
	data-variant={variant}
	role="dialog"
	aria-modal="true"
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	tabindex="-1"
	{onkeydown}
	transition:fade={{ duration: 200 }}
>
	{@render children()}
</div>

<style>
	.image-workspace-backdrop {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		pointer-events: auto;
		background: color-mix(in oklab, var(--color-scrim) 75%, transparent);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
	}

	.image-workspace-backdrop[data-variant='picker'] {
		z-index: 200;
	}

	.image-workspace-backdrop[data-variant='cropper'] {
		z-index: 300;
		background: color-mix(in oklab, var(--color-scrim) 70%, transparent);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
	}

	/* На desktop SideDrawer оставляет справа свой layout inset. На узких экранах
	   диалог остаётся полноэкранным: оставшейся полосы недостаточно для редактора. */
	@media (min-width: 64rem) {
		.image-workspace-backdrop {
			right: var(--side-drawer-workspace-inset, 0px);
		}
	}
</style>
