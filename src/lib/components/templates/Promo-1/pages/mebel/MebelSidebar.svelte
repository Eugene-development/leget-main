<script lang="ts">
	// Артикулы: 1.16.1.1, 1.17.1.1, 1.18.1.1 — см. docs/architecture/component-articles-map.md
	//
	// Разметку и поведение отдаёт общий CatalogSidebar. Категории — настоящий
	// справочник в БД, поэтому у пунктов есть тумблер: его рисует сам
	// CatalogSidebar по `canToggleItems`. Здесь остаётся только то, чего нет
	// у других рубрик, — добавление проекта в категорию.
	import { invalidateAll } from '$app/navigation';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import { type EditContext } from '$lib/utils/page-edit';
	import CatalogSidebar from '../_shared/CatalogSidebar.svelte';
	import MebelProjectModal from './MebelProjectModal.svelte';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		componentId = null
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		componentId?: string | null;
	} = $props();

	const categories = $derived(data.categories || []);

	let isModalOpen = $state(false);
	let addCategoryId = $state('');

	function openAddModal(categoryId: string, e: Event) {
		e.preventDefault();
		e.stopPropagation();
		addCategoryId = categoryId;
		isModalOpen = true;
	}

	/**
	 * Статика на случай пустого блока в БД — те же категории, что сейчас лежат
	 * в справочнике. Без id: переключать и наполнять можно только реальные записи.
	 */
	const DEFAULT_CATEGORIES = [
		{ value: 'Кухни', slug: 'kuhni' },
		{ value: 'Шкафы', slug: 'shkafy' },
		{ value: 'Гардеробные', slug: 'garderobnye' },
		{ value: 'Прихожие', slug: 'prihozhie' },
		{ value: 'Детская мебель', slug: 'detskaya-mebel' },
		{ value: 'Офисная мебель', slug: 'ofisnaya-mebel' }
	];
</script>

<MebelProjectModal
	isOpen={isModalOpen}
	onClose={() => (isModalOpen = false)}
	onSaved={() => invalidateAll()}
	{categories}
	initialCategoryId={addCategoryId}
/>

<CatalogSidebar
	bind:data
	{editContext}
	{isEditable}
	componentType="MebelSidebar"
	itemsKey="categories"
	basePath="/mebel"
	defaultTitle="Категории мебели"
	defaultItems={DEFAULT_CATEGORIES}
	fabLabel="Категории"
	emptyText="Категории появятся здесь"
	accent="sky"
	showDisabledBadge={false}
	canToggleItems
	itemNoun="категорию"
	itemActions={categoryActions}
	settings={componentSettings}
/>

{#snippet componentSettings()}
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="MebelSidebar"
		resetId={componentId}
		placement="inline"
	/>
{/snippet}

{#snippet categoryActions(category: any)}
	{#if category.id}
		<button
			type="button"
			onclick={(e) => openAddModal(category.id, e)}
			class="ms-add"
			title="Добавить проект в категорию"
			aria-label="Добавить проект в категорию «{category.value}»"
		>
			<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
			</svg>
		</button>
	{/if}
{/snippet}

<style>
	/* Кнопки живут в этом компоненте, поэтому и стили тоже: scoped-CSS Svelte
	   не пробивается в сниппет из компонента-хозяина списка. */
	.ms-add {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 999px;
		background: #ffffff;
		color: #0ea5e9;
		box-shadow:
			0 1px 2px rgb(15 23 42 / 0.08),
			0 0 0 1px rgb(15 23 42 / 0.08);
		transition:
			transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
			background-color 0.2s ease;
	}

	.ms-add:hover {
		background: #f0f9ff;
		transform: scale(1.08) rotate(90deg);
	}

	.ms-add:active {
		transform: scale(0.94);
	}

	@media (prefers-reduced-motion: reduce) {
		.ms-add {
			transition-duration: 0.01ms;
		}
	}
</style>
