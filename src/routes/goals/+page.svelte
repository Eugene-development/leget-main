<script lang="ts">
	import {
		goalDefinitions,
		type GoalDefinition,
		type GoalPage,
		type GoalPriority,
		type GoalType
	} from '$lib/yandex-direct/goals';

	type TypeFilter = 'all' | GoalType;

	let query = $state('');
	let typeFilter = $state<TypeFilter>('all');
	let routeFilter = $state('all');
	let copiedId = $state<string | null>(null);
	let copyMessage = $state('');

	function pageKey(page: GoalPage): string {
		return page.scope === 'sitewide' ? 'sitewide' : `route:${page.path}`;
	}

	const routeOptions = $derived.by(() => {
		const unique = new Map<string, GoalPage>();
		for (const goal of goalDefinitions) {
			for (const page of goal.pages) unique.set(pageKey(page), page);
		}
		return [...unique.values()].sort((a, b) => {
			const aValue = a.scope === 'sitewide' ? '' : a.path;
			const bValue = b.scope === 'sitewide' ? '' : b.path;
			return aValue.localeCompare(bValue, 'ru');
		});
	});

	const filteredGoals = $derived.by(() => {
		const needle = query.trim().toLocaleLowerCase('ru');
		return goalDefinitions.filter((goal) => {
			const matchesType = typeFilter === 'all' || goal.type === typeFilter;
			const matchesRoute =
				routeFilter === 'all' || goal.pages.some((page) => pageKey(page) === routeFilter);
			const searchable = [
				goal.name,
				goal.description,
				goal.eventName,
				goal.buttonLabel ?? '',
				...goal.pages.flatMap((page) => [
					page.label,
					page.scope === 'sitewide' ? 'весь сайт все страницы' : page.path
				])
			]
				.join(' ')
				.toLocaleLowerCase('ru');
			return matchesType && matchesRoute && (!needle || searchable.includes(needle));
		});
	});

	const clickGoals = $derived(filteredGoals.filter((goal) => goal.type === 'click'));
	const compoundGoals = $derived(filteredGoals.filter((goal) => goal.type === 'compound'));
	const activeFilterCount = $derived(
		(typeFilter === 'all' ? 0 : 1) + (routeFilter === 'all' ? 0 : 1) + (query ? 1 : 0)
	);
	const selectedRouteLabel = $derived(
		routeFilter === 'all'
			? 'Все'
			: (routeOptions.find((page) => pageKey(page) === routeFilter)?.label ?? 'Все')
	);

	function resetFilters() {
		query = '';
		typeFilter = 'all';
		routeFilter = 'all';
	}

	async function copyEvent(goal: GoalDefinition) {
		try {
			await navigator.clipboard.writeText(goal.eventName);
			copiedId = goal.id;
			copyMessage = `Событие ${goal.eventName} скопировано.`;
			setTimeout(() => {
				if (copiedId === goal.id) {
					copiedId = null;
					copyMessage = '';
				}
			}, 1600);
		} catch {
			copiedId = null;
			copyMessage = 'Не удалось скопировать событие. Выделите его имя вручную.';
		}
	}

	function priorityLabel(priority: GoalPriority): string {
		return priority === 'high' ? 'Высокий' : priority === 'medium' ? 'Средний' : 'Низкий';
	}
</script>

<svelte:head>
	<title>Карта целей — Яндекс Директ</title>
	<meta name="description" content="Карта триггерных и составных целей сайта" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{@html '<!-- THESIS: Карта целей читается по страницам сайта, а не как безликий список метрик. OWN-WORLD: Светлая инструментальная поверхность LEGET, строгие строки, тонкие разделители и один красный сигнал статуса. STORY: Владелец видит будущие кликовые и составные цели, находит страницу срабатывания и копирует имя события. FIRST VIEWPORT: Слева маршруты и фильтры, справа полный реестр целей; возврат на сайт всегда виден в шапке. FORM: Матрица «страница → цель», кандидат 5, seed bccb761c. FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md -->'}
