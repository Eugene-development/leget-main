<script lang="ts">
	import { navigating } from '$app/state';
	import { getContext, onMount, type Snippet } from 'svelte';
	import NavigationLoading from './NavigationLoading.svelte';

	let {
		children,
		workspace = false,
		catalog = false,
		intro = true,
		root = false,
		delegated = false,
		smoothNavigation = false
	}: {
		children: Snippet;
		workspace?: boolean;
		catalog?: boolean;
		intro?: boolean;
		root?: boolean;
		delegated?: boolean;
		smoothNavigation?: boolean;
	} = $props();
	const navigation = getContext<
		| {
				active: () => boolean;
				register: () => () => void;
		  }
		| undefined
	>('leget-navigation-body');
	const loading = $derived(Boolean(navigation?.active()) && !delegated);
	const showPlaceholder = $derived(
		loading &&
			!(smoothNavigation && navigating.from?.url.pathname !== navigating.to?.url.pathname)
	);
	let region = $state<HTMLDivElement>();
	let loadingOffset = $state(0);
	let loadingLeft = $state(0);
	let loadingRight = $state(0);

	$effect(() => {
		if (!showPlaceholder || !region) return;
		const node = region;
		let frame = 0;
		const measure = () => {
			frame = 0;
			const bounds = node.getBoundingClientRect();
			const headerHeight =
				Number.parseFloat(
					getComputedStyle(document.documentElement).getPropertyValue('--header-h')
				) || 0;
			loadingOffset = Math.min(bounds.height, Math.max(0, headerHeight - bounds.top));
			loadingLeft = 0;
			loadingRight = 0;
			if (catalog && window.matchMedia('(min-width: 1024px)').matches) {
				const container = node.querySelector('.p1-catalog-container, .mebel-container');
				if (container) {
					const content = container.getBoundingClientRect();
					const style = getComputedStyle(container);
					loadingLeft = Math.max(
						0,
						content.left - bounds.left + (Number.parseFloat(style.paddingLeft) || 0)
					);
					loadingRight = Math.max(
						0,
						bounds.right - content.right + (Number.parseFloat(style.paddingRight) || 0)
					);
				}
			}
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};
		// Keep the placeholder in the visible part of this body region without
		// changing global overflow or scroll position (both affect site chrome).
		measure();
		const observer = new ResizeObserver(schedule);
		observer.observe(node);
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (frame) cancelAnimationFrame(frame);
		};
	});

	// Nested page shells own their body region; the root only handles pages
	// without a shell. Registrations are local to the current layout instance.
	onMount(() => {
		if (!root) return navigation?.register();
	});
</script>

<div
	bind:this={region}
	class="navigation-body"
	class:root
	class:loading={showPlaceholder}
	aria-busy={loading}
	data-navigation-body
	data-smooth-navigation={smoothNavigation ? '' : undefined}
>
	<div
		class="body-content"
		class:body-pending={showPlaceholder}
		inert={showPlaceholder}
		aria-hidden={showPlaceholder ? 'true' : undefined}
	>
		{@render children()}
	</div>
	{#if showPlaceholder}
		<div class="body-loading" style:left={`${loadingLeft}px`} style:right={`${loadingRight}px`}>
			<div class="body-placeholder" style:top={`${loadingOffset}px`}>
				<NavigationLoading {workspace} {intro} />
			</div>
		</div>
	{/if}
</div>

<style>
	.navigation-body {
		position: relative;
	}
	.root {
		display: contents;
	}
	.root.loading {
		display: block;
	}
	.loading {
		isolation: isolate;
	}
	.body-content {
		display: contents;
	}
	.body-pending {
		visibility: hidden;
	}
	.body-loading {
		position: absolute;
		inset: 0;
		z-index: 1;
		clip-path: inset(0);
		background: var(--ds-light-surface);
	}
	.body-placeholder {
		position: absolute;
		inset-inline: 0;
		max-height: 100dvh;
		overflow: hidden;
	}
</style>
