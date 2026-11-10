<script lang="ts">
	// Артикул: 2.5.2.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { onMount } from 'svelte';
	import { resolveFacades } from '../data';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	let visible = $state(false);
	let sectionEl: HTMLElement;
	let itemVisibility = $state<Record<string, boolean>>({});

	const facades = $derived(resolveFacades(data));

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const id = (entry.target as HTMLElement).dataset.facadeId;
						if (id) itemVisibility = { ...itemVisibility, [id]: true };
					}
				});
			},
			{ threshold: 0.15 }
		);

		document.querySelectorAll('[data-facade-id]').forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<section class="relative bg-surface py-section" id="facades-catalog" bind:this={sectionEl}>
	<div class="p2-container mx-auto">
		<div class="mb-16 opacity-0 lg:mb-24" class:animate-fade-up={true}>
			<h2 class="text-4xl text-primary lg:text-5xl" style="font-family: var(--font-heading);">
				Коллекция <span class="text-secondary">фасадов</span>
			</h2>
		</div>

		<div class="flex flex-col gap-20 lg:gap-32">
			{#each facades as facade, index}
				<div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20" data-facade-id={facade.id}>
					<!-- Image Side -->
					<div
						class="relative aspect-[16/9] overflow-hidden opacity-0 lg:aspect-[4/3] {index % 2 !== 0
							? 'lg:order-last'
							: ''}"
						class:animate-fade-up={itemVisibility[facade.id]}
						style="animation-delay: 0.2s"
					>
						<ImageFallback
							imagePath={['facades', index, 'image']}
							imageDefaults={{ facades }}
							loading="lazy"
							src={facade.image || undefined}
							alt={facade.title}
							class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent lg:hidden"
						></div>
					</div>

					<!-- Content Side -->
					<div
						class="flex flex-col opacity-0"
						class:animate-fade-up={itemVisibility[facade.id]}
						style="animation-delay: 0.4s"
					>
						<h3 class="text-3xl text-primary lg:text-4xl" style="font-family: var(--font-heading);">
							{facade.title}
						</h3>
						<p class="mt-6 text-base leading-relaxed text-secondary">
							{facade.description}
						</p>

						<!-- Specifications Table -->
						<div class="mt-10 border-t border-border-light pt-6">
							<dl class="flex flex-col gap-4">
								<div class="flex items-center justify-between border-b border-border-light/50 pb-4">
									<dt class="text-xs tracking-wider text-muted uppercase">Материал основы</dt>
									<dd class="text-right text-sm font-medium text-primary">{facade.details.base}</dd>
								</div>
								<div class="flex items-center justify-between border-b border-border-light/50 pb-4">
									<dt class="text-xs tracking-wider text-muted uppercase">Покрытие</dt>
									<dd class="text-right text-sm font-medium text-primary">
										{facade.details.coating}
									</dd>
								</div>
								<div class="flex items-center justify-between border-b border-border-light/50 pb-4">
									<dt class="text-xs tracking-wider text-muted uppercase">Толщина</dt>
									<dd class="text-right text-sm font-medium text-primary">
										{facade.details.thickness}
									</dd>
								</div>
								<div class="flex items-start justify-between pb-2">
									<dt class="mt-0.5 text-xs tracking-wider text-muted uppercase">
										Размеры <span class="text-[10px] opacity-70">(мин / макс)</span>
									</dt>
									<dd class="text-right text-sm font-medium text-primary">
										{facade.details.minSize}
										<br />
										<span class="mx-1 text-xs text-muted">—</span>
										<br class="sm:hidden" />
										{facade.details.maxSize}
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
