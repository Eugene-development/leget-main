<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { saveComponentData, toggleCategory, type EditContext } from '$lib/utils/page-edit';
	import EditableField from '$lib/components/EditableField.svelte';
	import { auth } from '$lib/stores/auth';
	import { browser } from '$app/environment';

	import MebelProjectModal from './MebelProjectModal.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	let isModalOpen = $state(false);
	let addCategoryId = $state('');
	let togglingIds = $state(new Set<string>());

	function openAddModal(categoryId: string, e: Event) {
		e.preventDefault();
		e.stopPropagation();
		addCategoryId = categoryId;
		isModalOpen = true;
	}

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelSidebar', updated);
		data = updated;
	}

	async function handleToggleCategory(id: string, currentEnabled: boolean, e: Event) {
		e.preventDefault();
		e.stopPropagation();

		if (togglingIds.has(id)) return;

		togglingIds.add(id);
		togglingIds = new Set(togglingIds);

		try {
			await toggleCategory(id, !currentEnabled);
			await invalidateAll();
		} catch (err: any) {
			console.error('Failed to toggle category:', err);
			alert('Не удалось изменить статус категории: ' + (err.message || 'ошибка'));
		} finally {
			togglingIds.delete(id);
			togglingIds = new Set(togglingIds);
		}
	}

	const categories = $derived(data.categories || []);
	const visibleCategories = $derived(
		isEditable 
			? categories 
			: categories.filter((c: any) => c.is_enabled !== false)
	);

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

<MebelProjectModal 
	isOpen={isModalOpen} 
	onClose={() => isModalOpen = false} 
	onSaved={() => invalidateAll()} 
	categories={categories} 
	initialCategoryId={addCategoryId} 
/>

<aside bind:this={sidebarElement} class="mebel-sidebar hidden lg:block" style="top: {offsetTop}px;">
	<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
		<h3 class="mb-6 text-lg font-medium text-slate-900">
			<EditableField
				fieldKey="MebelSidebar.title"
				label="Заголовок сайдбара"
				value={String(data.title || 'Категории мебели')}
				{isEditable}
				inline
				onSave={(v) => saveField('title', v)}
			>
				{#snippet children(val)}
					{val}
				{/snippet}
			</EditableField>
		</h3>

		<nav class="space-y-1">
			{#each visibleCategories as category}
				{@const isActive = category.slug === data.activeSlug}
				{@const isEnabled = category.is_enabled !== false}
				<div class="group flex items-center justify-between rounded-lg transition-all {isActive
						? 'bg-sky-50 text-sky-600'
						: 'text-slate-600 hover:bg-slate-50 hover:text-sky-600'}"
					class:opacity-50={isEditable && !isEnabled}
					class:bg-slate-50={isEditable && !isEnabled}
				>
					<a
						href="/mebel/{category.slug}"
						class="flex-1 block px-4 py-3"
						class:pointer-events-none={isEditable && !isEnabled}
					>
						<div class="flex justify-between items-center font-medium">
							<div class="flex items-center gap-2">
								<span>{category.value}</span>
								{#if isEditable && !isEnabled}
									<span class="text-[9px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase tracking-wider">Откл.</span>
								{/if}
							</div>
							{#if !isEditable}
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							{/if}
						</div>
					</a>
					{#if isEditable}
						<div class="pr-4 flex items-center gap-2">
							<button 
								type="button"
								onclick={(e) => openAddModal(category.id, e)}
								class="rounded-full bg-white p-1.5 text-sky-500 shadow-sm ring-1 ring-slate-200 hover:bg-sky-50 transition-colors"
								title="Добавить проект в категорию"
							>
								<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
							</button>

							<button
								type="button"
								onclick={(e) => handleToggleCategory(category.id, isEnabled, e)}
								disabled={togglingIds.has(category.id)}
								class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 {isEnabled ? 'bg-sky-500' : 'bg-slate-300'}"
								title={isEnabled ? "Скрыть категорию" : "Показать категорию"}
							>
								<span
									class="pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out {isEnabled ? 'translate-x-4' : 'translate-x-0'}"
								>
									{#if togglingIds.has(category.id)}
										<span class="absolute inset-0 flex items-center justify-center">
											<svg class="h-2.5 w-2.5 animate-spin text-sky-500" fill="none" viewBox="0 0 24 24">
												<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
												<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
											</svg>
										</span>
									{/if}
								</span>
							</button>
						</div>
					{/if}
				</div>
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
