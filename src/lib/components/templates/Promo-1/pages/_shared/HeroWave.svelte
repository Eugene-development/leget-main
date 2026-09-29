<script lang="ts">
	let { fallback }: { fallback: string } = $props();
</script>

<!-- The next section supplies --p1-next-surface; fallback covers older page sections. -->
<div class="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
	<svg
		class="block h-16 w-full sm:h-20 lg:h-28"
		viewBox="0 0 1440 120"
		preserveAspectRatio="none"
		style="--hr-wave: {fallback}"
		xmlns="http://www.w3.org/2000/svg"
	>
		<g class="wave-bob">
			<path
				class="wave-front"
				d="M0 76C240 56 480 56 720 76C960 96 1200 96 1440 76C1680 56 1920 56 2160 76C2400 96 2640 96 2880 76V140H0Z"
			/>
		</g>
	</svg>
</div>

<style>
	.wave-front {
		fill: var(--p1-next-surface, var(--hr-wave));
		transition: fill var(--ds-motion-theme-swap) ease;
		will-change: transform;
		animation: wave-drift 26s linear infinite;
	}

	.wave-bob {
		will-change: transform;
		animation: wave-bob 9s ease-in-out infinite alternate;
	}

	@keyframes wave-drift {
		to {
			transform: translateX(-1440px);
		}
	}

	@keyframes wave-bob {
		from {
			transform: translateY(-7px);
		}
		to {
			transform: translateY(7px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wave-front {
			transition: none;
		}

		.wave-front,
		.wave-bob {
			animation: none;
			will-change: auto;
		}
	}
</style>
