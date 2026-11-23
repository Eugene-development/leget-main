<script lang="ts">
	let {
		name = '',
		src = null,
		class: className = '',
		eager = false
	}: {
		name?: string;
		src?: string | null;
		class?: string;
		eager?: boolean;
	} = $props();

	let failedSrc = $state<string | null>(null);
	const initials = $derived(
		name
			.trim()
			.split(/\s+/)
			.slice(0, 2)
			.map((word) => Array.from(word)[0]?.toUpperCase() ?? '')
			.join('')
	);
</script>

<div
	aria-hidden="true"
	class="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border {className}"
>
	{#if src && failedSrc !== src}
		<img
			{src}
			alt=""
			loading={eager ? 'eager' : 'lazy'}
			decoding="async"
			referrerpolicy="no-referrer"
			class="size-full object-contain p-2"
			onerror={() => (failedSrc = src)}
		/>
	{:else}
		<span class="text-base font-semibold">{initials || '—'}</span>
	{/if}
</div>
