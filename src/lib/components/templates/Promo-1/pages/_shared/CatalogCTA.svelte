<script lang="ts">
	import type { Snippet } from 'svelte';
	import { sitePhoneHref } from '$lib/utils/site-phone';
	import CatalogCTADrawing, { type CatalogDrawing } from './CatalogCTADrawing.svelte';

	let {
		drawing,
		title,
		description,
		action,
		sitePhone = null,
		showDesktopPhone = false
	}: {
		drawing: CatalogDrawing;
		title: Snippet;
		description: Snippet;
		action: Snippet<[buttonClass: string]>;
		sitePhone?: string | null;
		showDesktopPhone?: boolean;
	} = $props();

	const phoneHref = $derived(sitePhoneHref(sitePhone));
	const buttonClass =
		'cta-primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-raised px-7 py-3 font-medium text-accent-ink shadow-sm transition-[translate,background-color,box-shadow] ease-ui hover:bg-accent-ink-wash hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 sm:w-auto';
</script>

<div class="p1-catalog-container mt-12 mb-16">
	<div
		class="catalog-cta relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-accent-panel to-accent-panel-deep text-on-accent shadow-xl ring-1 ring-on-accent/10 ring-inset"
	>
		<div class="cta-copy">
			<h2 class="cta-title text-balance">{@render title()}</h2>
			<p class="mt-4 max-w-[38ch] text-pretty text-on-accent-muted">
				{@render description()}
			</p>
			<div class="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
				{@render action(buttonClass)}
				<a
					href={phoneHref}
					class={[
						'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-on-accent/20 bg-on-accent/10 px-7 py-3 font-medium text-on-accent transition-colors ease-ui hover:border-on-accent/30 hover:bg-on-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent sm:w-auto sm:px-5',
						!showDesktopPhone && 'sm:hidden'
					]}
				>
					<svg
						class="size-[18px]"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						aria-hidden="true"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
						/>
					</svg>
					Позвонить
				</a>
			</div>
		</div>
		<div class="drawing" aria-hidden="true">
			<CatalogCTADrawing {drawing} />
		</div>
	</div>
</div>

<style>
	.catalog-cta {
		container-type: inline-size;
	}

	.cta-copy {
		padding: clamp(1.5rem, 6cqi, 3.75rem);
	}

	.cta-title {
		font-size: clamp(var(--text-3xl), 5.2cqi, var(--text-6xl));
		line-height: 1.02;
		overflow-wrap: anywhere;
	}

	.catalog-cta :global(.cta-primary) {
		overflow-wrap: anywhere;
	}

	.catalog-cta :global(.cta-primary)::after {
		display: block;
		flex: none;
		width: 1rem;
		height: 0.8rem;
		background: currentColor;
		clip-path: polygon(0 46%, 86% 46%, 62% 15%, 68% 8%, 100% 50%, 68% 92%, 62% 85%, 86% 54%, 0 54%);
		content: '';
	}

	@media (prefers-reduced-motion: no-preference) {
		.catalog-cta :global(.cta-primary)::after {
			transition: translate var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
		}

		.catalog-cta :global(.cta-primary:hover)::after {
			translate: 0.25rem;
		}
	}

	.drawing {
		display: none;
	}

	@container (min-width: 40rem) {
		.cta-copy {
			width: 61%;
		}

		.drawing {
			position: absolute;
			inset: 0 0 0 61%;
			display: grid;
			place-items: center;
			padding: 1.75rem 2rem 1.75rem 0;
			color: color-mix(in srgb, var(--color-on-accent) 78%, transparent);
			pointer-events: none;
		}
	}
</style>
