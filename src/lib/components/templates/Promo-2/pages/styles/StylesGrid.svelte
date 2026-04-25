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

	const defaultStyles = [
		{
			id: 'modern',
			name: 'Современный',
			description:
				'Чистые линии, минимализм, интегрированная техника и матовые текстуры для создания идеального пространства',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/sovremjknvndgvhj.jpg',
			tags: ['Минимализм', 'Hi-Tech', 'Матовость']
		},
		{
			id: 'classic',
			name: 'Классика',
			description:
				'Традиционные формы, резные фасады, обилие дерева и теплые оттенки для уюта и респектабельности',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/claskjdgnbkdgmj.jpg',
			tags: ['Дерево', 'Резьба', 'Патина']
		},
		{
			id: 'loft',
			name: 'Лофт',
			description:
				'Индустриальный шик: бетон, кирпич, металл и брутальные формы, создающие стильное современное пространство',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/loftelkjbngrtobnhekrjthbn.jpg',
			tags: ['Бетон', 'Металл', 'Брутальность']
		},
		{
			id: 'minimalist',
			name: 'Минимализм',
			description:
				'Лаконичность, строгая геометрия форм без лишних деталей, нейтральная палитра для создания просторного интерьера',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/minimkjfvnfsjnvk.jpg',
			tags: ['Лаконичность', 'Геометрия', 'Пространство']
		},
		{
			id: 'modern2',
			name: 'Модерн',
			description:
				'Плавные линии, элегантная асимметрия, сочетание природных мотивов и современных материалов в каждой детали',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/modernlkthetrlkmjkdrythk.jpg',
			tags: ['Плавные линии', 'Элегантность', 'Природа']
		},
		{
			id: 'retro',
			name: 'Ретро',
			description:
				'Винтажный шарм, смелые цветовые акценты, стилизованная техника и эстетика, отсылающая к ярким эпохам прошлого',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/retrofmsjvbjksdfvbnjksdjds.jpg',
			tags: ['Винтаж', 'Акценты', 'Стилизация']
		},
		{
			id: 'neoclassic',
			name: 'Неоклассика',
			description:
				'Изящное сочетание традиционных элементов с современными материалами и светлыми интерьерными тонами',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/neokjewtgniertwjv.jpg',
			tags: ['Изящность', 'Мрамор', 'Светлые тона']
		},
		{
			id: 'scandinavian',
			name: 'Скандинавский',
			description:
				'Максимум света и пространства, натуральные материалы, светлое дерево и функциональный лаконичный дизайн',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/scandkjbfvkjsdenbkj.jpg',
			tags: ['Свет', 'Уют', 'Функциональность']
		},
		{
			id: 'provence',
			name: 'Прованс',
			description:
				'Французский кантри с пастельными тонами, винтажной фурнитурой и домашним теплом',
			image: 'https://storage.yandexcloud.net/zovtop/stiles/provanjvngkjenbkjrn.jpg',
			tags: ['Кантри', 'Винтаж', 'Уют']
		}
	];

	const styles = $derived(
		Array.isArray(data?.styles) && (data.styles as unknown[]).length > 0
			? (data.styles as typeof defaultStyles)
			: defaultStyles
	);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section
	id="styles-grid"
	class="mx-auto max-w-screen-xl scroll-mt-24 px-4 py-20 sm:px-6 xl:px-1 lg:scroll-mt-32"
	bind:this={sectionEl}
>
	<div class="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
		{#each styles as style, i}
			<div
				class="group flex cursor-pointer flex-col opacity-0"
				class:animate-fade-up={visible}
				style="animation-delay: {0.1 + i * 0.07}s"
			>
				<!-- Image container -->
				<div
					class="relative mb-6 aspect-[4/3] overflow-hidden rounded-sm bg-surface-muted transition-shadow duration-500 group-hover:shadow-elevated"
				>
					<img
						src={style.image}
						alt={style.name}
						class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
					/>
					<!-- Subtle Hover Overlay -->
					<div
						class="absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
					></div>
				</div>

				<!-- Content -->
				<div class="flex flex-grow flex-col text-center">
					<h2
						class="mb-3 text-3xl font-light text-primary transition-colors group-hover:text-secondary"
						style="font-family: var(--font-heading);"
					>
						{style.name}
					</h2>
					<p class="mb-6 line-clamp-3 text-lg leading-relaxed text-secondary">
						{style.description}
					</p>

					<div class="mt-auto flex flex-wrap justify-center gap-2">
						{#each style.tags as tag}
							<span
								class="rounded-sm border border-border-light bg-transparent px-3 py-1 text-xs text-muted transition-colors group-hover:border-secondary/40 group-hover:text-secondary"
							>
								{tag}
							</span>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
