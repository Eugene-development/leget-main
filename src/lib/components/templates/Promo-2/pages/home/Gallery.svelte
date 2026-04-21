<script lang="ts">
	import { type EditContext } from '$lib/utils/page-edit';

	let {
		data = {},
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const images = $derived(
		Array.isArray(data?.images) && data.images.length > 0
			? (data.images as { src: string; alt: string }[])
			: [
					{ src: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', alt: 'Диван' },
					{ src: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800', alt: 'Кресло' },
					{ src: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800', alt: 'Стол' },
					{ src: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', alt: 'Спальня' },
				]
	);
</script>

<section class="bg-stone-50 px-6 py-20">
	<div class="mx-auto max-w-6xl">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each images as image}
				<div class="aspect-square overflow-hidden rounded-2xl bg-stone-200">
					<img
						src={image.src}
						alt={image.alt}
						class="h-full w-full object-cover transition duration-500 hover:scale-105"
						loading="lazy"
					/>
				</div>
			{/each}
		</div>
	</div>
</section>
