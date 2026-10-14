<script lang="ts">
	// Артикул: 1.21.3.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { cubicOut } from 'svelte/easing';
	import { type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const brands = $derived.by(() => {
		const items = Array.isArray(data?.brands) ? data.brands : [];
		return isEditable
			? items
			: items.filter((brand: { is_enabled?: boolean }) => brand.is_enabled !== false);
	});
</script>

{#if brands.length > 0}
	<div class="mebel-container mt-12 mb-12">
		<h2 class="mb-6 text-2xl text-ink-900">{data.title || 'Бренды сантехники'}</h2>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
			{#each brands as brand, i (brand.slug)}
				<a
					href="/santehnika/{brand.slug}"
					class="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl bg-surface-raised p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					{#if brand.logo}
						<ImageFallback
							imagePath={undefined}
							imageDefaults={{ brands }}
							loading="lazy"
							src={brand.logo}
							alt={brand.title ?? brand.value}
							class="max-h-10 max-w-full object-contain"
						/>
					{:else}
						<span
							class="text-base font-bold text-ink-500 transition-colors group-hover:text-link-600"
						>
							{brand.title ?? brand.value ?? brand.name}
						</span>
					{/if}
					{#if brand.tags?.length}<ul
							aria-label="Теги бренда"
							class="flex flex-wrap justify-center gap-1"
						>
							{#each brand.tags as tag (tag.id)}<li
									class="rounded-full bg-ink-100 px-2 py-1 text-xs text-ink-700"
								>
									{tag.name}
								</li>{/each}
						</ul>{/if}
				</a>
			{/each}
		</div>
	</div>
{/if}
