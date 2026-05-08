<script lang="ts">
	import { onMount } from 'svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelSidebar', updated);
		data = updated;
	}

	const categories = $derived(data.categories || []);

	let offsetTop = $state(190); // Default aligned with hero margin-top (4rem is 64, plus header ~100)
	let sidebarElement: HTMLElement | null = $state(null);

	onMount(() => {
		const handleScroll = () => {
			const footer = document.querySelector('footer');
			if (!footer || !sidebarElement) return;

			const footerRect = footer.getBoundingClientRect();
			const sidebarRect = sidebarElement.getBoundingClientRect();
			const windowHeight = window.innerHeight;

			// На сколько пикселей футер "наезжает" на сайдбар снизу
			// Сайдбар должен закончиться в 40px от футера
			const buffer = 40;
			const footerTop = footerRect.top;

			// Идеальное положение сайдбара (по умолчанию)
			const defaultTop = 190;

			// Если нижний край сайдбара в стандартном положении (defaultTop + height)
			// начинает пересекаться с футером (footerTop - buffer)
			if (defaultTop + sidebarRect.height > footerTop - buffer) {
				offsetTop = footerTop - sidebarRect.height - buffer;
			} else {
				offsetTop = defaultTop;
			}
		};

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleScroll);

		// Наблюдаем за изменением высоты футера или контента
		const observer = new ResizeObserver(handleScroll);
		const footer = document.querySelector('footer');
		if (footer) observer.observe(footer);
		if (document.body) observer.observe(document.body);

		handleScroll();

		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
			observer.disconnect();
		};
	});
</script>

<aside bind:this={sidebarElement} class="mebel-sidebar hidden lg:block" style="top: {offsetTop}px;">
	<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
		<h3 class="mb-6 text-lg font-medium text-slate-900">Категории мебели</h3>

		<nav class="space-y-1">
			{#each categories as category}
				<a
					href="/mebel/{category.slug}"
					class="flex items-center justify-between rounded-lg px-4 py-3 text-slate-600 transition-all hover:bg-slate-50 hover:text-sky-600"
				>
					<span class="font-medium">{category.title}</span>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</a>
			{/each}
		</nav>

		<!-- Баннер в сайдбаре -->
		<div class="mt-8 rounded-xl bg-sky-50 p-6">
			<h4 class="font-bold text-sky-900">Нужна помощь?</h4>
			<p class="mt-2 text-sm leading-relaxed text-sky-700">
				Получите бесплатную консультацию дизайнера
			</p>
			<button
				class="mt-4 w-full rounded-lg bg-sky-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-sky-600"
			>
				Перезвонить мне
			</button>
		</div>
	</div>
</aside>

<style>
	.mebel-sidebar {
		position: fixed;
		left: max(1.5rem, calc((100vw - 1536px) / 2 + 1.5rem));
		width: 300px;
		z-index: 30;
		/* Убираем transition для мгновенной реакции на скролл, как у sticky */
	}

	@media (max-width: 1536px) {
		.mebel-sidebar {
			left: 1.5rem;
		}
	}
</style>
