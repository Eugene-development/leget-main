<script lang="ts">
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cityStore } from '$lib/stores/city.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import ClientAuthButtons from '$lib/components/ClientAuthButtons.svelte';
	import IconHint from '$lib/components/IconHint.svelte';
	import { editStore } from '$lib/stores/edit.svelte';
	import { saveLayoutData, type EditContext } from '$lib/utils/page-edit';
	import { catalogItems } from './catalogItems';
	import { serviceItems } from './serviceItems';
	import { resolveBannerLinks, resolveContactsLink } from './bannerLinks';
	import { resolveSitePhone, sitePhoneHref } from '$lib/utils/site-phone';
	import { uiStore } from '$lib/stores/ui.svelte';
	import Menu from './Menu/index.svelte';
	import MobileMenu from './Menu/Mobile.svelte';

	let {
		data = $bindable({}),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext: EditContext | null;
		isEditable: boolean;
	} = $props();

	const siteName = $derived(typeof data?.siteName === 'string' ? data.siteName : 'Логотип');
	const links = $derived(
		Array.isArray(data?.links) && (data.links as unknown[]).length > 0
			? (data.links as { href: string; label: string }[])
			: [
					{ href: '/', label: 'Главная' },
					{ href: '/catalog', label: 'Каталог' },
					{ href: '/services', label: 'Услуги' },
					// Страница 26 шаблона: те же работы, что в рубрике «Мебель»
					// каталога, но сплошной лентой. Заведена 24.08.2026 —
					// см. pages/projects/ и config/templates.php в leget-api.
					{ href: '/projects', label: 'Проекты' }
					// «Акции» сняты со строки меню 25.08.2026. Страница осталась
					// (`pages/actions/`), и путей к ней по-прежнему два: футер
					// («Информация» в v1/v2, «Компания» в v3) и промо-полоса.
					// «Контакты» переехали в баннер, правее «Гарантий»: там строка
					// второстепенных ссылок, и контакты стоят рядом с телефоном и почтой.
					// Список у баннера и меню общий (`headerData.links`), поэтому
					// расходятся они только дефолтами — у тенанта, который список уже
					// правил, останется его собственный.
				]
	);

	// Локальное состояние списков отключённых рубрик/услуг.
	//
	// data — bindable-пропс, но ComponentResolver передаёт его БЕЗ bind:, поэтому
	// присваивание `data = updatedData` не гарантирует ре-рендер зависимых $derived.
	// Чтобы переключатели реагировали мгновенно, храним списки в явном $state
	// и синхронизируем их с data через $effect (на случай external-обновления data,
	// например после invalidateAll). UI читает именно эти переменные.
	let disabledRubrics = $state<string[]>([]);
	let disabledServices = $state<string[]>([]);

	$effect(() => {
		const r = Array.isArray(data?.disabledRubrics) ? (data.disabledRubrics as string[]) : [];
		const next = [...r].sort();
		const cur = [...disabledRubrics].sort();
		if (next.join('\u0001') !== cur.join('\u0001')) {
			disabledRubrics = [...r];
		}
	});
	$effect(() => {
		const s = Array.isArray(data?.disabledServices) ? (data.disabledServices as string[]) : [];
		const next = [...s].sort();
		const cur = [...disabledServices].sort();
		if (next.join('\u0001') !== cur.join('\u0001')) {
			disabledServices = [...s];
		}
	});

	const visibleCatalogItems = $derived(
		catalogItems.filter(
			(item) => item.comingSoon === true || isEditable || !disabledRubrics.includes(item.href)
		)
	);

	const visibleServiceItems = $derived(
		serviceItems.filter(
			(item) => item.comingSoon === true || isEditable || !disabledServices.includes(item.href)
		)
	);

	async function handleToggleRubric(href: string, currentEnabled: boolean, e: Event) {
		e.preventDefault();
		e.stopPropagation();

		// Мгновенный отклик UI: обновляем локальный $state синхронно.
		disabledRubrics = currentEnabled
			? [...disabledRubrics, href]
			: disabledRubrics.filter((h) => h !== href);

		if (!editContext) return;
		const updatedData = { ...data, disabledRubrics };
		data = updatedData;
		try {
			await saveLayoutData(editContext, 'Header', updatedData);
		} catch (err: any) {
			// Откатываем локальное состояние при ошибке сохранения.
			disabledRubrics = currentEnabled
				? disabledRubrics.filter((h) => h !== href)
				: [...disabledRubrics, href];
			data = { ...data, disabledRubrics };
			console.error('Failed to toggle rubric:', err);
			alert('Не удалось сохранить настройки каталога: ' + (err.message || 'ошибка'));
		}
	}

	// Переключатель видимости услуги. Симметричен handleToggleRubric, но пишет
	// в disabledServices — отдельный список, чтобы каталог и услуги управлялись независимо.
	async function handleToggleService(href: string, currentEnabled: boolean, e: Event) {
		e.preventDefault();
		e.stopPropagation();

		// Мгновенный отклик UI: обновляем локальный $state синхронно.
		disabledServices = currentEnabled
			? [...disabledServices, href]
			: disabledServices.filter((h) => h !== href);

		if (!editContext) return;
		const updatedData = { ...data, disabledServices };
		data = updatedData;
		try {
			await saveLayoutData(editContext, 'Header', updatedData);
		} catch (err: any) {
			// Откатываем локальное состояние при ошибке сохранения.
			disabledServices = currentEnabled
				? disabledServices.filter((h) => h !== href)
				: [...disabledServices, href];
			data = { ...data, disabledServices };
			console.error('Failed to toggle service:', err);
			alert('Не удалось сохранить настройки услуг: ' + (err.message || 'ошибка'));
		}
	}

	let headerEl: HTMLElement;
	let visibleCityMenu = $state(false);

	// Публикуем реальную высоту хедера как CSS-переменную --header-h на :root.
	// Hero-компоненты используют её для вычисления calc(100dvh - var(--header-h)).
	$effect(() => {
		if (!headerEl) return;
		const update = () =>
			document.documentElement.style.setProperty('--header-h', headerEl.offsetHeight + 'px');
		update();
		const ro = new ResizeObserver(update);
		ro.observe(headerEl);
		return () => ro.disconnect();
	});
	const defaultCities = [
		'Москва и МО',
		'Санкт-Петербург',
		'Новосибирск',
		'Екатеринбург',
		'Казань',
		'Нижний Новгород'
	];

	const citiesRaw = $derived(
		typeof data?.cities === 'string' ? data.cities : defaultCities.join('\n')
	);
	const cities = $derived(
		citiesRaw
			.split('\n')
			.filter(Boolean)
			.map((c) => ({ label: c.trim() }))
	);

	// Ссылка «Избранное» лежит в том же header_data blob'е, что и контакты баннера
	// (ключ favoritesHref) — сам значок переехал из баннера в строку меню, правее города.
	const favoritesHref = $derived(String(data?.favoritesHref ?? '/favorites'));

	// Подпись логотипа в мобильной строке: та же подмена, что в десктопном
	// замке, — «Новострой» осталось дефолтом старых лицензий и названием
	// сайта не является.
	const logoLabel = $derived(
		!data?.siteName || data.siteName === 'Новострой' ? 'Логотип' : String(data.siteName)
	);

	// Телефон, почта и «Контакты» — данные баннера, но живут они в том же
	// blob'е `headerData` (баннер сохраняет их через saveLayoutData('Header')),
	// поэтому шапке достаточно прочитать их отсюда. Нужны они с 25.08.2026:
	// телефон стоит в мобильной строке, почта и «Контакты» — в листе меню,
	// куда они переехали из полосы баннера. Дефолты — те же, что у баннера.
	// Номер идёт через общий резолвер, как в подвале и на страницах: он же
	// несёт фолбэк, а `tel:` собирается из цифр — со скобками и пробелами
	// в href часть телефонов не набирается.
	const sitePhone = $derived(resolveSitePhone(data?.phone as string | undefined));
	const phoneHref = $derived(sitePhoneHref(sitePhone));
	const email = $derived(data?.email ? String(data.email) : 'info@leget.ru');
	const contactsLink = $derived(resolveContactsLink(data));
	const informationLinks = $derived(resolveBannerLinks(data));

	// Мобильная строка: её нижняя кромка — верх листа меню.
	let mobileBarEl: HTMLElement | undefined = $state();
	let burgerEl: HTMLButtonElement | undefined = $state();

	/**
	 * Пока лист открыт: он садится на нижнюю кромку строки, а страница под ним
	 * не прокручивается.
	 *
	 * Своего `top` лист вычислить не может: `position: fixed` считает от окна,
	 * а строка стоит то на 48px ниже (полоса акций видна), то в нуле (шапка
	 * прилипла). Замер идёт здесь, потому что строка принадлежит хэдеру, и
	 * публикуется переменной — так им пользуется любая из четырёх версий меню,
	 * не получая проп.
	 *
	 * Прокрутка страницы гасится и на `html`, и на `body`: разные браузеры
	 * прокручивают разный элемент. Без этого прокруток две, одна внутри
	 * другой, — ровно то, чем была выпадающая панель на `max-h-[70dvh]`.
	 *
	 * Сторож ширины сидит в этом же замере, а не отдельным слушателем
	 * `matchMedia`. Причина в цене ошибки: `overflow: hidden` на `html` — это
	 * страница, которую нельзя прокрутить, и если сигнал о переходе через `lg`
	 * не придёт, сайт останется намертво. Поэтому сторожем работает сам бокс
	 * строки: с `lg` она уходит в `display: none`, её прямоугольник схлопывается
	 * в ноль, и `ResizeObserver` — тот же, что нужен для замера, — снимает
	 * блокировку и закрывает лист. Одно наблюдение вместо двух источников
	 * правды, и то же наблюдение чинит поворот экрана.
	 */
	$effect(() => {
		if (!uiStore.menuOpen) return;
		const bar = mobileBarEl;
		if (!bar) return;

		const root = document.documentElement;
		const prevRootOverflow = root.style.overflow;
		const prevBodyOverflow = document.body.style.overflow;
		let locked = false;

		const unlock = () => {
			if (!locked) return;
			root.style.overflow = prevRootOverflow;
			document.body.style.overflow = prevBodyOverflow;
			locked = false;
		};

		const sync = () => {
			const rect = bar.getBoundingClientRect();

			// Строки нет в раскладке — значит, нет и мобильного слоя.
			if (rect.height === 0) {
				unlock();
				uiStore.closeMenu();
				return;
			}

			root.style.setProperty('--p1-sheet-top', Math.max(0, Math.round(rect.bottom)) + 'px');
			if (!locked) {
				root.style.overflow = 'hidden';
				document.body.style.overflow = 'hidden';
				locked = true;
			}
		};

		sync();
		const ro = new ResizeObserver(sync);
		ro.observe(bar);

		return () => {
			ro.disconnect();
			unlock();
			root.style.removeProperty('--p1-sheet-top');
		};
	});

	// Escape закрывает лист и возвращает фокус на бургер — то же правило, что
	// у выпадающих панелей десктопного меню.
	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !uiStore.menuOpen) return;
		uiStore.closeMenu();
		burgerEl?.focus();
	}

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveLayoutData(editContext, 'Header', updated);
		data = updated;
	}
