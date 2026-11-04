<script lang="ts">
	import { tick } from 'svelte';
	import { actionIcons, matchingActionIcons } from './actionIcons';
	import { richTextToPlainText } from '$lib/utils/rich-text';

	let {
		value,
		label,
		isEditable = false,
		disabled = false,
		accent = 'brand',
		onSave
	}: {
		value: string;
		label: string;
		isEditable?: boolean;
		disabled?: boolean;
		accent?: 'brand' | 'company';
		onSave: (path: string) => Promise<void>;
	} = $props();

	const id = $props.id();
	let panel = $state<HTMLDivElement>();
	let trigger = $state<HTMLButtonElement>();
	let search = $state<HTMLInputElement>();
	let query = $state('');
	let open = $state(false);
	let pending = $state(false);
	let error = $state('');
	const icons = $derived(matchingActionIcons(query));
	const selected = $derived(actionIcons.find((icon) => icon.path === value));
	const accessibleLabel = $derived(`Изменить значок: ${richTextToPlainText(label)}`);
	const iconClass = $derived(
		`flex size-14 items-center justify-center rounded-2xl text-on-accent shadow-lg ${accent === 'brand' ? 'bg-brand-500 shadow-brand-500/30' : 'bg-cat-1-500 shadow-cat-1-500/30'}`
	);

	function position() {
		if (!panel || !trigger || !panel.matches(':popover-open')) return;
		const rect = trigger.getBoundingClientRect();
		if (rect.bottom < 0 || rect.top > innerHeight) {
			panel.hidePopover();
			return;
		}
		const width = panel.offsetWidth;
		const height = panel.offsetHeight;
		panel.style.left = `${Math.max(16, Math.min(rect.left, innerWidth - width - 16))}px`;
		const below = rect.bottom + 8;
		const top = below + height <= innerHeight - 16 ? below : rect.top - height - 8;
		panel.style.top = `${Math.max(16, Math.min(top, innerHeight - height - 16))}px`;
	}

	function observePopover(node: HTMLDivElement) {
		let frame = 0;
		function sync() {
			open = node.matches(':popover-open');
			cancelAnimationFrame(frame);
			if (open) {
				frame = requestAnimationFrame(() => {
					position();
					search?.focus({ preventScroll: true });
				});
			} else {
				query = '';
				error = '';
			}
		}
		// A native invoker can open the SSR panel before hydration finishes.
		// Read its current state as well as listening for subsequent toggles.
		node.addEventListener('toggle', sync);
		sync();
		return {
			destroy() {
				cancelAnimationFrame(frame);
				node.removeEventListener('toggle', sync);
			}
		};
	}

	function close() {
		panel?.hidePopover();
		trigger?.focus({ preventScroll: true });
	}

	async function choose(path: string) {
		if (pending || disabled) return;
		if (path === value) {
			close();
			return;
		}
		pending = true;
		error = '';
		try {
			await onSave(path);
			pending = false;
			await tick();
			close();
		} catch {
			error = 'Не удалось сохранить значок. Повторите выбор.';
		} finally {
			pending = false;
		}
	}

	$effect(() => {
		if (open) {
			// Filtering changes the panel height; keep it within the viewport.
			icons.length;
			requestAnimationFrame(position);
		}
	});
</script>

<svelte:window onresize={position} onscroll={position} />

