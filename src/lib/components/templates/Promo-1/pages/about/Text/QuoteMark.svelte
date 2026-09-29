<script lang="ts">
	let { closing = false, gradientId }: { closing?: boolean; gradientId?: string } = $props();
</script>

<svg
	viewBox="0 0 200 150"
	fill={gradientId ? `url(#${gradientId})` : 'currentColor'}
	aria-hidden="true"
	class:closing
>
	{#if gradientId}
		<defs>
			<linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0%" stop-color="var(--color-ink-900)" />
				<stop offset="50%" stop-color="var(--color-ink-800)" />
				<stop offset="100%" stop-color="var(--color-brand-900)" />
			</linearGradient>
		</defs>
	{/if}
	<path d="M39 0H91L64 70H91V150H0V76L39 0ZM148 0H200L173 70H200V150H109V76L148 0Z" />
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: 100%;
	}
	.closing {
		transform: rotate(180deg);
	}
</style>
