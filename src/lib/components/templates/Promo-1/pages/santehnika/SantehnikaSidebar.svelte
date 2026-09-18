<script lang="ts">
	// Артикулы: 1.21.1.1, 1.31.1.1 — см. docs/architecture/component-articles-map.md
	// Разметку и поведение отдаёт общий CatalogSidebar. Бренды — справочник в БД
	// (категории рубрики «santehnika»), поэтому у пунктов есть тумблер
	// включения, как у брендов бытовой техники.
	import { goto, invalidateAll } from '$app/navigation';
	import BrandModal, { type Brand } from '../bytovaya-tehnika/BrandModal.svelte';
	import MebelTagModal from '../mebel/MebelTagModal.svelte';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import { type EditContext } from '$lib/utils/page-edit';
	import CatalogSidebar from '../_shared/CatalogSidebar.svelte';

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

	/**
	 * Демо-данные для превью без API. Рабочий список приходит из справочника,
	 * который синхронизируется из leget-db/config/catalog.php. Пустой ответ
	 * API остаётся пустым; тумблер работает только у записей с id.
	 */
	const DEFAULT_BRANDS = [
		{ title: 'Blanco', slug: 'blanco' },
		{ title: 'Grohe', slug: 'grohe' },
		{ title: 'Hansgrohe', slug: 'hansgrohe' },
		{ title: 'Franke', slug: 'franke' },
		{ title: 'Omoikiri', slug: 'omoikiri' },
		{ title: 'EMAR', slug: 'emar' },
		{ title: 'Florentina', slug: 'florentina' },
		{ title: 'Paulmark', slug: 'paulmark' },
		{ title: 'Pereal', slug: 'pereal' }
	];
	let modalOpen = $state(false);
	let tagModalOpen = $state(false);
	let selectedBrand = $state<Brand | null>(null);
	function editBrand(brand: Brand | null) {
		selectedBrand = brand;
		modalOpen = true;
	}
	async function saved(deleted: boolean, slug?: string) {
		modalOpen = false;
		if (deleted && window.location.pathname === `/santehnika/${slug}`) {
			await goto('/santehnika', { invalidateAll: true });
		} else {
			await invalidateAll();
		}
	}
</script>

{#if isEditable && editContext && modalOpen}
	<BrandModal
		rubric="PLUMBING"
		brand={selectedBrand}
		licenseId={editContext.licenseId}
		onClose={() => (modalOpen = false)}
		onSaved={saved}
	/>
{/if}
{#if isEditable && tagModalOpen}
	<MebelTagModal
		title="Теги брендов сантехники"
		target="брендов"
		groupSlugs={['plumbing-type']}
		onClose={() => (tagModalOpen = false)}
		onChanged={() => {
			void invalidateAll();
		}}
	/>
{/if}

<CatalogSidebar
	bind:data
	{editContext}
	{isEditable}
	componentType="SantehnikaSidebar"
	settings={componentSettings}
	headerActions={addBrand}
	itemActions={brandActions}
	itemsKey="brands"
	basePath="/santehnika"
	defaultTitle="Бренды"
	defaultItems={DEFAULT_BRANDS}
	fabLabel="Бренды"
	emptyText="Бренды появятся здесь"
	accent="sky"
	showDisabledBadge={false}
	canToggleItems
	itemNoun="бренд"
	cta={{
		title: 'Подбор сантехники',
		text: 'Поможем выбрать мойку и смеситель под ваш проект',
		button: 'Подобрать комплект'
	}}
/>

{#snippet componentSettings()}
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="SantehnikaSidebar"
		resetId={componentId}
		placement="inline"
		controlActions={tagActions}
	/>
{/snippet}

{#snippet addBrand()}
	<button
		type="button"
		data-goal-ignore="Добавление бренда в редакторе"
		onclick={() => editBrand(null)}
		aria-label="Добавить бренд"
		title="Добавить бренд"
		class="flex size-11 shrink-0 items-center justify-center rounded-lg border border-ink-300 text-link-700 hover:bg-ink-100 focus-visible:outline-link-500"
	>
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			aria-hidden="true"><path d="M12 4v16M4 12h16" /></svg
		>
	</button>
{/snippet}
{#snippet brandActions(brand: any)}
	{#if brand.id}
		<button
			type="button"
			data-goal-ignore="Редактирование бренда в каталоге"
			onclick={() => editBrand(brand)}
			aria-label={`Редактировать бренд «${brand.value}»`}
			title="Редактировать бренд"
			class="flex size-8 shrink-0 items-center justify-center rounded-lg text-link-700 hover:bg-ink-100 focus-visible:outline-link-500"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				aria-hidden="true"><path d="m16 3 5 5L9 20l-6 1 1-6L16 3Zm-3 3 5 5" /></svg
			>
		</button>
	{/if}
{/snippet}
{#snippet tagActions()}
	<button
		type="button"
		data-goal-ignore="Управление тегами брендов"
		onclick={() => (tagModalOpen = true)}
		class="min-h-11 rounded-lg border border-on-dark/20 px-3 py-2 text-sm text-on-dark hover:bg-on-dark/10 focus-visible:outline-link-500"
		>Управление тегами</button
	>
{/snippet}