</script>

<!--
	Гарнитур здесь больше нет. До 26.08.2026 отсюда блокирующей ссылкой на
	fonts.googleapis.com грузились Jost, Playfair Display и Outfit — три
	семейства, которых нет ни в одной дизайн-системе и которые применялись
	в блоках литералом, мимо `--ds-font-*`. Разбор — в DESIGN.md, Typography.
-->

<svelte:window onkeydown={handleKeydown} />

<header
	bind:this={headerEl}
	class="sticky top-0 z-[150] w-full lg:bg-surface-raised/95 lg:shadow-lg lg:backdrop-blur"
>
	<!--
		Строка десктопа — с lg, не с sm.

		До 24.08.2026 граница «мобильное / десктопное» в шаблоне была проведена
		дважды и в разных местах: строка хэдера и меню включались с sm (640px),
		а мобильная полоса баннера с её логотипом, избранным и бургером жила до
		lg (1024px). В зазоре 640–1023px оба слоя рисовались разом, и это давало
		три дефекта сразу (замеры на 640px и 794px):
		  • строка не помещалась — переполнение страницы 107px на 640px;
		  • логотип показывался трижды, избранное дважды;
		  • бургер был мёртвой кнопкой: панель мобильного меню объявлена
		    `sm:hidden`, то есть на 640–1023 клик не открывал ничего.

		Теперь граница одна — lg, та же, что у мобильной полосы баннера.
		Ниже неё работает мобильный слой (полоса + бургер + панель), выше —
		десктопный (эта строка + меню + строка ссылок баннера).
	-->
	<div class="max-w-9xl mx-auto hidden items-center justify-between px-4 py-3 lg:flex lg:px-8">
		<!-- Левая часть: Логотип -->
		<div class="flex flex-1 justify-start">
			<a
				href="/"
				class="group relative z-30 -m-1.5 -mb-10 hidden min-w-[140px] flex-col items-center justify-center rounded-b-2xl bg-surface-raised px-6 py-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl lg:flex"
			>
				<span class="sr-only">{siteName}</span>
				{#if data?.logoUrl}
					<ImageFallback
						class="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
						src={String(data.logoUrl)}
						alt="Логотип {siteName}"
					/>
				{:else}
					<div class="flex flex-col items-center">
						<div
							class="mb-1 size-8 rounded-full bg-linear-to-tr from-link-400 to-cat-4-500 shadow-sm transition-transform duration-300 group-hover:scale-110"
						></div>
						<EditableField
							fieldKey="Header.siteName"
							label="Название сайта"
							value={!data?.siteName || data.siteName === 'Новострой'
								? 'Логотип'
								: String(data.siteName)}
							onSave={(val) => saveField('siteName', val)}
							{isEditable}
						>
							{#snippet children(displayValue)}
								<!--
									Роль, а не четыре утилиты. Кегль, начертание, разрежение и
									регистр у метки принадлежат системе с 19.08.2026 — здесь они
									оставались набраны руками (10px/900/0.2em/uppercase), то есть
									при смене системы подпись не менялась. Цвет остаётся утилитой:
									от темы блока он не зависит, зона хэдера темы не имеет.
								-->
								<span
									class="p1-label text-link-900 transition-transform duration-300 group-hover:scale-105"
								>
									{displayValue}
								</span>
							{/snippet}
						</EditableField>
					</div>
				{/if}
				<div
					class="absolute inset-0 rounded-b-2xl bg-linear-to-t from-link-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				></div>
			</a>
		</div>

		<!-- Центральная часть: Навигация (компонент Menu с переключением вариантов v1/v2/v3) -->
		<Menu
			bind:data
			{editContext}
			{isEditable}
			{links}
			{visibleCatalogItems}
			{visibleServiceItems}
			{disabledRubrics}
			{disabledServices}
			onToggleRubric={handleToggleRubric}
			onToggleService={handleToggleService}
		/>

		<!-- Правая часть: Выбор города + избранное + вход -->
		<div class="flex flex-1 items-center justify-end gap-3">
			<!-- Город -->
			<div
				role="group"
				class="relative hidden sm:block"
				onmouseenter={() => (visibleCityMenu = true)}
				onmouseleave={() => (visibleCityMenu = false)}
			>
				<button
					type="button"
					class="city-selector group relative flex h-11 items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-ink-100/20 to-ink-50/80 px-3 py-2.5 text-base font-medium whitespace-nowrap text-ink-700 ring-1 ring-ink-200/50 transition-all duration-300 hover:shadow-lg hover:shadow-link-500/10 hover:ring-link-200 xl:px-5"
					aria-expanded={visibleCityMenu}
					title={cityStore.city}
				>
					<span
						class="absolute inset-0 -z-10 bg-linear-to-r from-link-500 to-cat-5-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10"
					></span>

					<!-- Значок остаётся только там, где подписи нет: с xl её видно, и
					     указатель рядом с названием города ничего не добавляет; ниже xl
					     подпись уходит в `sr-only`, и он — единственное, по чему кнопку
					     можно узнать. -->
					<span class="flex items-center justify-center xl:hidden">
						<svg
							class="h-4 w-4 text-link-500 transition-transform duration-300 group-hover:scale-110"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</span>

					<!-- До xl подпись снимается с полосы: в правой зоне четыре кнопки, и
					     при развёрнутом городе строка хэдера на 1024px не помещается (замер:
					     переполнение 87px, город — 194px из них). Не `hidden`, а `sr-only`:
					     выбранный город остаётся в дереве доступности, а мышью его показывает
					     `title` кнопки. -->
					<span
						class="sr-only transition-colors duration-300 group-hover:text-link-600 xl:not-sr-only"
						>{cityStore.city}</span
					>

					<svg
						class="h-4 w-4 text-ink-400 transition-all duration-300 group-hover:text-link-500 {visibleCityMenu
							? 'rotate-180'
							: ''}"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>

				{#if visibleCityMenu}
					<div class="absolute top-full right-0 left-0 h-3"></div>
					<div
						transition:fly={{ y: -10, duration: 200, easing: cubicOut }}
						class="absolute top-full right-0 z-50 mt-3 w-48 overflow-hidden rounded-2xl bg-surface-raised p-2 shadow-xl ring-1 ring-ink-900/5"
					>
						<div
							class="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-link-500 to-transparent"
						></div>

						{#each cities as city, idx}
							<button
								type="button"
								onclick={() => {
									cityStore.set(city.label);
									visibleCityMenu = false;
								}}
								class="group flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left transition-all duration-200 hover:bg-linear-to-r hover:from-link-50 hover:to-cat-5-50"
								class:bg-link-50={cityStore.city === city.label}
								transition:fly={{ y: -5, duration: 150, delay: idx * 30 }}
							>
								<span
									class="text-sm font-medium transition-colors {cityStore.city === city.label
										? 'text-link-600'
										: 'text-ink-700'} group-hover:text-link-600">{city.label}</span
								>
								{#if cityStore.city === city.label}
									<svg
										class="h-4 w-4 text-link-500"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										/>
									</svg>
								{/if}
							</button>
						{/each}

						{#if isEditable}
							<div class="mt-2 border-t border-ink-100 pt-2">
								<button
									type="button"
									onclick={() => {
										editStore.open({
											key: 'Header.cities',
											label: 'Список городов (каждый с новой строки)',
											value: citiesRaw,
											multiline: true,
											onSave: (val) => saveField('cities', val)
										});
									}}
									class="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-ink-300 py-2 text-xs font-medium text-ink-400 transition-colors hover:border-link-300 hover:text-link-500"
								>
									Редактировать список
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Избранное -->
			<a
				href={favoritesHref}
				class="group relative flex items-center justify-center rounded-xl bg-linear-to-r from-ink-100/20 to-ink-50/80 p-3 ring-1 ring-ink-200/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-500/10 hover:ring-brand-200"
			>
				<span class="sr-only">Избранное</span>
				<IconHint text="Избранное" />
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-5 text-ink-500 transition-all duration-300 group-hover:scale-110 group-hover:text-brand-500"
				>
					<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
					<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
					></path>
				</svg>
			</a>

			<!-- Вход и регистрация клиента: значками, в одном ряду с «Избранным».
			     До 24.08.2026 стояли надписями в полосе баннера — там они были
			     единственной кнопкой среди строки контактов и читались как текст,
			     а не как действие. Состояние (гость / вошедший) приходит из
			     клиентской cookie, см. ClientAuthButtons. -->
			<!-- До lg значки входа не показываются: строка хэдера в диапазоне
			     640–1023px и без них переполнена (замер на 900px: 99px), а вход
			     на этих ширинах даёт мобильная полоса баннера — она как раз
			     живёт до lg. Дублирования нет ни на одной ширине. -->
			<div class="hidden items-center gap-3 lg:flex">
				<ClientAuthButtons />
			</div>
		</div>
	</div>

	<!--
		Мобильная строка шапки — здесь с 25.08.2026, а не в баннере.

		До этого она жила в `Banner/v1` и `Banner/v2` копией байт в байт: на
		узком экране «шапкой» был баннер, а `<header>` ниже lg не рисовал
		ничего, кроме панели меню. Из этого следовали три вещи разом:
		  • `<header>` липкий, но на мобильном пустой — при закрытом меню его
		    высота 0, и прокрутка уносила навигацию вместе с нелипким
		    баннером: за бургером надо было возвращаться наверх;
		  • крестик (в баннере) и панель (в шапке) разъезжались при прокрутке;
		  • `--header-h` на мобильном равнялся нулю, то есть первый экран
		    считался мимо реальной высоты хрома.
		Строка стоит одна на все четыре версии меню — раздел «М» остаётся
		одним, и версия меняет лист под строкой, а не строку.

		Форма: три решения вместо четырёх групп через `justify-between`.
		Слева опознание, справа действия, между ними воздух. Высота 14 (56px)
		выведена из цели нажатия: 44 + по 6 сверху и снизу. Единственный
		акцент — телефон, контуром, а не заливкой. У бургера правый вынос
		`-mr-2.5`: к полю 16 приходит глиф, а не край области нажатия — тот
		же приём, что у крестика полосы акций.

		Что ушло из строки: «Контакты» и вход. Оба были надписями среди
		значков и оба вернулись в навигацию — в лист меню, где у них есть
		подпись и место (см. Menu/MobileContacts.svelte и вариант `menu`
		в ClientAuthButtons).
	-->
	<div
		bind:this={mobileBarEl}
		data-p1-theme="light"
		class="p1-surface-alt p1-line relative z-10 flex h-14 items-center gap-3 border-b px-4 lg:hidden"
	>
		<a
			href="/"
			class="flex min-w-0 shrink items-center gap-2 focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
		>
			<span class="sr-only">{logoLabel}</span>
			{#if data?.logoUrl}
				<!--
					36 из 56, а не 28: замер на живом логотипе (512×175) дал на 28px
					подпись под знаком в 4px — нечитаемую. Верхняя граница здесь
					высота строки, и 36 оставляет по 10 сверху и снизу; ширина
					логотипа при этом упирается в `max-w-full` сжимающегося замка,
					то есть широкий знак ужимается, а не выдавливает действия.
				-->
				<ImageFallback
					class="h-9 w-auto max-w-full object-contain"
					src={String(data.logoUrl)}
					alt="Логотип {logoLabel}"
				/>
			{:else}
				<span
					class="size-7 shrink-0 rounded-full bg-linear-to-tr from-link-400 to-cat-4-500 shadow-sm"
				></span>
				<span class="p1-title p1-title-sub truncate text-base" aria-hidden="true">{logoLabel}</span>
			{/if}
		</a>

		<div class="ml-auto flex shrink-0 items-center gap-1">
			<!-- Телефон: цель 44, номер остаётся в дереве доступности. -->
			<a
				href={phoneHref}
				class="p1-card p1-border p1-accent flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
			>
				<span class="sr-only">Позвонить: {sitePhone}</span>
				<svg
					class="size-5 [stroke-width:var(--ds-icon-stroke-bold)]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path
						d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
					/>
				</svg>
			</a>

			<a
				href={favoritesHref}
				class="p1-title p1-accent-hover flex size-11 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
			>
				<span class="sr-only">Избранное</span>
				<svg
					class="size-5 [stroke-width:var(--ds-icon-stroke-bold)]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" />
				</svg>
			</a>

			<button
				bind:this={burgerEl}
				type="button"
				onclick={() => uiStore.toggleMenu()}
				aria-expanded={uiStore.menuOpen}
				aria-controls="p1-mobile-menu"
				aria-label={uiStore.menuOpen ? 'Закрыть меню' : 'Меню'}
				class="p1-title p1-accent-hover -mr-2.5 flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[var(--p1-accent)] focus-visible:outline-none"
			>
				<svg
					class="size-6 [stroke-width:var(--ds-icon-stroke-bold)]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					{#if uiStore.menuOpen}
						<path d="M6 18L18 6M6 6l12 12" />
					{:else}
						<path d="M4 6h16M4 12h16M4 18h16" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	<!-- Мобильная навигация: тот же компонент Menu, вторая его половина. Версию
	     не выбирает — читает `data.menuVersion`, ту же, что и десктопная. -->
	<MobileMenu
		{data}
		{isEditable}
		{links}
		{visibleCatalogItems}
		{visibleServiceItems}
		{disabledRubrics}
		{disabledServices}
		{cities}
		{sitePhone}
		{email}
		{contactsLink}
		{informationLinks}
		onToggleRubric={handleToggleRubric}
		onToggleService={handleToggleService}
	/>
</header>

<style>
	.city-selector::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 9999px;
		padding: 1px;
		/* Ступень шкалы, а не литерал: в Базовой значение то же самое
		   (--ds-link-300 = sky-300), но на «Охре» засветка становится
		   золотой, а на «Ирисе» — сиреневой, вместо чужого голубого пятна.
		   Сырой CSS берёт ключ @theme через var(--color-*) — тот же приём,
		   что у модалок BgImagePicker/ImageCropper. */
		background: linear-gradient(
			135deg,
			transparent 40%,
			var(--color-link-300) 50%,
			transparent 60%
		);
		-webkit-mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.city-selector:hover::before {
		opacity: 1;
		animation: border-spin 3s linear infinite;
	}

	@keyframes border-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
