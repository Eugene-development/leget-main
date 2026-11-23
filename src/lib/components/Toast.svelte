<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';
	import { notifyError } from '$lib/utils/notify-error';
	let host: HTMLDivElement;

	$effect(() => {
		if (!toast.current || !host) return;
		const parent = host.parentNode;
		const modal = document.activeElement?.closest('dialog:modal') ??
			Array.from(document.querySelectorAll('dialog:modal')).at(-1);
		if (modal) modal.appendChild(host);
		const timer = setTimeout(() => toast.clear(), toast.current.kind === 'error' ? 12000 : 7000);
		return () => {
			clearTimeout(timer);
			if (modal) parent?.appendChild(host);
		};
	});
</script>

<svelte:window
	onerror={(event) => { if (event instanceof ErrorEvent && event.target === window) notifyError(event.error); }}
	onunhandledrejection={(event) => notifyError(event.reason)}
/>

<div
	bind:this={host}
	role="status"
	aria-live="polite"
	aria-atomic="true"
	class="pointer-events-none fixed inset-x-4 top-4 z-[10000] flex justify-center sm:inset-x-6 sm:top-6"
>
	{#if toast.current}
		<div
			class="flex max-w-md items-center gap-3 rounded-xl border border-ink-200 bg-surface-raised px-5 py-4 text-sm font-medium text-ink-900 shadow-[0_8px_30px] shadow-ink-900/15"
		>
			<svg
				class="size-5 shrink-0 text-link-600"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				{#if toast.current.kind === 'info'}
					<circle cx="12" cy="12" r="9" />
					<path d="M12 11v5M12 8h.01" />
				{:else if toast.current.kind === 'error'}
					<circle cx="12" cy="12" r="9" />
					<path d="M12 8v4m0 4h.01" />
				{:else}
					<path d="m5 12 4 4L19 6" />
				{/if}
			</svg>
			<span class="min-w-0 wrap-break-word">{toast.current.message}</span>
			{#if toast.current.kind === 'error'}
				<button type="button" class="pointer-events-auto ml-auto grid size-9 shrink-0 place-items-center rounded-md text-ink-700 hover:bg-ink-100" aria-label="Закрыть уведомление" data-goal-ignore="dismiss-notification" onclick={() => toast.clear()}>
					<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
						<path d="m6 6 12 12M18 6 6 18" />
					</svg>
				</button>
			{/if}
		</div>
	{/if}
</div>
