<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		label,
		children,
		onClose = () => {}
	}: {
		label: string;
		children: Snippet;
		onClose?: () => void;
	} = $props();
	let open = $state(false);
	let trigger = $state<HTMLButtonElement>();
	const id = $props.id();
	function close() {
		open = false;
		onClose();
	}
	function position(node: HTMLElement) {
		document.body.appendChild(node);
		let frame = 0;
		function update() {
			if (!trigger) return;
			const rect = trigger.getBoundingClientRect();
			node.style.left = `${Math.max(8, Math.min(rect.right - node.offsetWidth, innerWidth - node.offsetWidth - 8))}px`;
			node.style.top = `${rect.bottom + 8}px`;
			frame = requestAnimationFrame(update);
		}
		update();
		return {
			destroy() {
				cancelAnimationFrame(frame);
				node.remove();
			}
		};
	}
	function keydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !open) return;
		// Leave Escape to a modal drawer when one is open.
		if (event.target instanceof Element && event.target.closest('[role="dialog"]')) return;
		close();
		trigger?.focus({ preventScroll: true });
	}
</script>

<svelte:window onkeydown={keydown} />
<button
	bind:this={trigger}
	data-field-toolbar-anchor
	data-controls-panel={id}
	type="button"
	aria-label={`Управление компонентом: ${label}`}
	title={`Управление компонентом: ${label}`}
	aria-expanded={open}
	aria-controls={id}
	onclick={() => {
		if (open) close();
		else open = true;
	}}
	class="relative z-[190] flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-on-dark/10 bg-ink-950/75 text-on-dark shadow-lg transition-colors hover:border-on-dark/25 hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-500"
>
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path
			d="m9.5 3-.6 2.4-1.5.9-2.4-.7-2.5 4.3 1.8 1.7v1.8l-1.8 1.7L5 19.4l2.4-.7 1.5.9.6 2.4h5l.6-2.4 1.5-.9 2.4.7 2.5-4.3-1.8-1.7v-1.8l1.8-1.7L19 5.6l-2.4.7-1.5-.9L14.5 3z"
		/>
		<circle cx="12" cy="12.5" r="3" />
	</svg>
</button>
{#if open}
	<div
		use:position
		{id}
		data-component-controls-panel
		role="group"
		aria-label={`Кнопки компонента: ${label}`}
		class="fixed z-[180] flex w-max max-w-[calc(100vw-1rem)] flex-wrap items-center justify-end gap-2 rounded-xl border border-on-dark/10 bg-ink-950/95 p-2 font-sans text-on-dark shadow-2xl"
	>
		{@render children()}
	</div>
{/if}
