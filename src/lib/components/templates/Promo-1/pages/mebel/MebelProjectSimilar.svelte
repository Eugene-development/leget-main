<script lang="ts">
	import { formatPrice } from '$lib/utils/format';

	let {
		data = {}
	}: {
		data: any;
	} = $props();

	const projects = $derived(data.projects || []);
	const categorySlug = $derived(data.categorySlug || '');
</script>

<div class="mebel-container mt-16 mb-16">
	<h2 class="text-2xl font-bold text-slate-900 mb-8">Похожие проекты</h2>
	
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each projects as project}
			<a
				href="/mebel/{categorySlug}/{project.slug}"
				class="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
			>
				<div class="relative aspect-4/3 overflow-hidden bg-slate-100">
					{#if project.images && project.images.length > 0}
						<img
							src={project.images[0].url}
							alt={project.value}
							class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-slate-50">
							<svg class="h-10 w-10 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
					{/if}

					<!-- Метки -->
					<div class="absolute left-3 top-3 flex gap-1.5">
						{#if project.is_new}
							<span class="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">Новинка</span>
						{/if}
						{#if project.old_price && project.price && project.old_price > project.price}
							<span class="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
								-{Math.round((1 - project.price / project.old_price) * 100)}%
							</span>
						{/if}
					</div>
				</div>

				<div class="p-5">
					<h3 class="font-bold text-slate-900 transition-colors group-hover:text-sky-600 line-clamp-2">
						{project.value}
					</h3>
					<div class="mt-3 flex items-baseline gap-2">
						{#if project.price}
							<span class="text-lg font-bold text-slate-900">{formatPrice(project.price)} ₽</span>
							{#if project.old_price && project.old_price > project.price}
								<span class="text-xs text-slate-400 line-through">{formatPrice(project.old_price)} ₽</span>
							{/if}
						{:else}
							<span class="text-sm font-bold text-slate-900">По запросу</span>
						{/if}
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.mebel-container {
		max-width: 1536px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1rem;
		padding-right: 1rem;
	}

	@media (min-width: 1024px) {
		.mebel-container {
			padding-left: 360px;
		}
	}
</style>
