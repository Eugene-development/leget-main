<script lang="ts">
	import { auth } from '$lib/stores/auth';
	import { browser } from '$app/environment';
	import {
		saveLayoutData,
		COMPONENT_ARTICLES_CONTEXT,
		type ComponentArticle,
		type ComponentArticleLookup,
		type EditContext,
		type PageSeoData
	} from '$lib/utils/page-edit';
	import { setContext } from 'svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import LayoutImageSettings from '$lib/components/LayoutImageSettings.svelte';
	import PageSeoSettings from '$lib/components/PageSeoSettings.svelte';
	import YandexDirectGoalsButton from '$lib/components/YandexDirectGoalsButton.svelte';
	import SiteSettingsButton from '$lib/components/SiteSettingsButton.svelte';
	import SiteAnalytics from '$lib/components/SiteAnalytics.svelte';
	import EditableComponent from '$lib/components/EditableComponent.svelte';
	import {
		createEditableVisibility,
		EDITABLE_VISIBILITY_CONTEXT
	} from '$lib/utils/editable-visibility.svelte';
	import { siteAppearanceStyle } from '$lib/site-settings/appearance';
	import type { ComponentMap, TemplateLayout } from '$lib/components/templates/types';

	interface PageComponent {
		id?: string | null;
		type: string;
		catalog?: ComponentArticle | null;
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
		actionCards = null,
		seo = null,
		editContext = null,
		ownerId = null
	}: {
		layout: TemplateLayout;
		componentMap: ComponentMap;
		slug: string | null;
		components: PageComponent[];
		headerData: Record<string, unknown> | null;
		footerData: Record<string, unknown> | null;
		/**
		 * Сохранённые карточки акций страницы `/actions` (`site.actionCards`).
		 * Полоса акций стоит на каждой странице, а карточки лежат на одной,
		 * поэтому список приходит вместе с настройками сайта, а не с блоками.
		 */
		actionCards?: unknown;
		seo: PageSeoData | null;
		editContext: EditContext | null;
		/** id владельца лицензии этого сайта — из renderPage. */
		ownerId?: string | null;
	} = $props();

	// Метаданные из renderPage доступны синхронно и не попадают в bind:data.
	// Getter читает актуальный prop и при навигации, и после invalidateAll.
	setContext<ComponentArticleLookup>(
		COMPONENT_ARTICLES_CONTEXT,
		(type) => components.find((component) => component.type === type)?.catalog ?? null
	);

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

	// Banner и Header — соседние layout-компоненты одного headerData blob.
	// Один общий менеджер сериализует их переключения и не даёт двум запросам
	// видимости перезаписать друг друга при быстрых кликах в разных секциях.
	const layoutVisibility = createEditableVisibility({
		getComponentType: () => 'Header',
		getData: () => headerDataState,
		setData: (next) => (headerDataState = next),
		getEditContext: () => editContext,
		save: (context, _componentType, next) => saveLayoutData(context, 'Header', next)
	});
	setContext(EDITABLE_VISIBILITY_CONTEXT, layoutVisibility);

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
		'Direction',
		'PartnerOffers',
		'ProjectsFeed'
	]);
	// У сайдбара контрол одноверсионных настроек находится в его собственной шапке:
	// внешний overlay здесь дал бы кнопку вне fixed-карточки.
	const promo1ComponentsWithEmbeddedSingleVersionSettings = new Set([
		'MebelSidebar',
		'ByttehnikaSidebar',
		'StoleshnicaSidebar',
		'SantehnikaSidebar',
		'FurnituraSidebar',
		'PliitkaSidebar',
		'ProjectsHero',
		'VacancyList',
		'VacancyForm'
	]);

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

	// Вход/выход НЕ вызывают invalidateAll(). Серверная загрузка (loadRenderPage)
	// ходит в leget-api без токена — она отдаёт один и тот же ответ гостю и
	// владельцу, поэтому рефетч после входа не приносил ни одного нового байта.
	// Стоил он при этом полного круга до API и второго прохода рендера всех
	// блоков (`components` приезжали новыми объектами) ровно в тот момент, когда
	// поток и так занят разворачиванием интерфейса редактирования, — это и была
	// «заметная задержка» после входа. Режим редактирования включается чисто
	// клиентски, по флагу ниже.
	//
	// Владение сайтом тоже проверяется здесь, на клиенте, и по той же причине:
	// ответ renderPage одинаков для всех и кэшируется в API одним куском, так что
	// «владелец ли ты» сервер сказать не может — он присылает ownerId, а сверять
	// его с сессией некому, кроме браузера. Раньше сверки не было вовсе, и любой
	// зарегистрированный пользователь платформы, войдя через футер на ЧУЖОМ сайте,
	// видел там интерфейс редактора; сохранения при этом падали с AUTHORIZATION —
	// владение проверяет UpsertPageComponent и соседние мутации. Здесь снимается
	// именно этот косметический слой, серверная проверка остаётся источником истины.
	//
	// Незнакомый id (гость, чужой аккаунт, отсутствующий ownerId в ответе старого
	// API) выключает редактор — правило закрытое по умолчанию.
	const isOwner = $derived(
		Boolean(ownerId) && $auth.userId !== null && String($auth.userId) === String(ownerId)
	);

	const isEditable = $derived(
		browser && $auth.isAuthenticated && isOwner && (editContext !== null || slug !== null) // Allow editing if we have a slug as fallback
	);

	const PromoStrip = $derived(layout.PromoStrip ?? null);
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

<div class="contents" style={siteAppearanceStyle(headerDataState.siteAppearance)}>
	<SiteAnalytics data={headerDataState} />

	{#if PromoStrip}
		<!-- Полоса акций — над баннером. bind по той же причине, что у баннера:
	     версия и тема полосы лежат в том же headerData. -->
		<PromoStrip bind:data={headerDataState} {editContext} {isEditable} {actionCards} />
	{/if}

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
				<EditableComponent
					component={Component}
					componentType={element.type}
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
		{#snippet pageSettings(triggerClass: string)}
			<PageSeoSettings {seo} {editContext} {isEditable} {triggerClass} />
			<YandexDirectGoalsButton {isEditable} {triggerClass} />
			<SiteSettingsButton {isEditable} {triggerClass} licenseId={editContext?.licenseId ?? null} />
		{/snippet}
		<div class="relative">
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
				{pageSettings}
			/>
		</div>
	{/if}

	{#if isEditable}
		<EditModal />
	{/if}
</div>
