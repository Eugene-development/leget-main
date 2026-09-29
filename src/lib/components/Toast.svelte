<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';

	$effect(() => {
		if (!toast.current) return;
		const timer = setTimeout(() => toast.clear(), 7000);
		return () => clearTimeout(timer);
	});
</script>

<div
	role="status"
	aria-live="polite"
	aria-atomic="true"
	class="pointer-events-none fixed inset-x-4 top-4 z-[300] flex justify-center sm:inset-x-6 sm:top-6"
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
				{:else}
					<path d="m5 12 4 4L19 6" />
				{/if}
			</svg>
			{toast.current.message}
		</div>
	{/if}
</div>