{#snippet icon(path: string)}
	<svg
		class="size-7"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		stroke-width="1.5"
		aria-hidden="true"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d={path} />
	</svg>
{/snippet}

{#if isEditable}
	<button
		type="button"
		bind:this={trigger}
		class="{iconClass} icon-trigger relative cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-link-600 disabled:cursor-wait"
		disabled={disabled || pending}
		aria-label={accessibleLabel}
		title={accessibleLabel}
		aria-haspopup="dialog"
		aria-expanded={open}
		popovertarget={id}
		data-goal-ignore="Выбор значка карточки акции в редакторе сайта"
	>
		{@render icon(value)}
		<span
			class="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-surface-raised text-link-700 ring-1 ring-ink-200"
			aria-hidden="true"
		>
			<svg class="size-3" viewBox="0 0 20 20" fill="currentColor"
				><path
					d="M13.6 3.6a2 2 0 0 1 2.8 2.8l-.8.8-2.8-2.8.8-.8ZM11.4 5.8 3 14.2V17h2.8l8.4-8.4-2.8-2.8Z"
				/></svg
			>
		</span>
	</button>
	<div
		bind:this={panel}
		{id}
		popover="auto"
		role="dialog"
		aria-label="Коллекция значков акций"
		use:observePopover
		class="icon-panel"
	>
		<div class="mb-4 flex items-start justify-between gap-4">
			<div>
				<h3 class="text-base font-semibold">Значок акции</h3>
				<p class="mt-1 text-sm text-ink-500">
					{selected ? `Выбран: ${selected.label}` : 'Выберите из коллекции'}
				</p>
			</div>
			<button
				type="button"
				class="close-button"
				onclick={close}
				aria-label="Закрыть коллекцию значков"
				data-goal-ignore="Закрытие коллекции значков редактора"
				><svg
					class="size-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					aria-hidden="true"><path stroke-linecap="round" d="m6 6 12 12M18 6 6 18" /></svg
				></button
			>
		</div>
		<label class="mb-4 block text-sm">
			<span class="mb-1.5 block">Поиск значка</span>
			<input
				bind:this={search}
				bind:value={query}
				type="search"
				placeholder="Например, подарок"
				class="w-full rounded-lg border border-ink-300 bg-surface-raised px-3 py-2 text-ink-900 outline-link-600"
			/>
		</label>
		<div class="grid grid-cols-4 gap-2" aria-label="Готовые значки">
			{#each icons as item (item.id)}
				<button
					type="button"
					class="icon-option"
					class:selected={item.path === value}
					aria-pressed={item.path === value}
					title={item.label}
					disabled={pending || disabled}
					onclick={() => choose(item.path)}
					data-goal-ignore="Сохранение значка карточки акции в редакторе сайта"
				>
					{@render icon(item.path)}<span class="w-full truncate text-xs">{item.label}</span>
				</button>
			{/each}
		</div>
		{#if icons.length === 0}<p class="py-6 text-sm text-ink-600" role="status">
				Значки не найдены. Попробуйте другое слово.
			</p>{/if}
		{#if pending}<p class="mt-3 text-sm" role="status">Сохраняем значок…</p>{/if}
		{#if error}<p class="mt-3 text-sm text-brand-700" role="alert">{error}</p>{/if}
	</div>
	{#if error && !open}<p class="p1-body mt-2 text-sm" role="alert">{error}</p>{/if}
{:else}
	<div class={iconClass}>{@render icon(value)}</div>
{/if}

<style>
	.icon-panel {
		position: fixed;
		inset: auto;
		margin: 0;
		width: min(26rem, calc(100vw - 2rem));
		max-height: min(36rem, calc(100dvh - 2rem));
		overflow-y: auto;
		padding: 1rem;
		border: 1px solid var(--ds-ink-200);
		border-radius: var(--ds-radius-xl);
		background: var(--ds-surface-raised);
		color: var(--ds-ink-900);
		box-shadow: 0 12px 40px color-mix(in srgb, var(--ds-scrim), transparent 80%);
		font-family: var(--ds-font-body);
	}
	.icon-option {
		display: flex;
		min-width: 0;
		min-height: 4.5rem;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem;
		border: 1px solid var(--ds-ink-200);
		border-radius: var(--ds-radius-lg);
		cursor: pointer;
	}
	.icon-option:hover:not(:disabled),
	.icon-option.selected {
		border-color: var(--ds-link-600);
		background: var(--ds-link-50);
		color: var(--ds-link-700);
	}
	.icon-option:focus-visible,
	.close-button:focus-visible {
		outline: 2px solid var(--ds-link-600);
		outline-offset: 2px;
	}
	.icon-option:disabled {
		opacity: 0.5;
		cursor: wait;
	}
	.close-button {
		display: flex;
		flex-shrink: 0;
		width: 2.75rem;
		height: 2.75rem;
		align-items: center;
		justify-content: center;
		border-radius: var(--ds-radius-lg);
		font-size: 1.5rem;
		cursor: pointer;
	}
	.close-button:hover {
		background: var(--ds-ink-100);
	}
</style>
