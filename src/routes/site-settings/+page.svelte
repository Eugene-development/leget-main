<script lang="ts">
	import { flushSync } from 'svelte';
	import { headerButtonStyle } from '$lib/site-settings/header-button';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData, SubmitFunction } from './$types';
	import { siteAppearanceStyle, type SiteAppearance } from '$lib/site-settings/appearance';
	import { analyticsSettingsStatus } from '$lib/site-settings/analytics';

	type Feedback = {
		success?: boolean;
		message?: string;
		errors?: Record<string, string>;
		values?: Partial<SiteAppearance> & {
			yandexMetrica?: string;
			googleAnalytics?: string;
			appearanceEnabled?: boolean;
			designSystem?: string;
			headerButtonColor?: string | null;
		};
		faviconUrl?: string | null;
	};

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const sections = [
		{ id: 'favicon', label: 'Фавиконка' },
		{ id: 'analytics', label: 'Счётчики' },
		{ id: 'design-system', label: 'Дизайн-система' },
		{ id: 'appearance', label: 'Базовый стиль' },
		{ id: 'header-action', label: 'Кнопка в шапке' },
		{ id: 'summary', label: 'Сводка' }
	] as const;
	type SectionId = (typeof sections)[number]['id'];
	let activeSection = $state<SectionId>('favicon');

	function errorSection(errors: Feedback['errors']): SectionId | undefined {
		if (!errors) return;
		if (errors.yandexMetrica || errors.googleAnalytics) return 'analytics';
		if (errors.headerButtonColor) return 'header-action';
		if (errors.designSystem) return 'design-system';
		if (Object.keys(errors).length) return 'appearance';
	}

	// Reveal the first invalid control before the browser tries to focus it.
	let revealingInvalidField = false;
	function revealInvalidField(event: Event) {
		if (revealingInvalidField || !(event.target instanceof HTMLElement)) return;
		const sectionId = event.target.closest('section')?.id;
		const section = sections.find(({ id }) => id === sectionId);
		if (!section) return;
		revealingInvalidField = true;
		flushSync(() => (activeSection = section.id));
		queueMicrotask(() => (revealingInvalidField = false));
	}
	const feedback = $derived((form as Feedback | null) ?? null);
	const site = $derived(data.site);
	const faviconUrl = $derived(
		feedback && 'faviconUrl' in feedback ? feedback.faviconUrl : site.faviconUrl
	);

	// Начальный снимок нужен форме: после ввода поля живут независимо от обновлений load-data.
	// svelte-ignore state_referenced_locally
	let yandexMetrica = $state(data.site.yandexMetrica);
	// svelte-ignore state_referenced_locally
	let googleAnalytics = $state(data.site.googleAnalytics);
	// svelte-ignore state_referenced_locally
	let primaryColor = $state(data.site.appearance.primaryColor);
	// svelte-ignore state_referenced_locally
	let accentColor = $state(data.site.appearance.accentColor);
	// svelte-ignore state_referenced_locally
	let surfaceColor = $state(data.site.appearance.surfaceColor);
	// svelte-ignore state_referenced_locally
	let textColor = $state(data.site.appearance.textColor);
	// svelte-ignore state_referenced_locally
	let fontPreset = $state(data.site.appearance.fontPreset);
	// svelte-ignore state_referenced_locally
	let radiusPreset = $state(data.site.appearance.radiusPreset);
	// svelte-ignore state_referenced_locally
	let appearanceEnabled = $state(data.site.appearanceEnabled);
	// svelte-ignore state_referenced_locally
	let designSystem = $state(data.site.designSystem);
	// svelte-ignore state_referenced_locally
	let headerButtonCustom = $state(Boolean(data.site.headerButtonColor));
	// svelte-ignore state_referenced_locally
	let headerButtonColor = $state(data.site.headerButtonColor ?? '#b8860b');

	// Список готовых к выбору систем и признак, удалось ли его получить, приезжают
	// из load. Владельцу предлагаются только системы, опубликованные для его шаблона
	// и присутствующие в этой сборке фронта, — фильтр на сервере (designSystemOptions).
	const designSystems = $derived(data.designSystems);
	const designSystemsAvailable = $derived(data.designSystemsAvailable);
	const selectedSystem = $derived(
		designSystems.find((system) => system.slug === designSystem) ?? null
	);
	// Есть ли из чего выбирать: одна-единственная система (обычно Базовая) — это не
	// выбор, а данность, и об этом честнее сказать словами, чем показать select с одним
	// пунктом.
	const hasSystemChoice = $derived(designSystems.length > 1);

	$effect(() => {
		const section = errorSection(feedback?.errors);
		if (section) activeSection = section;
	});

	$effect(() => {
		const values = feedback?.values;
		if (!values) return;
		if (typeof values.yandexMetrica === 'string') yandexMetrica = values.yandexMetrica;
		if (typeof values.googleAnalytics === 'string') googleAnalytics = values.googleAnalytics;
		if (typeof values.primaryColor === 'string') primaryColor = values.primaryColor;
		if (typeof values.accentColor === 'string') accentColor = values.accentColor;
		if (typeof values.surfaceColor === 'string') surfaceColor = values.surfaceColor;
		if (typeof values.textColor === 'string') textColor = values.textColor;
		if (values.fontPreset) fontPreset = values.fontPreset;
		if (values.radiusPreset) radiusPreset = values.radiusPreset;
		if (typeof values.appearanceEnabled === 'boolean') appearanceEnabled = values.appearanceEnabled;
		if (typeof values.designSystem === 'string') designSystem = values.designSystem;
		if ('headerButtonColor' in values) {
			headerButtonCustom = values.headerButtonColor !== null;
			if (typeof values.headerButtonColor === 'string')
				headerButtonColor = values.headerButtonColor;
		}
	});

	const previewStyle = $derived(
		siteAppearanceStyle(
			{
				primaryColor,
				accentColor,
				surfaceColor,
				textColor,
				fontPreset,
				radiusPreset
			},
			designSystem
		)
	);
	const configuredCount = $derived(
		(yandexMetrica.trim() ? 1 : 0) + (googleAnalytics.trim() ? 1 : 0)
	);

	// Подтверждение живёт внутри enhance, а не в onsubmit: enhance не смотрит на
	// defaultPrevented, поэтому отмена из отдельного обработчика остановила бы только
	// нативную отправку, а фоновый POST всё равно ушёл бы.
	const confirmFaviconDelete: SubmitFunction = ({ cancel }) => {
		if (!window.confirm('Удалить фавиконку с сайта?')) cancel();
	};

	// Сохранение идёт фоновым POST и вместе с очисткой кеша сайта занимает заметное
	// время: без индикатора кнопка выглядит нерабочей и владелец жмёт её повторно.
	let saving = $state(false);
	const trackSaving: SubmitFunction = () => {
		saving = true;
		return async ({ update }) => {
			try {
				// This is a settings form: native reset would empty unbound color
				// inputs and uncheck the appearance switch after a successful save.
				await update({ reset: false });
			} finally {
				saving = false;
			}
		};
	};