<main class="min-h-screen bg-ink-50 text-text-primary">
	<header class="border-b border-border-light bg-surface-card">
		<div class="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">
			<div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
				<div class="max-w-3xl">
					<a
						href="/"
						class="mb-5 inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-link-600 focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2"
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
					<h1 class="text-4xl text-balance sm:text-5xl">Карта целей Яндекс Директа</h1>
					<p class="mt-4 max-w-[70ch] text-sm text-text-secondary sm:text-base">
						Здесь собран проект конверсионной карты: клики по коммерческим кнопкам и поведенческие
						составные сценарии. Цели ещё не опубликованы — имена событий и условия зафиксированы для
						следующего этапа.
					</p>
				</div>

				<div class="flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Сводка карты целей">
					<span><strong>{goalDefinitions.length}</strong> всего</span>
					<span
						><strong>{goalDefinitions.filter((goal) => goal.type === 'click').length}</strong> кликовых</span
					>
					<span
						><strong>{goalDefinitions.filter((goal) => goal.type === 'compound').length}</strong> составных</span
					>
					<span class="text-brand-600"><strong>0</strong> опубликовано</span>
				</div>
			</div>
		</div>
	</header>

	<div
		class="mx-auto grid max-w-[1500px] grid-cols-1 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-10 lg:py-10"
	>
		<aside class="lg:sticky lg:top-8 lg:self-start" aria-label="Фильтры целей">
			<div class="border-b border-border-medium pb-6">
				<label for="goal-search" class="mb-2 block text-sm text-text-primary">Поиск</label>
				<div class="relative">
					<svg
						class="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-text-muted"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						aria-hidden="true"
					>
						<circle cx="11" cy="11" r="7" style="stroke-width: var(--ds-icon-stroke)" />
						<path d="m20 20-3.5-3.5" style="stroke-width: var(--ds-icon-stroke)" />
					</svg>
					<input
						id="goal-search"
						type="search"
						bind:value={query}
						placeholder="Название или событие"
						class="w-full rounded-xl border-border-light bg-surface-card py-2.5 pr-3 pl-10 text-sm text-text-primary shadow-sm placeholder:text-text-muted focus:border-link-600 focus:ring-2 focus:ring-link-600"
					/>
				</div>
			</div>

			<fieldset class="border-b border-border-medium py-6">
				<legend class="mb-3 text-sm text-text-primary">Тип цели</legend>
				<div class="flex flex-wrap gap-2 lg:flex-col">
					{#each [{ value: 'all', label: 'Все цели' }, { value: 'click', label: 'Клик по кнопке' }, { value: 'compound', label: 'Составная' }] as option}
						<button
							type="button"
							class="rounded-xl px-3 py-2 text-left text-sm transition focus-visible:ring-2 focus-visible:ring-link-600 {typeFilter ===
							option.value
								? 'bg-ink-900 text-on-dark'
								: 'bg-surface-card text-text-secondary hover:text-text-primary'}"
							onclick={() => (typeFilter = option.value as TypeFilter)}
							aria-pressed={typeFilter === option.value}
						>
							{option.label}
						</button>
					{/each}
				</div>
			</fieldset>

			<details class="border-b border-border-medium py-5 lg:hidden">
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-3 text-sm text-text-primary focus-visible:ring-2 focus-visible:ring-link-600"
				>
					<span>Страница срабатывания</span>
					<span class="flex items-center gap-2 text-text-secondary">
						{selectedRouteLabel}
						<svg
							class="h-4 w-4"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								d="m6 9 6 6 6-6"
								stroke-linecap="round"
								stroke-linejoin="round"
								style="stroke-width: var(--ds-icon-stroke)"
							/>
						</svg>
					</span>
				</summary>
				<div class="mt-4 flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
					{@render routeFilterList()}
				</div>
			</details>

			<fieldset class="hidden py-6 lg:block">
				<legend class="mb-3 text-sm text-text-primary">Страница срабатывания</legend>
				<div class="flex max-h-72 flex-col gap-1 overflow-y-auto pr-1">
					{@render routeFilterList()}
				</div>
			</fieldset>

			{#if activeFilterCount > 0}
				<button
					type="button"
					class="text-sm text-link-600 transition hover:text-link-500 focus-visible:ring-2 focus-visible:ring-link-600"
					onclick={resetFilters}
				>
					Сбросить фильтры ({activeFilterCount})
				</button>
			{/if}
		</aside>

		<section aria-live="polite">
			<span class="sr-only" aria-live="polite">{copyMessage}</span>
			<div
				class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border-medium pb-4"
			>
				<p class="text-sm text-text-secondary">
					Показано <strong class="text-text-primary">{filteredGoals.length}</strong> из {goalDefinitions.length}
				</p>
				<span class="inline-flex items-center gap-2 text-xs text-text-secondary">
					<span class="h-2 w-2 rounded-full bg-brand-500"></span>
					Все записи пока в черновике
				</span>
			</div>

			{#if filteredGoals.length === 0}
				<div class="border-y border-border-medium py-16 text-center">
					<h2 class="text-3xl">Цели не найдены</h2>
					<p class="mt-3 text-sm text-text-secondary">
						Измените запрос или сбросьте фильтры, чтобы увидеть всю карту.
					</p>
					<button
						type="button"
						class="mt-5 rounded-xl border border-border-medium bg-surface-card px-4 py-2.5 text-sm transition hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-link-600"
						onclick={resetFilters}
					>
						Показать все цели
					</button>
				</div>
			{:else}
				{#if clickGoals.length > 0}
					<div class="mb-10">
						<div class="mb-3 flex items-end justify-between gap-4">
							<h2 class="text-2xl sm:text-3xl">Клики по кнопкам</h2>
							<span class="text-sm text-text-muted">{clickGoals.length}</span>
						</div>
						<div class="divide-y divide-border-light border-y border-border-medium bg-surface-card">
							{#each clickGoals as goal (goal.id)}
								{@render goalRow(goal)}
							{/each}
						</div>
					</div>
				{/if}

				{#if compoundGoals.length > 0}
					<div>
						<div class="mb-3 flex items-end justify-between gap-4">
							<h2 class="text-2xl sm:text-3xl">Поведенческие составные цели</h2>
							<span class="text-sm text-text-muted">{compoundGoals.length}</span>
						</div>
						<div class="divide-y divide-border-light border-y border-border-medium bg-surface-card">
							{#each compoundGoals as goal (goal.id)}
								{@render goalRow(goal)}
							{/each}
						</div>
					</div>
				{/if}
			{/if}
		</section>
	</div>
</main>

{#snippet goalRow(goal: GoalDefinition)}
	<details class="group px-4 py-5 sm:px-6">
		<summary
			class="flex cursor-pointer list-none items-start gap-4 focus-visible:ring-2 focus-visible:ring-link-600"
		>
			<span
				class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full {goal.priority === 'high'
					? 'bg-brand-500'
					: goal.priority === 'medium'
						? 'bg-cat-6-500'
						: 'bg-ink-400'}"
			></span>
			<span class="min-w-0 flex-1">
				<span class="flex flex-wrap items-center gap-x-3 gap-y-1">
					<strong class="text-base text-text-primary sm:text-lg">{goal.name}</strong>
					<span class="rounded-full bg-surface-muted px-2.5 py-1 text-xs text-text-secondary">
						{goal.type === 'click' ? 'Клик' : 'Составная'}
					</span>
				</span>
				<span class="mt-2 block text-sm text-text-secondary">{goal.description}</span>
				<span class="mt-3 flex flex-wrap gap-2">
					{#each goal.pages as page (pageKey(page))}
						{#if page.scope === 'route'}
							<a
								href={page.path}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-surface px-2.5 py-1 text-xs text-link-600 transition hover:border-link-500 focus-visible:ring-2 focus-visible:ring-link-600"
								onclick={(event) => event.stopPropagation()}
							>
								{page.label}
								<code class="text-text-muted">{page.path}</code>
							</a>
						{:else}
							<span
								class="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-surface px-2.5 py-1 text-xs text-text-secondary"
							>
								{page.label}
								<code class="text-text-muted">*</code>
							</span>
						{/if}
					{/each}
				</span>
			</span>
			<svg
				class="mt-1 h-5 w-5 shrink-0 text-text-muted transition-transform group-open:rotate-180"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path
					d="m6 9 6 6 6-6"
					stroke-linecap="round"
					stroke-linejoin="round"
					style="stroke-width: var(--ds-icon-stroke-bold)"
				/>
			</svg>
		</summary>

		<div
			class="mt-5 grid gap-5 border-t border-border-light pt-5 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr]"
		>
			<div>
				<p class="text-xs text-text-muted">Условие</p>
				<p class="mt-1 text-sm text-text-primary">{goal.condition}</p>
				{#if goal.dependsOn}
					<ul class="mt-3 space-y-1.5 text-sm text-text-secondary">
						{#each goal.dependsOn as dependency}
							<li class="flex gap-2">
								<span aria-hidden="true">—</span>
								<span>{dependency}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div>
				<p class="text-xs text-text-muted">Событие</p>
				<div class="mt-1 flex items-center gap-2">
					<code class="min-w-0 truncate rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs text-on-dark">
						{goal.eventName}
					</code>
					<button
						type="button"
						class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-light text-text-secondary transition hover:text-link-600 focus-visible:ring-2 focus-visible:ring-link-600"
						onclick={() => copyEvent(goal)}
						title="Скопировать имя события"
						aria-label="Скопировать имя события {goal.eventName}"
					>
						{#if copiedId === goal.id}
							<svg
								class="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									d="m5 12 4 4L19 6"
									stroke-linecap="round"
									stroke-linejoin="round"
									style="stroke-width: var(--ds-icon-stroke-bold)"
								/>
							</svg>
						{:else}
							<svg
								class="h-4 w-4"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								aria-hidden="true"
							>
								<rect
									x="8"
									y="8"
									width="11"
									height="11"
									rx="2"
									style="stroke-width: var(--ds-icon-stroke)"
								/>
								<path
									d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"
									style="stroke-width: var(--ds-icon-stroke)"
								/>
							</svg>
						{/if}
					</button>
				</div>
				{#if goal.buttonLabel}
					<p class="mt-3 text-xs text-text-secondary">Кнопка: «{goal.buttonLabel}»</p>
				{/if}
				{#if goal.selector}
					<code class="mt-2 block text-xs break-all text-text-muted">{goal.selector}</code>
				{/if}
			</div>

			<div class="sm:col-span-2 xl:col-span-1">
				<p class="text-xs text-text-muted">Готовность</p>
				<dl class="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
					<dt class="text-text-secondary">Статус</dt>
					<dd class="text-brand-600">Черновик</dd>
					<dt class="text-text-secondary">Приоритет</dt>
					<dd>{priorityLabel(goal.priority)}</dd>
					<dt class="text-text-secondary">Отправка</dt>
					<dd>Не подключена</dd>
				</dl>
			</div>
		</div>
	</details>
{/snippet}

{#snippet routeFilterList()}
	<button
		type="button"
		class="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition focus-visible:ring-2 focus-visible:ring-link-600 {routeFilter ===
		'all'
			? 'bg-surface-muted text-text-primary'
			: 'text-text-secondary hover:bg-surface-card hover:text-text-primary'}"
		onclick={() => (routeFilter = 'all')}
		aria-pressed={routeFilter === 'all'}
	>
		<span>Все области</span>
		<span class="text-xs text-text-muted">{goalDefinitions.length}</span>
	</button>
	{#each routeOptions as route (pageKey(route))}
		{@const key = pageKey(route)}
		<button
			type="button"
			class="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition focus-visible:ring-2 focus-visible:ring-link-600 {routeFilter ===
			key
				? 'bg-surface-muted text-text-primary'
				: 'text-text-secondary hover:bg-surface-card hover:text-text-primary'}"
			onclick={() => (routeFilter = key)}
			aria-pressed={routeFilter === key}
		>
			<span class="min-w-0 truncate">{route.label}</span>
			<code class="shrink-0 text-xs text-text-muted">
				{route.scope === 'sitewide' ? '*' : route.path}
			</code>
		</button>
	{/each}
{/snippet}
