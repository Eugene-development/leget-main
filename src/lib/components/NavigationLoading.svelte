<script lang="ts">
	let {
		workspace = false,
		intro = true,
		label = 'Загрузка страницы…'
	}: { workspace?: boolean; intro?: boolean; label?: string } = $props();
</script>

<div class="navigation-loading" class:workspace aria-busy="true" data-navigation-loading>
	<p class="sr-only" role="status">{label}</p>
	<div class="skeleton" aria-hidden="true">
		<div class="skeleton-body">
			{#if intro}
				<div class="placeholder breadcrumb"></div>
				<div class="skeleton-intro">
					<div class="skeleton-copy">
						<div class="placeholder title"></div>
						<div class="placeholder title short"></div>
						<div class="skeleton-lines">
							<div class="placeholder line"></div>
							<div class="placeholder line"></div>
							<div class="placeholder line short"></div>
						</div>
					</div>
					{#if !workspace}<div class="placeholder media"></div>{/if}
				</div>
			{/if}
			<div class="skeleton-grid" class:content-only={!intro}>
				{#each Array(3) as _}
					<div class="skeleton-item">
						<div class="placeholder preview"></div>
						<div class="placeholder line"></div>
						<div class="placeholder line short"></div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.navigation-loading {
		min-height: 65dvh;
		background: var(--ds-light-surface);
		color: var(--ds-light-body);
	}
	.skeleton {
		max-width: 1280px;
		margin-inline: auto;
	}
	.placeholder {
		background: color-mix(in srgb, var(--ds-light-title) 8%, var(--ds-light-surface));
		border-radius: var(--ds-radius-sm);
		animation: skeleton-pulse 1.6s ease-in-out infinite;
	}
	.skeleton-body {
		padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 3rem);
	}
	.breadcrumb {
		width: 9rem;
		height: 0.75rem;
		margin-bottom: 2.5rem;
	}
	.skeleton-intro {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: clamp(2rem, 5vw, 4rem);
	}
	.skeleton-copy {
		padding-block: 1rem;
	}
	.title {
		width: 90%;
		height: clamp(2rem, 4vw, 3.5rem);
		margin-bottom: 0.75rem;
	}
	.short {
		width: 60%;
	}
	.skeleton-lines {
		display: grid;
		gap: 0.75rem;
		margin-top: 2rem;
	}
	.line {
		height: 0.85rem;
	}
	.media {
		min-height: 16rem;
		aspect-ratio: 4 / 3;
	}
	.skeleton-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1.5rem;
		margin-top: 3rem;
	}
	.skeleton-grid.content-only {
		margin-top: 0;
	}
	.skeleton-item {
		display: grid;
		gap: 0.75rem;
	}
	.preview {
		aspect-ratio: 4 / 3;
		margin-bottom: 0.5rem;
	}
	.workspace .skeleton-intro {
		grid-template-columns: 1fr;
	}
	.workspace .skeleton-copy {
		max-width: 40rem;
	}
	.workspace .preview {
		aspect-ratio: 3 / 1;
	}
	@keyframes skeleton-pulse {
		50% {
			opacity: 0.5;
		}
	}
	@media (max-width: 640px) {
		.skeleton-intro {
			grid-template-columns: 1fr;
		}
		.media {
			min-height: 0;
			aspect-ratio: 16 / 9;
		}
		.skeleton-grid {
			grid-template-columns: 1fr 1fr;
		}
		.skeleton-item:last-child {
			display: none;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.placeholder {
			animation: none;
		}
	}
</style>
