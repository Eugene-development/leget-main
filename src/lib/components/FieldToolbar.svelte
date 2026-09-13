<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		target,
		label,
		children
	}: {
		target: HTMLElement;
		label: string;
		children: Snippet;
	} = $props();
	let open = $state(false);
	let panel = $state<HTMLElement>();
	const id = $props.id();

	function portal(node: HTMLElement) {
		const scope =
			target.closest<HTMLElement>('[data-field-toolbar-scope]') ??
			target.closest<HTMLElement>('header, footer, section, aside, [role="dialog"]') ??
			target.parentElement;
		document.body.appendChild(node);
		let frame = 0;
		function position() {
			if (!scope) return;
			// The portal escapes clipping, transforms and dimming of the content,
			// but follows the component's controls when the page scrolls.
			const anchor = [...scope.querySelectorAll<HTMLElement>('[data-field-toolbar-anchor]')].find(
				(item) => item.getClientRects().length && getComputedStyle(item).visibility !== 'hidden'
			);
			const controls = anchor?.dataset.controlsPanel
				? document.getElementById(anchor.dataset.controlsPanel)
				: null;
			const rect = (controls ?? anchor ?? scope).getBoundingClientRect();
			const right = anchor ? rect.right : rect.right - 16;
			node.style.left = `${Math.max(8, Math.min(right - node.offsetWidth, window.innerWidth - node.offsetWidth - 8))}px`;
			node.style.top = `${anchor ? rect.bottom + 12 : rect.top + 16}px`;
			frame = requestAnimationFrame(position);
		}
		position();
		return {
			destroy() {
				cancelAnimationFrame(frame);
				node.remove();
			}
		};
	}

	$effect(() => {
		const element = target;
		const attributes = [
			'tabindex',
			'role',
			'aria-label',
			'aria-expanded',
			'aria-controls',
			'data-field-toolbar-target'
		];
		const original = attributes.map((name) => [name, element.getAttribute(name)] as const);
		const originalCursor = element.style.cursor;
		element.setAttribute('data-field-toolbar-target', '');
		element.tabIndex = element.closest('[aria-hidden="true"]') ? -1 : 0;
		element.setAttribute('role', 'button');
		element.setAttribute('aria-label', `Инструменты редактирования: ${label}`);
		element.setAttribute('aria-controls', id);
		element.setAttribute('aria-expanded', 'false');
		element.style.cursor = 'pointer';

		function toggle(event: Event) {
			// Select the innermost editable field; editing a linked label must not navigate.
			if (
				event.target instanceof Element &&
				event.target.closest('[data-field-toolbar-target]') !== element
			)
				return;
			event.preventDefault();
			event.stopPropagation();
			open = !open;
			if (open)
				document.dispatchEvent(new CustomEvent('field-toolbar-select', { detail: element }));
		}
		function keydown(event: KeyboardEvent) {
			if (event.target !== element) return;
			if (event.key === 'Enter' || event.key === ' ') {
				toggle(event);
				if (open)
					requestAnimationFrame(() => panel?.querySelector<HTMLButtonElement>('button')?.focus());
			}
		}
		function select(event: Event) {
			if ((event as CustomEvent).detail !== element) open = false;
		}
		function dismiss(event: KeyboardEvent) {
			if (event.key === 'Escape' && open) {
				open = false;
				element.focus({ preventScroll: true });
			}
		}
		element.addEventListener('click', toggle, true);
		element.addEventListener('keydown', keydown);
		document.addEventListener('field-toolbar-select', select);
		document.addEventListener('keydown', dismiss);
		return () => {
			element.removeEventListener('click', toggle, true);
			element.removeEventListener('keydown', keydown);
			document.removeEventListener('field-toolbar-select', select);
			document.removeEventListener('keydown', dismiss);
			for (const [name, value] of original) {
				if (value === null) element.removeAttribute(name);
				else element.setAttribute(name, value);
			}
			element.style.cursor = originalCursor;
		};
	});
	$effect(() => {
		target.setAttribute('aria-expanded', String(open));
	});
</script>

{#if open}
	<div
		use:portal
		bind:this={panel}
		{id}
		role="group"
		aria-label={`Инструменты редактирования: ${label}`}
		class="field-toolbar fixed z-[180] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-on-dark/10 bg-ink-950/75 px-3 py-2 font-sans text-on-dark shadow-2xl backdrop-blur-xl"
	>
		<span class="max-w-48 truncate text-sm">{label}</span>
		{@render children()}
	</div>
{/if}

<style>
	.field-toolbar :global(button:not([role='switch'])) {
		min-width: 32px;
		min-height: 32px;
	}
</style>
