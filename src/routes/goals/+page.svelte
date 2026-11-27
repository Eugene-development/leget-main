<script lang="ts">
	import { notifyError } from '$lib/utils/notify-error';
	import { onMount, untrack } from 'svelte';
	import type { GoalRemoteState } from '$lib/server/metrika-api';
	let {
		data
	}: {
		data: {
			metrikaConfigured: boolean;
			goalsSite: { domain: string; template: string; counterId: string };
		};
	} = $props();
	let selectedTemplate = $state(untrack(() => data.goalsSite.template));
	const goalDefinitions = $derived(goalsForTemplate(selectedTemplate));
	let counterId = $state(untrack(() => data.goalsSite.counterId));
	let selectedCounter = $state(untrack(() => data.goalsSite.counterId));
	let counters = $state<{ id: string; name: string }[]>([]);
	let remoteStates = $state<Record<string, GoalRemoteState>>({});
	let statesLoaded = $state(false);
	let busy = $state('');
	let integrationMessage = $state('');
	let integrationError = $state('');
	let creationFeedback = $state(false);
	let cancelled = $state(false);
	const ownTemplate = $derived(selectedTemplate === data.goalsSite.template);
	const missingGoals = $derived(
		goalDefinitions.filter((goal) => remoteStateFor(goal)?.state === 'missing')
	);
	const canCreate = $derived(
		data.metrikaConfigured && !!counterId && ownTemplate && statesLoaded && !busy
	);

	async function metrikaRequest(operation: string, extra: Record<string, string> = {}) {
		const response = await fetch('/goals/metrika', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ operation, ...extra }),
			signal: AbortSignal.timeout(45000)
		});
		const result = await response.json().catch(() => ({}));
		if (!response.ok)
			throw new Error(result.message || 'Не удалось выполнить запрос. Обновите статусы.');
		return result;
	}
	async function readRemoteState() {
		const result = await metrikaRequest('status');
		counters = result.counters;
		counterId = result.counterId;
		selectedCounter = counterId || counters[0]?.id || '';
		remoteStates = result.states;
		statesLoaded = !!counterId && !result.counterError;
		integrationError = result.counterError || '';
	}
	async function refreshMetrika() {
		if (busy) return;
		busy = 'refresh';
		creationFeedback = false;
		integrationError = '';
		integrationMessage = '';
		statesLoaded = false;
		try {
			await readRemoteState();
		} catch (error) {
			integrationError = notifyError(error, 'Не удалось проверить подключение.');
		} finally {
			busy = '';
		}
	}
	async function connectCounter() {
		if (busy || !selectedCounter) return;
		busy = 'connect';
		creationFeedback = false;
		integrationError = '';
		integrationMessage = '';
		statesLoaded = false;
		remoteStates = {};
		try {
			const result = await metrikaRequest('connect', { counterId: selectedCounter });
			counterId = result.counterId;
			integrationMessage = 'Счётчик сохранён в настройках сайта.';
			await readRemoteState();
		} catch (error) {
			integrationError = notifyError(error, 'Не удалось подключить счётчик.');
		} finally {
			busy = '';
		}
	}
	async function createGoals(goals: GoalDefinition[]) {
		if (!canCreate) return;
		busy = 'create';
		creationFeedback = true;
		integrationError = '';
		integrationMessage = '';
		cancelled = false;
		let completed = 0;
		const template = selectedTemplate;
		const targetCounter = counterId;
		try {
			for (const goal of goals) {
				if (cancelled) break;
				integrationMessage = `Обработка ${completed + 1} из ${goals.length}: ${goal.buttonLabel || goal.name}`;
				const result = await metrikaRequest('create', {
					template,
					counterId: targetCounter,
					eventName: goal.eventName
				});
				remoteStates = { ...remoteStates, [goal.eventName]: { state: 'created', id: result.id } };
				completed++;
			}
			integrationMessage = `${cancelled ? 'Остановлено.' : 'Готово.'} Подтверждено целей: ${completed} из ${goals.length}.`;
		} catch (error) {
			statesLoaded = false;
			integrationMessage = `Подтверждено целей: ${completed} из ${goals.length}.`;
			integrationError = notifyError(
				error,
				'Не удалось создать цель. Обновите статусы перед повтором.'
			);
		} finally {
			busy = '';
		}
	}
	onMount(() => {
		if (data.metrikaConfigured) void refreshMetrika();
		return () => {
			cancelled = true;
			clearTimeout(copyTimeout);
		};
	});

	import {
		goalsForTemplate,
		goalTemplates,
		type GoalDefinition,
		type GoalPage,
		type GoalPriority,
		type GoalType
	} from '$lib/yandex-direct/goals';

	type TypeFilter = 'all' | GoalType;
	type MetrikaStatus = GoalRemoteState['state'] | 'unchecked';

	const typeOptions = [
		{ value: 'all', label: 'Все типы' },
		{ value: 'click', label: 'Клики по кнопкам' },
		{ value: 'compound', label: 'Составные цели' }
	] as const satisfies readonly { value: TypeFilter; label: string }[];

	const metrikaStatusLabels = {
		created: 'Создана в Метрике',
		missing: 'Не создана в Метрике',
		conflict: 'Конфликт в Метрике',
		unchecked: 'Статус в Метрике не проверен'
	} satisfies Record<MetrikaStatus, string>;

	let query = $state('');
	let typeFilter = $state<TypeFilter>('all');
	let metrikaFilter = $state<'all' | MetrikaStatus>('all');
	let routeFilter = $state('all');
	let copiedId = $state<string | null>(null);
	let copyMessage = $state('');
	let copyFailed = $state(false);
	let copyTimeout: ReturnType<typeof setTimeout> | undefined;

	function pageKey(page: GoalPage): string {
		return page.scope === 'sitewide' ? 'sitewide' : `route:${page.path}`;
	}

	function remoteStateFor(goal: GoalDefinition): GoalRemoteState | undefined {
		return ownTemplate && data.metrikaConfigured && counterId && goal.status === 'implemented'
			? remoteStates[goal.eventName]
			: undefined;
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
			const matchesMetrika =
				metrikaFilter === 'all' ||
				(goal.status === 'implemented' &&
					(remoteStateFor(goal)?.state ?? 'unchecked') === metrikaFilter);
			if (!matchesType || !matchesRoute || !matchesMetrika) return false;
			if (!needle) return true;

			const searchable = [
				goal.name,
				goal.description ?? '',
				goal.eventName,
				goal.buttonLabel ?? '',
				goal.selector ?? '',
				...goal.pages.flatMap((page) => [
					page.label,
					page.scope === 'sitewide' ? 'весь сайт все страницы' : page.path,
					...(page.articles ?? [])
				])
			]
				.join(' ')
				.toLocaleLowerCase('ru');
			return searchable.includes(needle);
		});
	});

	const clickGoals = $derived(filteredGoals.filter((goal) => goal.type === 'click'));
	const compoundGoals = $derived(filteredGoals.filter((goal) => goal.type === 'compound'));
	const activeFilterCount = $derived(
		(typeFilter === 'all' ? 0 : 1) +
			(metrikaFilter === 'all' ? 0 : 1) +
			(routeFilter === 'all' ? 0 : 1) +
			(query.trim() ? 1 : 0)
	);
	const selectedRouteLabel = $derived(
		routeFilter === 'all'
			? 'Любая страница'
			: routeFilter === 'sitewide'
				? 'Весь сайт'
				: (routeOptions.find((page) => pageKey(page) === routeFilter)?.label ?? 'Любая страница')
	);

	function resetFilters() {
		query = '';
		typeFilter = 'all';
		metrikaFilter = 'all';
		routeFilter = 'all';
	}

	async function copyEvent(goal: GoalDefinition) {
		try {
			await navigator.clipboard.writeText(goal.eventName);
			clearTimeout(copyTimeout);
			copiedId = goal.id;
			copyFailed = false;
			copyMessage = `Идентификатор ${goal.eventName} скопирован.`;
			copyTimeout = setTimeout(() => {
				copiedId = null;
				copyMessage = '';
			}, 2400);
		} catch {
			clearTimeout(copyTimeout);
			copiedId = goal.id;
			copyFailed = true;
			copyMessage = 'Не удалось скопировать. Идентификатор можно выделить в деталях цели.';
		}
	}

	function priorityLabel(priority: GoalPriority): string {
		return priority === 'high' ? 'Высокий' : priority === 'medium' ? 'Средний' : 'Низкий';
	}
