<script lang="ts">
	let { active = false }: { active?: boolean } = $props();
</script>

{#if active}
	<div class="loading-progress" role="progressbar" aria-label="Загрузка содержимого">
		<span></span>
	</div>
{/if}

<style>
	.loading-progress {
		position: fixed;
		inset: 0 0 auto;
		z-index: 10000;
		height: 3px;
		overflow: hidden;
		pointer-events: none;
		background: color-mix(in srgb, var(--ds-link-500) 18%, transparent);
	}

	span {
		display: block;
		width: 40%;
		height: 100%;
		background: var(--ds-link-500);
		animation: loading-progress 1.4s ease-in-out infinite;
	}

	@keyframes loading-progress {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(350%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		span {
			width: 100%;
			animation: none;
		}
	}
</style>
