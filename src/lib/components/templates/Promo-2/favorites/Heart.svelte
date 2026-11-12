<script lang="ts">
	let { filled = false, class: className = 'h-5 w-5' }: { filled?: boolean; class?: string } =
		$props();
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill={filled ? 'currentColor' : 'none'}
	stroke="currentColor"
	stroke-width="1.5"
	aria-hidden="true"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
	/>
</svg>
