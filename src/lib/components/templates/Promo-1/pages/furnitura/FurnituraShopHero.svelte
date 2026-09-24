<script lang="ts">
	// Артикул: 1.36.2.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';

	let { data }: { data: Record<string, unknown> } = $props();

	const title = $derived(String(data.title || 'Магазин фурнитуры'));
	const logo = $derived(String(data.logo || ''));
</script>

<div class="p1-catalog-container mt-16">
	<section class="rounded-3xl bg-ink-900 px-8 py-12 sm:px-12 sm:py-16" data-p1-theme="dark">
		<nav class="mb-7 flex flex-wrap items-center gap-2 text-sm text-ink-300">
			<a href="/" class="hover:text-on-dark">Главная</a>
			<span aria-hidden="true">/</span>
			<a href="/furnitura" class="hover:text-on-dark">Фурнитура</a>
			<span aria-hidden="true">/</span>
			<span class="text-on-dark" aria-current="page">{title}</span>
		</nav>
		<div class="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p class="mb-3 text-sm font-medium tracking-wider text-ink-300 uppercase">
					Магазин фурнитуры
				</p>
				<h1 class="text-3xl text-on-dark sm:text-4xl lg:text-5xl">{title}</h1>
			</div>
			{#if logo}
				<div
					class="flex h-32 w-full max-w-64 items-center justify-center rounded-2xl bg-surface-raised p-6 sm:shrink-0"
				>
					<ImageFallback
						src={logo}
						imagePath={undefined}
						alt="Логотип {title}"
						class="max-h-full max-w-full object-contain"
					/>
				</div>
			{/if}
		</div>
	</section>
</div>