</script>

<svelte:head>
	<title>Карта целей — Яндекс Метрика</title>
	<meta name="description" content="Карта триггерных и составных целей сайта" />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="goals min-h-screen bg-ink-50 text-text-primary">
	<header class="border-b border-border-light bg-surface-card">
		<div class="frame py-6 sm:py-8">
			<a
				href="/"
				class="inline-flex min-h-11 items-center gap-2 text-sm font-medium hover:underline"
			>
				<svg
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path d="M19 12H5m6-6-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
				На сайт
			</a>
			<h1 class="mt-2 text-3xl text-balance sm:text-4xl">Карта целей Яндекс Метрики</h1>
			<p class="mt-3 max-w-[68ch] text-sm leading-relaxed text-text-secondary sm:text-base">
				Найдите нужную кнопку или сценарий, скопируйте идентификатор события либо создайте цель в
				подключённом счётчике.
			</p>
		</div>
	</header>

	<div class="frame space-y-6 py-6 sm:py-8">
		<section class="counter panel grid gap-5 p-4 sm:p-6" aria-labelledby="counter-title">
			<div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
				<div class="min-w-0">
					<h2 id="counter-title" class="text-xl">Счётчик сайта</h2>
					<p class="mt-1 text-sm wrap-anywhere text-text-secondary">
						{data.goalsSite.domain} · {data.goalsSite.template}
					</p>
				</div>
				<span class="status bg-surface-card">
					{#if !data.metrikaConfigured}
						Интеграция не настроена
					{:else if counterId}
						Счётчик № {counterId}
					{:else}
						Счётчик не выбран
					{/if}
				</span>
			</div>

			{#if data.metrikaConfigured}
				<div class="grid gap-3 sm:flex sm:flex-wrap sm:items-end">
					<div class="min-w-0 sm:max-w-lg sm:flex-1 sm:basis-64">
						<label for="metrika-counter" class="field-label">Доступные счётчики домена</label>
						<select
							id="metrika-counter"
							bind:value={selectedCounter}
							disabled={!!busy || !counters.length}
							class="field"
						>
							{#if !counters.some((counter) => counter.id === selectedCounter)}
								<option value="">Выберите счётчик</option>
							{/if}
							{#each counters as counter (counter.id)}
								<option value={counter.id}>{counter.name} · № {counter.id}</option>
							{/each}
						</select>
					</div>
					<button
						type="button"
						onclick={connectCounter}
						data-goal-ignore="Настройка счётчика владельцем сайта"
						disabled={!!busy || !selectedCounter || selectedCounter === counterId}
						class="action action-primary"
					>
						{busy === 'connect' ? 'Подключение…' : 'Подключить счётчик'}
					</button>
					<button
						type="button"
						onclick={refreshMetrika}
						data-goal-ignore="Проверка статусов владельцем сайта"
						disabled={!!busy}
						class="action"
					>
						{busy === 'refresh' ? 'Проверка…' : 'Обновить статусы'}
					</button>
				</div>
				{#if !busy && !counters.length && !integrationError}
					<p class="text-sm text-text-secondary">
						Счётчики с полным доступом для этого домена не найдены. Проверьте основной адрес или
						зеркала счётчика в Метрике.
					</p>
				{/if}
			{:else}
				<p class="max-w-[72ch] text-sm leading-relaxed text-text-secondary">
					Для подключения нужен серверный токен Метрики. Цели можно добавить вручную по
					идентификаторам из карты.
				</p>
			{/if}
			{#if !creationFeedback}
				{@render integrationFeedback()}
			{/if}
		</section>

		<div class="workspace grid items-start gap-6">
			<aside class="filters panel min-w-0 p-4 sm:p-5" aria-labelledby="filters-title">
				<h2 id="filters-title" class="text-xl">Фильтры</h2>
				<div class="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1">
					<div class="min-w-0">
						<label for="goal-template" class="field-label">Шаблон сайта</label>
						<select
							id="goal-template"
							bind:value={selectedTemplate}
							disabled={!!busy}
							onchange={resetFilters}
							class="field"
						>
							{#each goalTemplates as template (template)}
								<option value={template}>
									{template}{template === data.goalsSite.template ? ' · текущий сайт' : ''}
								</option>
							{/each}
						</select>
					</div>
					<div class="min-w-0">
						<label for="goal-search" class="field-label">Поиск по карте</label>
						<input
							id="goal-search"
							type="search"
							bind:value={query}
							placeholder="Название или идентификатор"
							class="field"
						/>
					</div>
					<div class="min-w-0">
						<label for="goal-metrika-status" class="field-label">Статус в Метрике</label>
						<select id="goal-metrika-status" bind:value={metrikaFilter} class="field">
							<option value="all">Все статусы</option>
							{#each Object.entries(metrikaStatusLabels) as [value, label] (value)}
								<option {value}>{label}</option>
							{/each}
						</select>
					</div>
				</div>

				<fieldset class="mt-4 min-w-0">
					<legend class="field-label">Тип цели</legend>
					<div class="flex flex-wrap gap-1 lg:flex-col">
						{#each typeOptions as option (option.value)}
							<button
								type="button"
								class="filter-option"
								onclick={() => (typeFilter = option.value)}
								data-goal-ignore="Фильтр административной карты целей"
								aria-pressed={typeFilter === option.value}
							>
								{option.label}
							</button>
						{/each}
					</div>
				</fieldset>

				<details class="group/filter mt-4 border-t border-border-light pt-2 lg:hidden">
					<summary
						class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm"
					>
						<span class="shrink-0 font-medium">Страница</span>
						<span
							class="flex min-w-0 items-center gap-2 text-right wrap-anywhere text-text-secondary"
						>
							{selectedRouteLabel}
							{@render chevron('size-4 shrink-0 group-open/filter:rotate-180')}
						</span>
					</summary>
					<div class="route-options">
						{@render routeFilterList()}
					</div>
				</details>

				<fieldset class="mt-4 hidden min-w-0 border-t border-border-light pt-4 lg:block">
					<legend class="sr-only">Страница срабатывания</legend>
					<p class="field-label">Страница срабатывания</p>
					<div class="route-options">
						{@render routeFilterList()}
					</div>
				</fieldset>

				{#if activeFilterCount > 0}
					<button
						type="button"
						class="mt-2 min-h-11 text-sm font-medium underline underline-offset-4"
						onclick={resetFilters}
						data-goal-ignore="Сброс фильтров административной карты целей"
					>
						Сбросить фильтры ({activeFilterCount})
					</button>
				{/if}
			</aside>

			<section class="min-w-0" aria-labelledby="registry-title">
				<div class="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
					<div>
						<h2 id="registry-title" class="text-2xl">Цели {selectedTemplate}</h2>
						<p class="mt-1 text-sm text-text-secondary tabular-nums" role="status">
							Показано {filteredGoals.length} из {goalDefinitions.length}
						</p>
					</div>
					{#if data.metrikaConfigured && ownTemplate}
						<div class="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onclick={() => createGoals(missingGoals)}
								data-goal-ignore="Массовое создание целей владельцем сайта"
								disabled={!canCreate || !missingGoals.length}
								class="action action-primary"
							>
								Создать все цели ({missingGoals.length})
							</button>
							{#if busy === 'create'}
								<button
									type="button"
									onclick={() => (cancelled = true)}
									data-goal-ignore="Остановка создания целей владельцем сайта"
									disabled={cancelled}
									class="action"
								>
									{cancelled ? 'Остановка…' : 'Остановить после текущей цели'}
								</button>
							{/if}
						</div>
					{/if}
				</div>
				{#if data.metrikaConfigured && !ownTemplate}
					<p class="counter panel mb-4 px-4 py-3 text-sm text-text-secondary">
						Для счётчика этого сайта доступны цели шаблона {data.goalsSite.template}.
					</p>
				{/if}
				{#if creationFeedback}
					<div class="mb-4 space-y-2">
						{@render integrationFeedback()}
					</div>
				{/if}
				<p class="sr-only" role="status">{copyMessage}</p>

				{#if filteredGoals.length === 0}
					<div class="panel bg-surface-card px-4 py-12 text-center">
						<h3 class="text-xl">Цели не найдены</h3>
						<p class="mt-2 text-sm text-text-secondary">
							Измените запрос или сбросьте фильтры, чтобы увидеть всю карту.
						</p>
						<button
							type="button"
							class="action mt-4"
							onclick={resetFilters}
							data-goal-ignore="Сброс фильтров административной карты целей"
						>
							Показать все цели
						</button>
					</div>
				{:else}
					<div class="space-y-6">
						{#if clickGoals.length > 0}
							{@render goalGroup('click', 'Клики по кнопкам', clickGoals)}
						{/if}
						{#if compoundGoals.length > 0}
							{@render goalGroup('compound', 'Составные цели', compoundGoals)}
						{/if}
					</div>
				{/if}
			</section>
		</div>
	</div>
</main>

{#snippet integrationFeedback()}
	<p class={integrationMessage ? 'counter panel px-4 py-3 text-sm' : 'sr-only'} role="status">
		{integrationMessage}
	</p>
	{#if integrationError}
		<p class="error panel px-4 py-3 text-sm" role="alert">
			{integrationError} Нажмите «Обновить статусы» перед повтором.
		</p>
	{/if}
{/snippet}

{#snippet chevron(className: string)}
	<svg class={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
		<path d="m6 9 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
{/snippet}

{#snippet goalGroup(type: GoalType, title: string, goals: GoalDefinition[])}
	<section class="goal-group panel" data-type={type} aria-labelledby={'group-' + type}>
		<div class="group-header flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
			<h3 id={'group-' + type} class="text-xl">{title}</h3>
			<span class="status bg-surface-card tabular-nums">{goals.length}</span>
		</div>
		{#if type === 'click'}
			<p class="border-b border-border-light px-4 py-3 text-sm text-text-secondary sm:px-5">
				Цель «Нажатие отправки» фиксирует клик. Приём заявки проверяется отдельно.
			</p>
		{/if}
		<ul class="divide-y divide-border-light">
			{#each goals as goal (goal.id)}
				<li class="relative">{@render goalRow(goal)}</li>
			{/each}
		</ul>
	</section>
{/snippet}

{#snippet goalRow(goal: GoalDefinition)}
	{@const remote = remoteStateFor(goal)}
	{@const metrikaStatus = remote?.state ?? 'unchecked'}
	{@const copied = copiedId === goal.id && !copyFailed}
	<details class="group/row min-w-0">
		<summary class="goal-summary grid cursor-pointer list-none items-center gap-x-3 gap-y-2 py-3.5">
			<span class="goal-title min-w-0 wrap-anywhere">
				<strong class="block text-sm font-semibold sm:text-base">{goal.name}</strong>
				<span class="mt-0.5 block text-sm text-text-secondary">
					{goal.status === 'implemented' ? 'Подключена в коде' : 'Черновик'}
				</span>
			</span>
			{#if goal.status === 'implemented'}
				<span class="goal-status status" data-state={metrikaStatus}>
					{metrikaStatusLabels[metrikaStatus]}
				</span>
			{/if}
			{@render chevron('goal-chevron size-5 text-text-secondary group-open/row:rotate-180')}
			{#if copiedId === goal.id && copyFailed}
				<span class="error col-span-full rounded-md px-3 py-2 text-sm">{copyMessage}</span>
			{/if}
		</summary>

		<div
			class="goal-detail grid min-w-0 gap-x-6 gap-y-5 border-t border-border-light px-4 py-5 sm:px-5 xl:grid-cols-2"
		>
			<div class="min-w-0 space-y-4">
				<div>
					<p class="field-label">Условие срабатывания</p>
					<p class="text-sm leading-relaxed">{goal.condition}</p>
					{#if goal.dependsOn}
						<ul class="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
							{#each goal.dependsOn as dependency}
								<li>{dependency}</li>
							{/each}
						</ul>
					{/if}
				</div>
				{#if goal.description}
					<p class="text-sm leading-relaxed wrap-anywhere text-text-secondary">
						{goal.description}
					</p>
				{/if}
				<details class="group/locations rounded-lg border border-border-light bg-surface-card">
					<summary
						class="location-summary flex min-h-11 cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-2 text-sm"
					>
						<span class="font-semibold">Где срабатывает</span>
						<span class="ml-auto text-xs text-text-secondary tabular-nums">{goal.pages.length}</span
						>
						{@render chevron('size-4 shrink-0 text-text-secondary group-open/locations:rotate-180')}
					</summary>
					<ul class="divide-y divide-border-light border-t border-border-light">
						{#each goal.pages as page (pageKey(page))}
							<li class="px-3 py-3 wrap-anywhere">
								{#if page.scope === 'route'}
									<a
										href={page.path}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex flex-wrap items-baseline gap-x-2 text-sm underline underline-offset-4"
									>
										{page.label} <code class="text-xs">{page.path}</code>
									</a>
								{:else}
									<span class="text-sm">{page.label}</span>
								{/if}
								{#if page.articles?.length}
									<p class="mt-1 text-xs text-text-secondary">
										{page.articles.length === 1 ? 'Артикул' : 'Артикулы'}
										{page.articles.join(', ')}
									</p>
								{:else if page.articles}
									<p class="mt-1 text-xs text-text-secondary">
										Общая форма без отдельного артикула
									</p>
								{/if}
							</li>
						{/each}
					</ul>
				</details>
			</div>

			<div class="min-w-0">
				<p class="field-label">Идентификатор события</p>
				<code class="event-box block px-3 py-2 text-sm leading-relaxed wrap-anywhere select-all">
					{goal.eventName}
				</code>

				<dl
					class="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-sm wrap-anywhere"
				>
					{#if goal.buttonLabel}
						<dt class="text-text-secondary">Кнопка</dt>
						<dd>«{goal.buttonLabel}»</dd>
					{/if}
					{#if goal.selector}
						<dt class="text-text-secondary">Селектор</dt>
						<dd><code class="text-xs">{goal.selector}</code></dd>
					{/if}
					<dt class="text-text-secondary">Приоритет</dt>
					<dd>{priorityLabel(goal.priority)}</dd>
					<dt class="text-text-secondary">Отправка</dt>
					<dd>
						{goal.status === 'implemented' ? 'reachGoal при настроенном счётчике' : 'Не подключена'}
					</dd>
				</dl>

				{#if goal.status === 'implemented' && ownTemplate && data.metrikaConfigured}
					{#if remote?.state === 'missing'}
						<button
							type="button"
							onclick={() => createGoals([goal])}
							data-goal-ignore="Создание цели владельцем сайта"
							disabled={!canCreate}
							class="action mt-4"
						>
							{busy === 'create' ? 'Создание целей…' : 'Создать в Метрике'}
						</button>
					{:else}
						<p class="mt-4 text-sm text-text-secondary">
							{remote?.state === 'created'
								? `Создана в Метрике · № ${remote.id}`
								: remote?.state === 'conflict'
									? 'Конфликт условий. Проверьте цель в Метрике.'
									: 'Статус цели в Метрике не проверен.'}
						</p>
					{/if}
				{/if}
			</div>
		</div>
	</details>
	<button
		type="button"
		class="copy-action action absolute top-3.5 grid size-11 place-items-center"
		data-copied={copied}
		title={copied ? 'Скопировано' : 'Скопировать идентификатор цели'}
		aria-label={copied
			? `Идентификатор скопирован · ${goal.name}`
			: `Скопировать идентификатор цели · ${goal.name}`}
		onclick={() => copyEvent(goal)}
		data-goal-ignore="Копирование идентификатора в административной карте целей"
	>
		<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
			{#if copied}
				<path d="m5 12 4 4L19 6" stroke-linecap="round" stroke-linejoin="round" />
			{:else}
				<rect x="8" y="8" width="12" height="12" rx="2" />
				<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke-linecap="round" />
			{/if}
		</svg>
	</button>
{/snippet}

{#snippet routeFilterList()}
	<button
		type="button"
		class="filter-option w-full"
		onclick={() => (routeFilter = 'all')}
		data-goal-ignore="Фильтр административной карты целей"
		aria-pressed={routeFilter === 'all'}
	>
		Любая страница
	</button>
	{#each routeOptions as route (pageKey(route))}
		{@const key = pageKey(route)}
		<button
			type="button"
			class="filter-option w-full wrap-anywhere"
			onclick={() => (routeFilter = key)}
			data-goal-ignore="Фильтр административной карты целей"
			aria-pressed={routeFilter === key}
		>
			{route.scope === 'sitewide' ? 'Весь сайт' : route.label}
			{#if route.scope === 'route'}
				<code class="block text-xs text-text-secondary">{route.path}</code>
			{/if}
		</button>
	{/each}
{/snippet}

<style>
	.goals {
		--counter-fill: color-mix(in srgb, var(--color-link-500) 8%, var(--color-surface-card));
		--filter-fill: color-mix(in srgb, var(--color-cat-1-500) 9%, var(--color-surface-card));
		--selected-fill: color-mix(in srgb, var(--color-link-500) 14%, var(--color-surface-card));
		--control-border: color-mix(in srgb, var(--color-text-primary) 42%, var(--color-surface-card));
	}

	.frame {
		width: min(100%, 90rem);
		margin-inline: auto;
		padding-inline: 1rem;
	}

	.panel {
		border: 1px solid var(--color-border-light);
		border-radius: var(--ds-radius-xl);
	}

	.counter {
		background: var(--counter-fill);
	}

	.filters {
		background: var(--filter-fill);
	}

	.field-label {
		display: block;
		margin-bottom: 0.375rem;
		font-size: 0.875rem;
		font-weight: 600;
	}

	.field,
	.action {
		min-height: 2.75rem;
		border: 1px solid var(--control-border);
		border-radius: var(--ds-radius-lg);
		background-color: var(--color-surface-card);
		color: var(--color-text-primary);
		font-size: 0.875rem;
	}

	.field {
		width: 100%;
		padding: 0.5rem 0.75rem;
	}

	select.field {
		padding-right: 2rem;
	}

	.field::placeholder {
		color: var(--color-text-secondary);
	}

	.action {
		padding: 0.5rem 0.875rem;
		font-weight: 600;
	}

	.action-primary {
		border-color: var(--color-ink-900);
		background: var(--color-ink-900);
		color: var(--color-on-dark);
	}

	.action:not(:disabled):hover {
		background: var(--selected-fill);
	}

	.action-primary:not(:disabled):hover {
		background: var(--color-ink-800);
	}

	.field:disabled,
	.action:disabled {
		cursor: not-allowed;
		opacity: 0.55;
	}

	.filters summary::-webkit-details-marker,
	.goal-summary::-webkit-details-marker,
	.location-summary::-webkit-details-marker {
		display: none;
	}

	.filter-option {
		min-height: 2.75rem;
		padding: 0.375rem 0.625rem;
		border: 1px solid transparent;
		border-radius: var(--ds-radius-lg);
		text-align: left;
		font-size: 0.875rem;
	}

	.filter-option:hover {
		background: var(--color-surface-card);
	}

	.filter-option[aria-pressed='true'] {
		border-color: var(--control-border);
		background: var(--selected-fill);
		font-weight: 600;
	}

	.route-options {
		display: grid;
		max-height: 13rem;
		gap: 0.125rem;
		overflow-y: auto;
		padding: 0.1875rem;
	}

	.goals :is(a, button, input, select, summary):focus-visible {
		outline: 2px solid var(--color-text-primary);
		outline-offset: 2px;
	}

	.goal-group {
		background: var(--color-surface-card);
		--goal-row-inset: 1rem;
		--group-color: var(--color-cat-9-500);
		--group-fill: color-mix(in srgb, var(--group-color) 14%, var(--color-surface-card));
		--detail-fill: color-mix(in srgb, var(--group-color) 5%, var(--color-surface-card));
	}

	.goal-group[data-type='compound'] {
		--group-color: var(--color-cat-3-500);
	}

	.group-header {
		border-bottom: 1px solid var(--color-border-light);
		border-radius: inherit;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
		background: var(--group-fill);
	}

	.goal-summary {
		grid-template-columns: minmax(0, 1fr) 2.75rem 1.25rem;
		grid-template-areas: 'title copy chevron';
		grid-template-rows: minmax(2.75rem, auto);
		padding-inline: var(--goal-row-inset);
	}

	.goal-summary:has(.goal-status) {
		grid-template-areas: 'title copy chevron' 'status status status';
	}

	.goal-summary:hover,
	details[open] > .goal-summary {
		background: var(--detail-fill);
	}

	.goal-summary:focus-visible {
		outline-offset: -3px;
	}

	.goal-title {
		grid-area: title;
	}

	.goal-status {
		grid-area: status;
		justify-self: start;
	}

	.goal-chevron {
		grid-area: chevron;
	}

	.copy-action {
		right: calc(var(--goal-row-inset) + 2rem);
		padding: 0;
	}

	.status {
		display: inline-flex;
		align-items: center;
		border: 1px solid var(--color-border-light);
		border-radius: var(--ds-radius-md);
		padding: 0.1875rem 0.5rem;
		background-color: var(--color-surface-card);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.goal-status[data-state='missing'] {
		background-color: var(--filter-fill);
	}

	.goal-status[data-state='created'],
	.copy-action[data-copied='true'] {
		background-color: color-mix(in srgb, var(--color-cat-2-500) 13%, var(--color-surface-card));
	}

	.error,
	.goal-status[data-state='conflict'] {
		background-color: color-mix(in srgb, var(--color-cat-6-500) 13%, var(--color-surface-card));
	}

	.goal-detail {
		background: var(--detail-fill);
	}

	.event-box {
		border: 1px solid var(--color-border-light);
		border-radius: var(--ds-radius-lg);
		background-color: var(--color-surface-card);
	}

	.goals svg {
		stroke-width: var(--ds-icon-stroke-bold);
	}

	@media (min-width: 40rem) {
		.frame {
			padding-inline: 2rem;
		}

		.goal-group {
			--goal-row-inset: 1.25rem;
		}

		.goal-summary:has(.goal-status) {
			grid-template-columns: minmax(0, 1fr) auto 2.75rem 1.25rem;
			grid-template-areas: 'title status copy chevron';
		}
	}

	@media (min-width: 64rem) {
		.workspace {
			grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr);
		}
	}

	@media (min-width: 64rem) and (min-height: 48rem) {
		.filters {
			position: sticky;
			top: 1rem;
			max-height: calc(100dvh - 2rem);
			overflow-y: auto;
		}
	}
</style>
