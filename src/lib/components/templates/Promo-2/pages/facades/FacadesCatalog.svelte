<script lang="ts">
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

	let visible = $state(false);
	let sectionEl: HTMLElement;
	let itemVisibility = $state<Record<string, boolean>>({});

	const defaultFacades = [
		{
			id: 'enamel',
			title: 'Эмаль (Крашеный МДФ)',
			description:
				'Гладкие матовые или глянцевые поверхности любого оттенка. Эмаль наносится в несколько слоев, что создает идеальное покрытие без швов по кромке. Идеально для современных, минималистичных и неоклассических интерьеров.',
			image: 'https://storage.yandexcloud.net/zovtop/foto/kv-1_fonjfgnbisfn.webp',
			details: {
				base: 'Плита МДФ',
				coating: 'Многослойная эмаль (матовая / глянцевая)',
				thickness: '19 мм',
				minSize: '100 × 100 мм',
				maxSize: '2750 × 1100 мм'
			}
		},
		{
			id: 'wood',
			title: 'Массив дерева',
			description:
				'Классика, которая никогда не выходит из моды. Натуральная текстура дуба или ясеня привносит в дом тепло и уют. Фасады из массива поддаются реставрации и с годами становятся только благороднее.',
			image: '/images/facade_wood.png',
			details: {
				base: 'Массив ясеня / дуба',
				coating: 'Эмаль, масловоск, воскобейц, патина',
				thickness: '21 мм',
				minSize: '140 × 140 мм',
				maxSize: '2400 × 900 мм'
			}
		},
		{
			id: 'hpl',
			title: 'Пластики',
			description:
				'Максимально устойчивые к царапинам, ударам и температурам материал. Пластики идеально имитируют текстуры бетона, камня или дерева, сохраняя при этом индустриальную строгость и премиальный вид.',
			image: '/images/facade_hpl.png',
			details: {
				base: 'Плита МДФ',
				coating: 'Декоративный пластик',
				thickness: '18 мм / 21 мм',
				minSize: '100 × 100 мм',
				maxSize: '2800 × 1300 мм'
			}
		},
		{
			id: 'shpon',
			title: 'Шпон натуральный',
			description:
				'Фасады из натурального шпона дуба или ясеня — это классика, которая никогда не выходит из моды. Натуральная текстура дерева привносит в дом тепло и уют.',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/shponjdfnvkjsvnkjsf.jpg',
			details: {
				base: 'Плита МДФ',
				coating: 'Шпон дуба или ясеня',
				thickness: '18 мм / 21 мм',
				minSize: '100 × 100 мм',
				maxSize: '2800 × 1300 мм'
			}
		},
		{
			id: 'acrylic',
			title: 'Акрил',
			description:
				'Идеально ровная, зеркальная глянцевая или бархатистая матовая поверхность. Фасады из акрила обладают высокой ударопрочностью, не выцветают на солнце и придают интерьеру премиальный блеск.',
			image: '/images/facade_acrylic.png',
			details: {
				base: 'Плита МДФ',
				coating: 'Акриловый пластик',
				thickness: '19 мм',
				minSize: '100 × 100 мм',
				maxSize: '2800 × 1300 мм'
			}
		}
	];

	const facades = $derived(
		Array.isArray(data?.facades) && (data.facades as unknown[]).length > 0
			? (data.facades as typeof defaultFacades)
			: defaultFacades
	);

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

<section
	class="relative scroll-mt-20 bg-surface py-section lg:scroll-mt-24"
	id="facades-catalog"
	bind:this={sectionEl}
>
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<div
			class="mb-16 opacity-0 lg:mb-24"
			class:animate-fade-up={true}
		>
			<h2
				class="text-4xl font-light text-primary lg:text-5xl"
				style="font-family: var(--font-heading);"
			>
				Коллекция <span class="text-secondary">фасадов</span>
			</h2>
		</div>

		<div class="flex flex-col gap-20 lg:gap-32">
			{#each facades as facade, index}
				<div
					class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
					data-facade-id={facade.id}
				>
					<!-- Image Side -->
					<div
						class="relative aspect-[16/9] overflow-hidden opacity-0 lg:aspect-[4/3] {index % 2 !== 0 ? 'lg:order-last' : ''}"
						class:animate-fade-up={itemVisibility[facade.id]}
						style="animation-delay: 0.2s"
					>
						<img
							src={facade.image}
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
						<h3
							class="text-3xl font-light text-primary lg:text-4xl"
							style="font-family: var(--font-heading);"
						>
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
									<dd class="text-right text-sm font-medium text-primary">{facade.details.coating}</dd>
								</div>
								<div class="flex items-center justify-between border-b border-border-light/50 pb-4">
									<dt class="text-xs tracking-wider text-muted uppercase">Толщина</dt>
									<dd class="text-right text-sm font-medium text-primary">{facade.details.thickness}</dd>
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
