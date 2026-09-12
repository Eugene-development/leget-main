<script lang="ts">
	let { closing = false }: { closing?: boolean } = $props();
</script>

<svg viewBox="0 0 200 150" fill="currentColor" aria-hidden="true" class:closing>
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
