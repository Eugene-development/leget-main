<script lang="ts">
	// Артикул: 1.20.3.1 — см. docs/architecture/component-articles-map.md
	import { useImageEditing } from '$lib/utils/image-editing.svelte';
	const imageEditing = useImageEditing();
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { fly } from 'svelte/transition';
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

	// API supplies the same directory as ByttehnikaSidebar, including site visibility.
	const brands = $derived.by(() => {
		const items = Array.isArray(data?.brands) ? data.brands : [];
		return isEditable
			? items
			: items.filter((brand: { is_enabled?: boolean }) => brand.is_enabled !== false);
	});
</script>

{#if brands.length > 0}
	<div class="mebel-container mt-12 mb-12">
		<h2 class="mb-6 text-2xl text-ink-900">
			{data.title || 'Работаем с лучшими брендами'}
		</h2>

		<div
			class="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6"
			in:fly={{ y: 20, duration: 500, easing: cubicOut }}
		>
			{#each brands as brand, i (brand.slug)}
				<a
					href="/bytovaya-tehnika/{brand.slug}"
					class="group flex h-20 items-center justify-center rounded-xl bg-surface-raised p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
					in:fly={{ y: 10, duration: 400, delay: i * 50, easing: cubicOut }}
				>
					{#if brand.logo || imageEditing?.editable}
						<ImageFallback
							imagePath={['brands', data.brands.indexOf(brand), 'logo']}
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
				</a>
			{/each}
		</div>
	</div>
{/if}
