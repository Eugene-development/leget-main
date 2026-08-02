<script lang="ts">
	// Артикул: 2.6.3.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
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

	let brandVisibility = $state<Record<string, boolean>>({});

	const defaultBrands = [
		{
			id: 'blum',
			name: 'Blum',
			origin: 'Австрия',
			description:
				'Австрийская компания Blum — признанный лидер в мире фурнитуры. Это синоним безупречного движения, долговечности и инноваций. Механизмы Blum рассчитаны на срок службы всей мебели и даже больше, обеспечивая плавность закрывания и комфорт в каждом движении.',
			image: 'https://storage.yandexcloud.net/zovtop/foto/blumdsflgelgmdklbgmlf.jpg',
			features: [
				'Системы петель CLIP top BLUMOTION',
				'Подъемные механизмы AVENTOS',
				'Премиальные системы выдвижения LEGRABOX',
				'Повышенная гарантия на механизмы'
			],
			reverse: false
		},
		{
			id: 'hettich',
			name: 'Hettich',
			origin: 'Германия',
			description:
				'Немецкое качество Hettich устанавливает стандарты во всем мире. Интеллектуальные технологии сочетаются с лаконичным дизайном. Hettich обеспечивает максимальную стабильность для самых широких и тяжелых фасадов, делая вашу мебель надежной и совершенной.',
			image: 'https://storage.yandexcloud.net/zovtop/foto/hettichjnbjkwetnbkje.jpg',
			features: [
				'Выдвижные ящики IT Atira, ArciTech, AvanTech',
				'Инновационные петли Sensys',
				'Скрытые направляющие Quadro',
				'Высочайшая немецкая надежность'
			],
			reverse: true
		},
		{
			id: 'gtv',
			name: 'GTV',
			origin: 'Польша',
			description:
				'Динамично развивающийся европейский бренд GTV предлагает современные решения для любой мебели. Это оптимальное сочетание высокого качества, премиального комфорта, новейших трендов в дизайне и ценовой доступности.',
			image: 'https://storage.yandexcloud.net/zovtop/foto/gtvklsdfbnjsnbi.jpg',
			features: [
				'Ультратонкие ящики Axis Pro',
				'Системы скрытого монтажа Modern SLIDE PRO',
				'Петли с доводчиком SILENTO PRO',
				'Оптимальное соотношение цена/качество'
			],
			reverse: false
		}
	];

	const brands = $derived(
		Array.isArray(data?.brands) && (data.brands as unknown[]).length > 0
			? (data.brands as typeof defaultBrands)
			: defaultBrands
	);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const id = (entry.target as HTMLElement).dataset.brandId;
						if (id) brandVisibility = { ...brandVisibility, [id]: true };
					}
				});
			},
			{ threshold: 0.15 }
		);

		document.querySelectorAll('[data-brand-id]').forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<section class="relative bg-surface-warm pb-section-sm lg:pb-section">
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1 pt-20">
		<div class="flex flex-col gap-24 lg:gap-32">
			{#each brands as brand (brand.id)}
				<div
					class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16"
					data-brand-id={brand.id}
				>
					<!-- Content Box -->
					<div
						class="flex flex-col justify-center opacity-0 {brand.reverse ? 'lg:order-last' : ''}"
						class:animate-fade-up={brandVisibility[brand.id]}
						style="animation-delay: 0.2s"
					>
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{brand.origin}</span>
						<h3
							class="mt-3 text-4xl font-light tracking-wide text-primary lg:text-6xl"
							style="font-family: var(--font-heading);"
						>
							{brand.name}
						</h3>
						<div class="mt-4 mb-8 h-px w-12 bg-border-strong"></div>
						<p class="text-base leading-relaxed text-secondary">
							{brand.description}
						</p>
						<ul class="mt-8 flex flex-col gap-4">
							{#each brand.features as feature}
								<li class="flex items-start gap-4">
									<div
										class="mt-1 flex h-3 w-3 shrink-0 items-center justify-center border border-secondary"
									>
										<div class="h-1 w-1 bg-secondary"></div>
									</div>
									<span class="text-sm text-primary">{feature}</span>
								</li>
							{/each}
						</ul>
					</div>

					<!-- Image Box -->
					<div
						class="relative aspect-[4/3] overflow-hidden opacity-0 shadow-soft lg:aspect-square"
						class:animate-fade-up={brandVisibility[brand.id]}
						style="animation-delay: 0.4s"
					>
						<img loading="lazy"
							src={brand.image}
							alt={`Фурнитура ${brand.name}`}
							class="h-full w-full object-contain transition-transform duration-700 hover:scale-105">
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
