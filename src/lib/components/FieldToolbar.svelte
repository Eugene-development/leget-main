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
	let hasAction = $state(false);
	const actionSelector = 'button, a[href], input, select, textarea, summary, [data-goal-action]';
	const id = $props.id();

	function toggleOpen() {
		open = !open;
		if (open) document.dispatchEvent(new CustomEvent('field-toolbar-select', { detail: target }));
	}

	$effect(() => {
		const element = target;
		function update() {
			hasAction = !!element.closest(actionSelector) || !!element.querySelector(actionSelector);
		}
		update();
		const observer = new MutationObserver(update);
		observer.observe(element, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ['href', 'data-goal-action']
		});
		return () => observer.disconnect();
	});

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
		if (!hasAction) {
			element.tabIndex = element.closest('[aria-hidden="true"]') ? -1 : 0;
			element.setAttribute('role', 'button');
			element.setAttribute('aria-label', `Инструменты редактирования: ${label}`);
			element.setAttribute('aria-controls', id);
			element.setAttribute('aria-expanded', 'false');
			element.style.cursor = 'pointer';
		}

		let pendingClick: ReturnType<typeof setTimeout> | undefined;
		let pendingAction: HTMLElement | null = null;
		let focusTarget: HTMLElement = element;
		function cancelClick() {
			clearTimeout(pendingClick);
			pendingClick = undefined;
			pendingAction = null;
		}
		function edit() {
			cancelClick();
			if (!open) toggleOpen();
			requestAnimationFrame(() => panel?.querySelector<HTMLButtonElement>('button')?.focus());
		}
		function owns(event: Event) {
			return (
				event.target instanceof Element &&
				event.target.closest('[data-field-toolbar-target]') === element
			);
		}
		function toggle(event: MouseEvent) {
			if (!owns(event)) return;
			const action = (event.target as Element).closest<HTMLElement>(actionSelector);
			if (action) {
				// Keyboard/assistive activation and modified links retain native behavior.
				if (event.detail === 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
					return;
				event.preventDefault();
				event.stopImmediatePropagation();
				focusTarget = action;
				if (pendingAction === action) {
					edit();
					return;
				}
				cancelClick();
				pendingAction = action;
				// Wait for a second click before a modal can take pointer focus.
				pendingClick = setTimeout(() => {
					cancelClick();
					open = false;
					if (action.isConnected && !action.matches(':disabled') && !action.closest('[inert]'))
						action.click();
				}, 400);
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			toggleOpen();
		}
		function doubleClick(event: MouseEvent) {
			if (!owns(event) || !(event.target as Element).closest(actionSelector)) return;
			// The second click already opened the field toolbar; suppress selection/defaults.
			event.preventDefault();
			event.stopImmediatePropagation();
		}
		function keydown(event: KeyboardEvent) {
			if (!owns(event)) return;
			if (event.key === 'F2') {
				event.preventDefault();
				event.stopPropagation();
				edit();
				return;
			}
			if (hasAction || event.target !== element) return;
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				event.stopPropagation();
				toggleOpen();
				if (open)
					requestAnimationFrame(() => panel?.querySelector<HTMLButtonElement>('button')?.focus());
			}
		}
		function select(event: Event) {
			if ((event as CustomEvent).detail !== element) {
				cancelClick();
				open = false;
			}
		}
		function dismiss(event: KeyboardEvent) {
			if (event.key === 'Escape' && open) {
				open = false;
				focusTarget.focus({ preventScroll: true });
			}
		}
		element.addEventListener('click', toggle, true);
		element.addEventListener('dblclick', doubleClick, true);
		element.addEventListener('keydown', keydown);
		document.addEventListener('field-toolbar-select', select);
		document.addEventListener('keydown', dismiss);
		return () => {
			cancelClick();
			element.removeEventListener('click', toggle, true);
			element.removeEventListener('dblclick', doubleClick, true);
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
		if (!hasAction) target.setAttribute('aria-expanded', String(open));
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
