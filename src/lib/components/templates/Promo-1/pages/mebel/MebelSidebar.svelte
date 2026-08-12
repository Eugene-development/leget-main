<script lang="ts">
	// Артикулы: 1.16.1.1, 1.17.1.1, 1.18.1.1 — см. docs/architecture/component-articles-map.md
	//
	// Разметку и поведение отдаёт общий CatalogSidebar. Здесь остаётся только то,
	// что есть у мебели и нет у других рубрик: категории — настоящий справочник в
	// БД, их можно включать/выключать и добавлять в них проекты.
	import { invalidateAll } from '$app/navigation';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import { toggleCategory, type EditContext } from '$lib/utils/page-edit';
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
	let togglingIds = $state(new Set<string>());

	function openAddModal(categoryId: string, e: Event) {
		e.preventDefault();
		e.stopPropagation();
		addCategoryId = categoryId;
		isModalOpen = true;
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

	/**
	 * Статика на случай пустого блока в БД — те же категории, что сейчас лежат
	 * в справочнике. Без id: переключать и наполнять можно только реальные записи.
	 */
	const DEFAULT_CATEGORIES = [
		{ value: 'Кухни', slug: 'kitchens' },
		{ value: 'Шкафы', slug: 'wardrobes' },
		{ value: 'Гардеробные', slug: 'dressing-rooms' },
		{ value: 'Прихожие', slug: 'hallways' }
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
	{@const isEnabled = category.is_enabled !== false}
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

		<button
			type="button"
			onclick={(e) => handleToggleCategory(category.id, isEnabled, e)}
			disabled={togglingIds.has(category.id)}
			class="ms-switch"
			class:ms-switch--on={isEnabled}
			title={isEnabled ? 'Скрыть категорию' : 'Показать категорию'}
			aria-label={isEnabled ? 'Скрыть категорию' : 'Показать категорию'}
			aria-pressed={isEnabled}
		>
			<span class="ms-knob">
				{#if togglingIds.has(category.id)}
					<svg class="ms-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						></path>
					</svg>
				{/if}
			</span>
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

	.ms-switch {
		position: relative;
		display: inline-flex;
		flex: none;
		align-items: center;
		width: 36px;
		height: 20px;
		padding: 2px;
		border-radius: 999px;
		background: #cbd5e1;
		cursor: pointer;
		transition: background-color 0.25s ease;
	}

	.ms-switch--on {
		background: #0ea5e9;
	}

	.ms-switch:focus-visible {
		outline: 2px solid #0ea5e9;
		outline-offset: 2px;
	}

	.ms-switch:disabled {
		cursor: default;
	}

	.ms-knob {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border-radius: 999px;
		background: #ffffff;
		box-shadow: 0 1px 2px rgb(15 23 42 / 0.2);
		transform: translateX(0);
		transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
		pointer-events: none;
	}

	.ms-switch--on .ms-knob {
		transform: translateX(16px);
	}

	.ms-spinner {
		width: 10px;
		height: 10px;
		color: #0ea5e9;
		animation: ms-spin 0.8s linear infinite;
	}

	@keyframes ms-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.ms-add,
		.ms-knob {
			transition-duration: 0.01ms;
		}
	}
</style>
