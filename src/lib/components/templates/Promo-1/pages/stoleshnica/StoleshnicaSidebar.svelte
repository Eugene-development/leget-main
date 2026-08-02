<script lang="ts">
	// Артикул: 1.19.1.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'StoleshnicaSidebar', updated);
		data = updated;
	}

	const categories = $derived(data.categories || []);

	let offsetTop = $state(190);
	let sidebarElement: HTMLElement | null = $state(null);

	onMount(() => {
		const handleScroll = () => {
			const footer = document.querySelector('footer');
			if (!footer || !sidebarElement) return;

			const footerRect = footer.getBoundingClientRect();
			const sidebarRect = sidebarElement.getBoundingClientRect();
			const buffer = 40;
			const defaultTop = 190;

			if (defaultTop + sidebarRect.height > footerRect.top - buffer) {
				offsetTop = footerRect.top - sidebarRect.height - buffer;
			} else {
				offsetTop = defaultTop;
			}
		};

		window.addEventListener('scroll', handleScroll);
		window.addEventListener('resize', handleScroll);

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
		<h3 class="mb-6 text-lg font-medium text-slate-900">Материалы столешниц</h3>

		<nav class="space-y-1">
			{#each categories as category}
				<a
					href="/stoleshnica/{category.slug}"
					class="flex items-center justify-between rounded-lg px-4 py-3 text-slate-600 transition-all hover:bg-slate-50 hover:text-amber-600"
				>
					<span class="font-medium">{category.title ?? category.value}</span>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				</a>
			{/each}
		</nav>

		<!-- Баннер в сайдбаре -->
		<div class="mt-8 rounded-xl bg-amber-50 p-6">
			<h4 class="font-bold text-amber-900">Подбор столешницы</h4>
			<p class="mt-2 text-sm leading-relaxed text-amber-700">
				Поможем выбрать материал и рассчитать стоимость
			</p>
			<button
				class="mt-4 w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-600"
			>
				Получить расчёт
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
	}

	@media (max-width: 1536px) {
		.mebel-sidebar {
			left: 1.5rem;
		}
	}
</style>