</script>

<svelte:head>
	<title>Общие настройки сайта</title>
	<meta name="description" content="Фавиконка, аналитика и базовый стиль сайта" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{@html '<!-- THESIS: Общие настройки читаются как единый паспорт сайта, а не как россыпь несвязанных карточек. OWN-WORLD: Светло-серая инструментальная поверхность LEGET, белые рабочие листы, тонкие линии и один алый сигнал сохранения. STORY: Владелец проверяет домен, подключает favicon и аналитику, затем задаёт базовый визуальный характер всему сайту. FIRST VIEWPORT: Слева липкое оглавление и состояние, справа сразу видны favicon и последовательность настроек; сохранение завершает документ. FORM: Паспорт сайта с живым образцом, кандидат 7, seed 46fbd18f. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->'}
<main class="min-h-screen bg-ink-50 text-text-primary">
	<header class="border-b border-border-light bg-surface-card">
		<div class="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
			<div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div class="max-w-3xl">
					<a
						href="/"
						class="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-text-secondary transition hover:text-link-600 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2"
					>
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								d="m15 18-6-6 6-6"
								stroke-linecap="round"
								stroke-linejoin="round"
								style="stroke-width: var(--ds-icon-stroke-bold)"
							/>
						</svg>
						На главную страницу сайта
					</a>
					<h1 class="text-4xl text-balance sm:text-5xl">Общие настройки сайта</h1>
				</div>

				<div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
					<span class="text-text-secondary">{site.domain}</span>
					<span class="inline-flex items-center gap-2">
						<span class="h-2 w-2 rounded-full bg-brand-500"></span>
						{configuredCount} из 2 счётчиков
					</span>
				</div>
			</div>
		</div>
	</header>

	<div
		class="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-10 lg:py-10"
	>
		<aside class="lg:sticky lg:top-8 lg:self-start" aria-label="Разделы настроек">
			<div class="border-b border-border-medium pb-5">
				<p class="text-sm text-text-secondary">{site.name || 'Сайт без названия'}</p>
				<p class="mt-1 text-xs text-text-secondary">Шаблон {site.templateId ?? 'не указан'}</p>
			</div>
			<nav
				class="settings-nav flex gap-2 overflow-x-auto py-5 lg:flex-col"
				aria-label="Разделы настроек"
			>
				{#each sections.filter((section) => section.id !== 'header-action' || site.templateId === 2) as section (section.id)}
					<button
						type="button"
						class="settings-nav-link"
						aria-current={activeSection === section.id ? 'true' : undefined}
						aria-controls={section.id}
						data-goal-ignore="Переключение раздела настроек сайта"
						onclick={() => (activeSection = section.id)}
					>
						{section.label}
					</button>
				{/each}
			</nav>
		</aside>

		<div class="min-w-0">
			{#if feedback?.message}
				<div
					class="mb-6 border px-4 py-3 text-sm {feedback.success
						? 'border-ink-200 bg-surface-card text-text-primary'
						: 'border-brand-500/30 bg-brand-50 text-brand-700'}"
					role={feedback.success ? 'status' : 'alert'}
				>
					{feedback.message}
				</div>
			{/if}

			<section id="favicon" hidden={activeSection !== 'favicon'}>
				<div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)] md:items-start">
					<div>
						<h2 class="text-3xl">Фавиконка</h2>
						<p class="mt-3 max-w-[65ch] text-sm text-text-secondary">
							Используйте квадратный PNG, ICO или WEBP размером до 1 МБ.
						</p>

						<form
							method="POST"
							action="?/uploadFavicon"
							enctype="multipart/form-data"
							use:enhance
							class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
						>
							<label class="block min-w-0 flex-1 text-sm" for="favicon-file">
								<span class="mb-2 block">Файл фавиконки</span>
								<input
									id="favicon-file"
									name="favicon"
									type="file"
									accept=".png,.ico,.webp,image/png,image/x-icon,image/vnd.microsoft.icon,image/webp"
									required
									class="block w-full rounded-xl border-border-light bg-surface-card text-sm file:mr-4 file:min-h-11 file:border-0 file:bg-ink-100 file:px-4 file:text-text-primary hover:file:bg-ink-200 focus:ring-2 focus:ring-link-600"
								/>
							</label>
							<button type="submit" class="settings-secondary-button">Загрузить</button>
						</form>
					</div>

					<div class="border border-border-light bg-surface-card p-5">
						<div class="flex items-center gap-4">
							<div
								class="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border-light bg-ink-50"
							>
								{#if faviconUrl}
									<img src={faviconUrl} alt="Текущая фавиконка" class="h-8 w-8 object-contain" />
								{:else}
									<svg
										class="h-7 w-7 text-text-secondary"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										aria-hidden="true"
									>
										<path d="M5 19 19 5M8 5h11v11" style="stroke-width: var(--ds-icon-stroke)" />
									</svg>
								{/if}
							</div>
							<div class="min-w-0">
								<p class="text-sm text-text-primary">
									{faviconUrl ? 'Фавиконка опубликована' : 'Используется иконка платформы'}
								</p>
								<p class="mt-1 text-xs break-words text-text-secondary">
									{faviconUrl ?? 'Загрузите собственный файл'}
								</p>
							</div>
						</div>
						{#if faviconUrl}
							<form
								method="POST"
								action="?/deleteFavicon"
								use:enhance={confirmFaviconDelete}
								class="mt-5 border-t border-border-light pt-4"
							>
								<button
									type="submit"
									class="min-h-11 text-sm text-brand-600 transition hover:text-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500"
								>
									Удалить фавиконку
								</button>
							</form>
						{/if}
					</div>
				</div>
			</section>

			<form
				method="POST"
				action="?/save"
				use:enhance={trackSaving}
				hidden={activeSection === 'favicon'}
				oninvalidcapture={revealInvalidField}
			>
				<section id="analytics" hidden={activeSection !== 'analytics'}>
					<h2 class="text-3xl">Счётчики</h2>

					<div class="mt-7 divide-y divide-border-light border-y border-border-light">
						<div class="grid gap-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
							<div>
								<label for="yandex-metrica" class="text-sm text-text-primary">Яндекс Метрика</label>
								<p class="mt-1 text-xs text-text-secondary">Числовой ID счётчика</p>
							</div>
							<div>
								<input
									id="yandex-metrica"
									name="yandexMetrica"
									bind:value={yandexMetrica}
									inputmode="numeric"
									maxlength="20"
									placeholder="12345678"
									aria-describedby={feedback?.errors?.yandexMetrica
										? 'yandex-help yandex-error'
										: 'yandex-help'}
									aria-invalid={feedback?.errors?.yandexMetrica ? 'true' : undefined}
									class="settings-input"
								/>
								<p id="yandex-help" class="mt-2 text-xs text-text-secondary">
									Включаются карта кликов, точный показатель отказов и Вебвизор.
								</p>
								{#if feedback?.errors?.yandexMetrica}
									<p id="yandex-error" class="mt-2 text-sm text-brand-700">
										{feedback.errors.yandexMetrica}
									</p>
								{/if}
							</div>
						</div>

						<div class="grid gap-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
							<div>
								<label for="google-analytics" class="text-sm text-text-primary">Google tag</label>
								<p class="mt-1 text-xs text-text-secondary">Analytics, Ads или единый тег</p>
							</div>
							<div>
								<input
									id="google-analytics"
									name="googleAnalytics"
									bind:value={googleAnalytics}
									maxlength="35"
									placeholder="G-XXXXXXXXXX"
									aria-describedby={feedback?.errors?.googleAnalytics
										? 'google-help google-error'
										: 'google-help'}
									aria-invalid={feedback?.errors?.googleAnalytics ? 'true' : undefined}
									class="settings-input uppercase"
								/>
								<p id="google-help" class="mt-2 text-xs text-text-secondary">
									Поддерживаются идентификаторы G-, GT-, AW- и DC-.
								</p>
								{#if feedback?.errors?.googleAnalytics}
									<p id="google-error" class="mt-2 text-sm text-brand-700">
										{feedback.errors.googleAnalytics}
									</p>
								{/if}
							</div>
						</div>
					</div>
				</section>

				<section id="design-system" hidden={activeSection !== 'design-system'}>
					<h2 class="text-3xl">Дизайн-система</h2>

					<div class="mt-7 grid gap-4 py-2 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
						<div>
							<label for="design-system-select" class="text-sm text-text-primary"
								>Система сайта</label
							>
							<p class="mt-1 text-xs text-text-secondary">Применяется ко всем страницам</p>
						</div>
						<div>
							{#if hasSystemChoice}
								<select
									id="design-system-select"
									name="designSystem"
									bind:value={designSystem}
									aria-describedby={feedback?.errors?.designSystem
										? 'design-system-help design-system-error'
										: 'design-system-help'}
									aria-invalid={feedback?.errors?.designSystem ? 'true' : undefined}
									class="settings-input"
								>
									{#each designSystems as system (system.slug)}
										<option value={system.slug}>
											{system.name}{system.isBase ? ' — по умолчанию' : ''}
										</option>
									{/each}
								</select>
							{:else}
								<!-- Выбирать не из чего: держим значение скрытым полем, чтобы сохранение
								     формы не стёрло текущую систему, и объясняем словами. -->
								<input type="hidden" name="designSystem" value={designSystem} />
								<p
									class="border border-border-light bg-surface-card px-4 py-3 text-sm text-text-primary"
								>
									{#if !designSystemsAvailable}
										Список систем сейчас получить не удалось. Сайт остаётся на текущей системе «{selectedSystem?.name ??
											designSystem}».
									{:else}
										Для вашего шаблона пока опубликована только «{selectedSystem?.name ??
											designSystem}». Другие системы появятся здесь, когда их подготовят для этого
										шаблона.
									{/if}
								</p>
							{/if}
							<p id="design-system-help" class="mt-2 text-xs text-text-secondary">
								{#if selectedSystem?.description}
									{selectedSystem.description}
								{:else}
									Смена системы перекрашивает и перекраивает блоки сразу на всём сайте.
								{/if}
							</p>
							{#if feedback?.errors?.designSystem}
								<p id="design-system-error" class="mt-2 text-sm text-brand-700">
									{feedback.errors.designSystem}
								</p>
							{/if}
						</div>
					</div>
				</section>

				<section id="appearance" hidden={activeSection !== 'appearance'}>
					<div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
						<div>
							<h2 class="text-3xl">Базовый стиль</h2>
							<label
								class="mt-6 flex cursor-pointer items-start gap-3 border-y border-border-light py-4 text-sm"
							>
								<input
									type="checkbox"
									role="switch"
									name="appearanceEnabled"
									bind:checked={appearanceEnabled}
									aria-labelledby="appearance-label"
									aria-describedby="appearance-help"
									class="peer sr-only"
								/>
								<span
									aria-hidden="true"
									class="relative mt-0.5 h-7 w-12 shrink-0 rounded-full border border-border-medium transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-link-600 motion-reduce:transition-none"
									class:bg-ink-900={appearanceEnabled}
									class:bg-ink-200={!appearanceEnabled}
								>
									<span
										class="absolute top-0.75 left-0.75 h-5 w-5 rounded-full bg-surface-card shadow-sm transition-transform motion-reduce:transition-none"
										class:translate-x-5={appearanceEnabled}
									></span>
								</span>
								<span>
									<span id="appearance-label" class="block text-text-primary"
										>Применить базовый стиль ко всему сайту</span
									>
									<span id="appearance-help" class="mt-1 block text-xs text-text-secondary">
										{#if appearanceEnabled}
											Включён: настройки ниже применятся ко всему сайту после сохранения.
										{:else}
											Выключен: поля недоступны. После сохранения сайт использует оформление
											дизайн-системы.
										{/if}
									</span>
								</span>
							</label>

							<fieldset
								class="mt-8 min-w-0"
								disabled={!appearanceEnabled}
								class:opacity-50={!appearanceEnabled}
							>
								<legend class="text-sm text-text-primary">Основные цвета</legend>
								<div class="mt-4 divide-y divide-border-light border-y border-border-light">
									{@render colorField(
										'primaryColor',
										'Основной',
										'Заголовки и основные элементы',
										primaryColor,
										(value) => (primaryColor = value)
									)}
									{@render colorField(
										'accentColor',
										'Акцент',
										'Ссылки, маркеры и активные состояния',
										accentColor,
										(value) => (accentColor = value)
									)}
									{@render colorField(
										'surfaceColor',
										'Фон',
										'Светлая поверхность страниц',
										surfaceColor,
										(value) => (surfaceColor = value)
									)}
									{@render colorField(
										'textColor',
										'Текст',
										'Основной цвет текста',
										textColor,
										(value) => (textColor = value)
									)}
								</div>
							</fieldset>

							<fieldset
								class="mt-8 grid min-w-0 gap-6 sm:grid-cols-2"
								disabled={!appearanceEnabled}
								class:opacity-50={!appearanceEnabled}
								aria-label="Шрифты и скругления"
							>
								<label class="block text-sm" for="font-preset">
									<span class="mb-2 block text-text-primary">Пара шрифтов</span>
									<select
										id="font-preset"
										name="fontPreset"
										bind:value={fontPreset}
										class="settings-input"
									>
										<option value="editorial">Редакционная</option>
										<option value="modern">Современная</option>
										<option value="classic">Классическая</option>
									</select>
									<span class="mt-2 block text-xs text-text-secondary">
										Заголовок и основной текст меняются согласованно.
									</span>
								</label>

								<label class="block text-sm" for="radius-preset">
									<span class="mb-2 block text-text-primary">Форма углов</span>
									<select
										id="radius-preset"
										name="radiusPreset"
										bind:value={radiusPreset}
										class="settings-input"
									>
										<option value="sharp">Строгая</option>
										<option value="balanced">Сбалансированная</option>
										<option value="soft">Мягкая</option>
									</select>
									<span class="mt-2 block text-xs text-text-secondary">
										Меняет единую шкалу скруглений компонентов.
									</span>
								</label>
							</fieldset>
						</div>

						<div class="xl:sticky xl:top-8 xl:self-start" class:opacity-50={!appearanceEnabled}>
							<p class="mb-3 text-xs text-text-secondary">
								{appearanceEnabled ? 'Живой образец' : 'Образец не применяется'}
							</p>
							<div class="overflow-hidden border border-border-light bg-surface-card shadow-sm">
								<div class="space-y-4 p-4" style={previewStyle} data-ds-contrast-root>
									{#each ['light', 'dark'] as theme}
										<div
											data-ds-surface={theme}
											class="rounded-xl p-5"
											style={`background: var(--ds-${theme}-surface); color: var(--ds-contrast-${theme}-copy)`}
										>
											<p class="ds-accent text-xs">
												{theme === 'light' ? 'Светлая поверхность' : 'Тёмная поверхность'}
											</p>
											<h3 class="mt-3 text-3xl">Ваш сайт в одном стиле</h3>
											<p class="ds-copy mt-3 text-sm">
												Текст, ссылка и кнопка адаптируются к фону компонента.
											</p>
											<span class="ds-accent mt-3 inline-block text-sm underline"
												>Пример ссылки</span
											>
											<button
												type="button"
												disabled={!appearanceEnabled}
												class="ds-action mt-5 min-h-11 rounded-xl px-5 text-sm"
												>Основное действие</button
											>
										</div>
									{/each}
								</div>
								<div class="grid grid-cols-4 border-t border-border-light" aria-label="Палитра">
									<span class="h-10" style={`background: ${primaryColor}`} title="Основной"></span>
									<span class="h-10" style={`background: ${accentColor}`} title="Акцент"></span>
									<span class="h-10" style={`background: ${surfaceColor}`} title="Фон"></span>
									<span class="h-10" style={`background: ${textColor}`} title="Текст"></span>
								</div>
							</div>
						</div>
					</div>
				</section>

				{#if site.templateId === 2}
					<section id="header-action" hidden={activeSection !== 'header-action'}>
						<h2 class="text-3xl">Кнопка в шапке</h2>
						<input type="hidden" name="headerButtonSettings" value="1" />
						<label class="mt-6 flex min-h-11 items-center gap-3 text-sm">
							<input type="checkbox" name="headerButtonCustom" bind:checked={headerButtonCustom} />
							Свой цвет
						</label>
						<fieldset
							disabled={!headerButtonCustom}
							class="mt-4"
							class:opacity-50={!headerButtonCustom}
						>
							{@render colorField(
								'headerButtonColor',
								'Цвет кнопки',
								'Градиент и читаемый текст подбираются автоматически',
								headerButtonColor,
								(value) => (headerButtonColor = value)
							)}
						</fieldset>
						<p class="mt-4 text-sm text-text-secondary">
							{headerButtonCustom
								? 'Индивидуальный цвет сайта'
								: 'Используется цвет дизайн-системы'}
						</p>
						<div class="mt-6 border border-border-light bg-surface-card p-6">
							<button
								type="button"
								class="ds-header-action inline-flex min-h-11 items-center gap-2 overflow-hidden rounded-lg px-5 py-3 text-sm font-medium"
								style={headerButtonStyle(headerButtonCustom ? headerButtonColor : null)}
							>
								<span class="cta-shimmer"></span><span class="relative z-10"
									>Записаться в салон</span
								>
							</button>
						</div>
					</section>
				{/if}

				<section id="summary" hidden={activeSection !== 'summary'}>
					<h2 class="text-3xl">Сводка</h2>
					<dl class="mt-6 divide-y divide-border-light border-y border-border-light text-sm">
						<div class="flex flex-wrap justify-between gap-3 py-4">
							<dt class="text-text-secondary">Область применения</dt>
							<dd>Все публичные страницы</dd>
						</div>
						<div class="flex flex-wrap justify-between gap-3 py-4">
							<dt class="text-text-secondary">Яндекс Метрика</dt>
							<dd>{analyticsSettingsStatus(yandexMetrica, site.yandexMetrica, 'yandex')}</dd>
						</div>
						<div class="flex flex-wrap justify-between gap-3 py-4">
							<dt class="text-text-secondary">Google tag</dt>
							<dd>{analyticsSettingsStatus(googleAnalytics, site.googleAnalytics, 'google')}</dd>
						</div>
						<div class="flex flex-wrap justify-between gap-3 py-4">
							<dt class="text-text-secondary">Базовый стиль</dt>
							<dd>{appearanceEnabled ? `${fontPreset} · ${radiusPreset}` : 'Не применяется'}</dd>
						</div>
					</dl>
				</section>
				<div
					class="mt-8 flex flex-col gap-3 border-t border-border-medium pt-6 sm:flex-row sm:items-center sm:justify-end"
				>
					<button
						type="submit"
						class="settings-primary-button"
						disabled={saving}
						aria-busy={saving ? 'true' : undefined}
					>
						{#if saving}
							<span class="settings-button-spinner" aria-hidden="true"></span>
							Сохраняем…
						{:else}
							Сохранить настройки
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
</main>

{#snippet colorField(
	name:
		| keyof Pick<SiteAppearance, 'primaryColor' | 'accentColor' | 'surfaceColor' | 'textColor'>
		| 'headerButtonColor',
	label: string,
	description: string,
	value: string,
	setValue: (value: string) => void
)}
	<div class="grid gap-3 py-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
		<div>
			<label for={name} class="text-sm text-text-primary">{label}</label>
			<p class="mt-1 text-xs text-text-secondary">{description}</p>
		</div>
		<div class="flex items-center gap-3">
			<input
				id={`${name}-picker`}
				type="color"
				{value}
				oninput={(event) => setValue(event.currentTarget.value)}
				class="h-11 w-14 cursor-pointer rounded-lg border border-border-light bg-surface-card p-1"
				aria-label={`Выбрать цвет: ${label}`}
			/>
			<input
				id={name}
				{name}
				type="text"
				{value}
				oninput={(event) => setValue(event.currentTarget.value)}
				pattern={'#[0-9A-Fa-f]{6}'}
				maxlength="7"
				required
				class="settings-input max-w-44 font-mono uppercase"
				aria-invalid={feedback?.errors?.[name] ? 'true' : undefined}
				aria-describedby={feedback?.errors?.[name] ? `${name}-error` : undefined}
			/>
		</div>
		{#if feedback?.errors?.[name]}
			<p id={`${name}-error`} class="text-sm text-brand-700 sm:col-start-2">
				{feedback.errors[name]}
			</p>
		{/if}
	</div>
{/snippet}

<style>
	:global(.settings-nav-link) {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		white-space: nowrap;
		border-radius: var(--ds-radius-xl);
		padding: 0 0.75rem;
		font-size: var(--text-sm);
		color: var(--ds-color-text-secondary);
		transition:
			color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui),
			background-color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	:global(.settings-nav) {
		scrollbar-width: none;
	}

	:global(.settings-nav::-webkit-scrollbar) {
		display: none;
	}

	:global(.settings-nav-link:hover) {
		background: var(--ds-color-surface-card);
		color: var(--ds-color-text-primary);
	}

	:global(.settings-nav-link[aria-current='true']) {
		background: var(--ds-color-surface-card);
		color: var(--ds-color-text-primary);
		font-weight: 600;
	}

	:global(.settings-nav-link:focus-visible),
	:global(.settings-input:focus-visible),
	:global(.settings-primary-button:focus-visible),
	:global(.settings-secondary-button:focus-visible) {
		outline: 2px solid var(--color-link-600);
		outline-offset: 2px;
	}

	:global(.settings-input) {
		display: block;
		min-height: 44px;
		width: 100%;
		border: 1px solid var(--ds-color-border-light);
		border-radius: var(--ds-radius-xl);
		background: var(--ds-color-surface-card);
		padding: 0.625rem 0.875rem;
		font-size: var(--text-sm);
		color: var(--ds-color-text-primary);
	}

	:global(.settings-input[aria-invalid='true']) {
		border-color: var(--color-brand-500);
	}

	:global(.settings-primary-button),
	:global(.settings-secondary-button) {
		display: inline-flex;
		min-height: 44px;
		align-items: center;
		justify-content: center;
		border-radius: var(--ds-radius-xl);
		padding: 0.7rem 1.15rem;
		font-size: var(--text-sm);
		transition:
			background-color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui),
			color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	:global(.settings-primary-button) {
		background: var(--color-ink-900);
		color: var(--color-on-dark);
	}

	:global(.settings-primary-button:hover) {
		background: var(--color-ink-700);
	}

	:global(.settings-secondary-button) {
		border: 1px solid var(--ds-color-border-light);
		background: var(--ds-color-surface-card);
		color: var(--ds-color-text-primary);
	}

	:global(.settings-secondary-button:hover) {
		background: var(--color-ink-100);
	}

	:global(.settings-primary-button:disabled) {
		cursor: progress;
		opacity: 0.72;
	}

	:global(.settings-primary-button:disabled:hover) {
		background: var(--color-ink-900);
	}

	.settings-button-spinner {
		margin-right: 0.5rem;
		display: inline-block;
		height: 1rem;
		width: 1rem;
		flex: none;
		border-radius: 9999px;
		border: 2px solid currentColor;
		border-top-color: transparent;
		animation: settings-button-spin 0.7s linear infinite;
	}

	@keyframes settings-button-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.settings-button-spinner {
			animation-duration: 1.8s;
		}
	}
</style>
