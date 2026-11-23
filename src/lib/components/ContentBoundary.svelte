<script lang="ts">
	import type { Snippet } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { notifyError } from '$lib/utils/notify-error';

	let { children, message, resetOnNavigation = false }: {
		children: Snippet;
		message: string;
		resetOnNavigation?: boolean;
	} = $props();
	let reset: (() => void) | undefined;

	function retry() {
		const restart = reset;
		reset = undefined;
		restart?.();
	}

	afterNavigate(({ from }) => {
		if (resetOnNavigation && from) retry();
	});
</script>

<svelte:boundary onerror={(error, restart) => {
	reset = restart;
	console.error(error);
	notifyError(error, message);
}}>
	{@render children()}
	{#snippet failed()}
		<div class="mx-auto max-w-xl px-4 py-6 text-center text-ink-900">
			<p>{message}</p>
			<button
				type="button"
				class="mt-2 min-h-11 px-3 text-link-700 underline"
				data-goal-ignore="error-recovery"
				onclick={retry}>Повторить загрузку</button
			>
		</div>
	{/snippet}
</svelte:boundary>
