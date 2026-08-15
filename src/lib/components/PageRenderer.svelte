<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { browser } from '$app/environment';
	import type { EditContext } from '$lib/utils/page-edit';
	import { invalidateAll } from '$app/navigation';
	import EditModal from '$lib/components/EditModal.svelte';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import LayoutImageSettings from '$lib/components/LayoutImageSettings.svelte';
	import type { ComponentMap, TemplateLayout } from '$lib/components/templates/types';

	interface PageComponent {
		id?: string | null;
		type: string;
		data: Record<string, unknown>;
	}

	/**
	 * Рендер страницы по готовым layout'у и карте блоков.
	 *
	 * Сам ничего не импортирует из шаблонов — что рендерить, решает вызывающая
	 * сторона. Благодаря этому маршрут отдельной страницы (src/routes/guarantees
	 * и т.п.) тянет в свой чанк только свои блоки, а не реестр всех страниц всех
	 * шаблонов. Для страниц без своего маршрута ту же работу делает
	 * ComponentResolver — он резолвит шаблон по templateId и зовёт этот компонент.
	 */
	let {
		layout,
		componentMap,
		slug = null,
		components = [],
		headerData = null,
		footerData = null,
		editContext = null
	}: {
		layout: TemplateLayout;
		componentMap: ComponentMap;
		slug: string | null;
		components: PageComponent[];
		headerData: Record<string, unknown> | null;
		footerData: Record<string, unknown> | null;
		editContext: EditContext | null;
	} = $props();

	// Локальное состояние-зеркало headerData. Нужно для мгновенной реактивности:
	// Header обновляет disabledRubrics/disabledServices через handleToggleRubric и
	// присваивает `data = updatedData`. Чтобы Footer увидел это изменение без
	// перезагрузки, прокидываем в Header через bind:, а Footer читает из того же
	// стейта. $effect синхронизирует зеркало с внешним пропсом на случай обновления
	// данных с сервера (например, invalidateAll после сброса блока).
	// Начальное значение берём из пропса ПРИ ИНИЦИАЛИЗАЦИИ, а не только в $effect:
	// на сервере эффекты не выполняются, и с пустым зеркалом SSR отдавал баннеру,
	// хэдеру и bridge-полям футера дефолты вместо сохранённых данных — реальный
	// номер телефона появлялся только после гидратации.
	// svelte-ignore state_referenced_locally — начальный SSR-снимок намеренный;
	// последующие изменения входного prop синхронизирует $effect ниже.
	let headerDataState = $state<Record<string, unknown>>(headerData ?? {});
	$effect(() => {
		headerDataState = headerData ?? {};
	});

	// Зеркало списка блоков — по той же причине, что и headerDataState.
	// `components` приходит пропсом из серверной загрузки: это обычные объекты, а не
	// $state-прокси. Запись `data = updated` внутри блока уходит по цепочке bind: в
	// `element.data`, но у обычного объекта нет сигнала — ни один $derived, читающий
	// `data`, не пересчитывался, и изменение проявлялось только после invalidateAll
	// или навигации. Из-за этого «зависал» переключатель темы у HeroMain (единственная
	// функция, которой нужен именно write-back в data: текст рисуется из editStore,
	// а версия — из локального selectedVersion). Через $state-зеркало запись видна сразу.
	// Как и у headerDataState, начальное значение берём из пропса ПРИ ИНИЦИАЛИЗАЦИИ:
	// с пустым зеркалом на сервере (эффекты там не выполняются) pageComponents был пуст,
	// и ни один page-блок не попадал в SSR-разметку — у всех страниц всех шаблонов было
	// пустое тело для поисковиков.
	// svelte-ignore state_referenced_locally — начальный SSR-снимок намеренный;
	// последующие изменения входного prop синхронизирует $effect ниже.
	let componentsState = $state<PageComponent[]>(components ?? []);
	$effect(() => {
		componentsState = components ?? [];
	});

	// Единственные многоверсионные компоненты Promo-1 (ground truth совпадает с
	// leget-api/config/component_variants.php). Они уже рендерят VersionSwitcher
	// внутри своих index.svelte; всем остальным нужен одноверсионный контрол ниже.
	const promo1ComponentsWithSwitcher = new Set([
		'HeroMain',
		'ActionsCTA',
		'Message',
		'PromoOffer',
		'Equipment',
		'Stage',
		'Incentives',
		'Brands',
		'ContactCTA',
		'ContactsHero',
		'Direction'
	]);
	// У сайдбара контрол одноверсионных настроек находится в его собственной шапке:
	// внешний overlay здесь дал бы кнопку вне fixed-карточки.
	const promo1ComponentsWithEmbeddedSingleVersionSettings = new Set(['MebelSidebar']);

	function componentHasOwnSwitcher(type: string): boolean {
		return Number(editContext?.templateId) === 1 && promo1ComponentsWithSwitcher.has(type);
	}

	function componentHasEmbeddedSingleVersionSettings(type: string): boolean {
		return (
			Number(editContext?.templateId) === 1 &&
			promo1ComponentsWithEmbeddedSingleVersionSettings.has(type)
		);
	}

	function singleVersionKey(type: string): string {
		return `${type.charAt(0).toLowerCase() + type.slice(1)}Version`;
	}

	function isSingleVersionDisabled(element: PageComponent): boolean {
		return (
			!componentHasOwnSwitcher(element.type) &&
			element.data?.[singleVersionKey(element.type)] === 'disabled'
		);
	}

	const SINGLE_VERSION_THEME_DEFAULTS: Record<string, 'light' | 'dark'> = {
		'/actions:Hero': 'dark',
		'/actions:ActionsCards': 'light',
		'/actions:ActionsCardsExtra': 'light',
		'/actions:ActionsBanner': 'light',
		'/about:Hero': 'dark',
		'/about:Text': 'light',
		'/about:Statistics': 'light',
		'/about:Mission': 'light',
		'/about:Values': 'light',
		'/about:WhyUs': 'dark',
		'/about:AboutCTA': 'light',
		'/contacts:ContactChannels': 'light',
		'/contacts:ContactAddress': 'light',
		'/contacts:ContactMessengers': 'light',
		'/partnership:PartnershipHero': 'dark',
		'/partnership:WhoWeInvite': 'light',
		'/partnership:ForManufacturers': 'dark',
		'/partnership:Benefits': 'light',
		'/partnership:HowToStart': 'light',
		'/partnership:PartnershipCTA': 'dark'
	};

	function singleVersionThemeDefault(type: string): 'light' | 'dark' | null {
		return SINGLE_VERSION_THEME_DEFAULTS[`${slug}:${type}`] ?? null;
	}

	// Инициализируем auth в браузере
	$effect(() => {
		if (browser) {
			auth.init();
		}
	});

	let previousAuth = $state<boolean | null>(null);
	$effect(() => {
		if (browser) {
			if (previousAuth !== null && previousAuth !== $auth.isAuthenticated) {
				invalidateAll();
			}
			previousAuth = $auth.isAuthenticated;
		}
	});

	const isEditable = $derived(
		browser && $auth.isAuthenticated && (editContext !== null || slug !== null) // Allow editing if we have a slug as fallback
	);

	const Banner = $derived(layout.Banner ?? null);
	const Header = $derived(layout.Header ?? null);
	const Footer = $derived(layout.Footer ?? null);

	// Footer (Promo-1) — теперь page-компонент на глобальной странице '__global__':
	// ищем его среди компонентов. Если есть — рендерим из него (с настоящим id/`_componentId`),
	// иначе fallback на старый footerData (для шаблонов без компонентного футера).
	const footerComponent = $derived(componentsState.find((c) => c.type === 'Footer') ?? null);
	// Апсёрт футера всегда идёт на глобальную страницу, независимо от текущей.
	const footerEditContext = $derived(
		editContext ? { ...editContext, pageId: 'slug:__global__', slug: '__global__' } : null
	);
	// Компоненты текущей страницы без футера — он рендерится отдельно (внизу).
	const pageComponents = $derived(componentsState.filter((c) => c.type !== 'Footer'));
</script>

{#if Banner}
	<!-- bind нужен не только редактору баннера: после сохранения телефона тот же
	     реактивный headerDataState сразу обновляет CTA и футер без перезагрузки. -->
	<Banner bind:data={headerDataState} {editContext} {isEditable} />
{/if}

{#if Header}
	<!-- Не оборачиваем публичный/Promo-1 header в короткий positioning-контейнер:
	     он ограничивает sticky высотой шапки, а сайдбар рассчитывает top от её положения. -->
	{#if isEditable && editContext && Number(editContext.templateId) !== 1}
		<div class="relative">
			<Header bind:data={headerDataState} {editContext} {isEditable} />
			<LayoutImageSettings
				bind:data={headerDataState}
				{editContext}
				{isEditable}
				slots={Number(editContext.templateId) === 0
					? [{ path: ['logo'], label: 'Логотип' }]
					: [{ path: ['logoUrl'], label: 'Логотип' }]}
			/>
		</div>
	{:else}
		<Header bind:data={headerDataState} {editContext} {isEditable} />
	{/if}
{/if}

{#each pageComponents as element (element.type)}
	{@const Component = componentMap[element.type] ?? null}
	{@const singleThemeDefault = singleVersionThemeDefault(element.type)}
	{#if Component && (isEditable || !isSingleVersionDisabled(element))}
		<div
			class="group/component relative {isSingleVersionDisabled(element)
				? 'opacity-40 grayscale'
				: ''}"
		>
			<!-- sitePhone — мост из layout-данных, как bridge-поля у футера ниже: блокам
			     с кнопкой «Позвонить» нужен тот же номер, что в баннере хэдера. Отдельным
			     пропсом, а НЕ подмешиванием в element.data: saveComponentData пишет blob
			     целиком, и подмешанный номер осел бы копией в данных блока при первой же
			     правке любого поля — после смены номера в баннере копии разошлись бы. -->
			<Component
				bind:data={element.data}
				{editContext}
				{isEditable}
				componentId={String(element.data?._componentId ?? element.id ?? '') || null}
				sitePhone={typeof headerDataState.phone === 'string' ? headerDataState.phone : null}
			/>

			{#if !componentHasOwnSwitcher(element.type) && !componentHasEmbeddedSingleVersionSettings(element.type)}
				<SingleVersionSettings
					bind:data={element.data}
					{editContext}
					{isEditable}
					componentType={element.type}
					resetId={String(element.data?._componentId ?? element.id ?? '') || null}
					themeToggle={singleThemeDefault !== null}
					themeDefault={singleThemeDefault ?? 'light'}
				/>
			{/if}
		</div>
	{/if}
{/each}

{#if Footer}
	<Footer
		sitePhone={typeof headerDataState.phone === 'string' ? headerDataState.phone : null}
		data={footerComponent
			? {
					// Компонентный футер: bridge-поля хэдера последними → живой хэдер перекрывает
					// возможные устаревшие копии из сохранённых данных компонента.
					...footerComponent.data,
					logoUrl: headerDataState.logoUrl,
					disabledRubrics: headerDataState.disabledRubrics,
					disabledServices: headerDataState.disabledServices
				}
			: {
					logoUrl: headerDataState.logoUrl,
					disabledRubrics: headerDataState.disabledRubrics,
					disabledServices: headerDataState.disabledServices,
					...footerData
				}}
		editContext={footerComponent ? footerEditContext : editContext}
		{isEditable}
	/>
{/if}

{#if isEditable}
	<EditModal />
{/if}
