<script lang="ts">
	// Артикул: 1.27.2.1 — см. docs/architecture/component-articles-map.md
	import { editStore } from '$lib/stores/edit.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { requestApply, VACANCY_FORM_ID } from './apply';
	import { revealOnScroll } from './theme';
	import './theme.css';
	import '../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'light'));

	/**
	 * Акцент страницы — индиго (`cat-4`), а не роль `p1-accent`: в Базовой она
	 * красная, и страница ушла бы в другую гамму, чем нарисована.
	 *
	 * Шкала от темы не зависит, но ступень зависит: на светлой поверхности
	 * читается 600, на тёмной она уходит в фон. Развилка объявлена один раз
	 * здесь — палитрой, как у PageHero, — а не условиями по месту.
	 */
	const accent = $derived(
		isLight
			? {
					text: 'text-cat-4-600',
					pill: 'border-cat-4-500/25 bg-cat-4-50 text-cat-4-700',
					dot: 'bg-cat-4-500',
					link: 'hover:border-cat-4-500 hover:text-cat-4-600'
				}
			: {
					text: 'text-cat-4-300',
					pill: 'border-cat-4-400/30 bg-cat-4-500/15 text-cat-4-200',
					dot: 'bg-cat-4-400',
					link: 'hover:border-cat-4-400 hover:text-cat-4-300'
				}
	);

	type Vacancy = {
		id: string;
		hidden?: boolean;
		title: string;
		type: string;
		location: string;
		salary: string;
		/** Путь значка внутри viewBox 24×24 — только `d`, без разметки. */
		icon: string;
		description: string;
		duties: string[];
		requirements: string[];
	};

	// Стартовое наполнение приходит из API; пустой массив означает удалённый список.
	const vacancies = $derived(Array.isArray(data?.vacancies) ? (data.vacancies as Vacancy[]) : []);
	const publishedVacancies = $derived(vacancies.filter((vacancy) => !vacancy.hidden));
	const controlClass =
		'p1-title p1-border min-h-11 cursor-pointer rounded-lg border px-4 py-2 text-sm transition hover:bg-ink-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50';
	let saving = $state(false);
	let actionError = $state('');
	let actionStatus = $state('');
	let deletingId = $state<string | null>(null);
	const controlsDisabled = $derived(saving || editStore.activeField !== null);

	/**
	 * Раскрыта одна позиция за раз: список остаётся описью, а не разъезжается
	 * в четыре простыни сразу. `null` означает «посетитель ещё не трогал» —
	 * тогда открыта первая; чтобы закрыть все, кладём пустую строку.
	 *
	 * Это состояние просмотра, а не контент: в `data` оно не пишется
	 * и других посетителей не касается.
	 */
	let openId = $state<string | null>(null);
	const activeId = $derived(openId ?? publishedVacancies[0]?.id ?? '');

	/**
	 * В режиме правки раскрыты все и строка перестаёт быть кнопкой.
	 *
	 * Причин две, и обе жёсткие. Свёрнутый текст недоступен для правки — ровно
	 * то соображение, из-за которого аккордеона нет у InstallmentFAQ. А карандаш
	 * <EditableField> — сам по себе <button>, и внутри кнопки-строки он дал бы
	 * вложенную кнопку: разметка невалидна, а клик по карандашу вдобавок
	 * сворачивал бы карточку. Посетителю аккордеон нужен, поэтому он остаётся,
	 * а правка получает развёрнутый вид.
	 */
	function isOpen(id: string): boolean {
		return isEditable || activeId === id;
	}

	function toggle(id: string) {
		openId = activeId === id ? '' : id;
	}

	async function saveField(field: string, value: unknown, hiddenFields?: string[]) {
		if (!isEditable || !editContext)
			throw new Error('Войдите как владелец сайта для редактирования.');
		if (saving) throw new Error('Дождитесь завершения сохранения.');
		saving = true;
		try {
			const updated = { ...data, [field]: value };
			// Ключи скрытых полей используют индекс строки: при удалении переносим
			// их вместе с вакансией, чтобы не скрыть поля соседней позиции.
			if (field === 'vacancies' && Array.isArray(value) && Array.isArray(data.hiddenFields)) {
				updated.hiddenFields = data.hiddenFields.flatMap((key: string) => {
					const match = /^(\d+)\.(.+)$/.exec(key);
					if (!match) return [key];
					const id = vacancies[Number(match[1])]?.id;
					const nextIndex = value.findIndex((vacancy: Vacancy) => vacancy.id === id);
					return nextIndex < 0 ? [] : [`${nextIndex}.${match[2]}`];
				});
			}
			if (hiddenFields) updated.hiddenFields = hiddenFields;
			const id = await saveComponentData(editContext, 'VacancyList', updated);
			if (!id) throw new Error('Сервер не подтвердил сохранение. Повторите попытку.');
			data = updated;
		} finally {
			saving = false;
		}
	}

	/** Правка поля позиции: список позиций хранится целиком в `data.vacancies`. */
	async function updateVacancy(index: number, field: keyof Vacancy, value: string) {
		const updated = vacancies.map((v, i) => (i === index ? { ...v, [field]: value } : v));
		await saveField('vacancies', updated);
	}

	/** Правка одной строки в перечне обязанностей или требований. */
	async function updateBullet(
		index: number,
		field: 'duties' | 'requirements',
		bulletIndex: number,
		value: string
	) {
		const updated = vacancies.map((v, i) =>
			i === index
				? { ...v, [field]: v[field].map((line, j) => (j === bulletIndex ? value : line)) }
				: v
		);
		await saveField('vacancies', updated);
	}
	async function changeList(next: Vacancy[], message: string, hiddenFields?: string[]) {
		if (controlsDisabled) return;
		actionError = '';
		actionStatus = '';
		try {
			await saveField('vacancies', next, hiddenFields);
			deletingId = null;
			actionStatus = message;
		} catch (error) {
			actionError =
				error instanceof Error ? error.message : 'Не удалось сохранить. Повторите попытку.';
		}
	}

	async function addVacancy() {
		const vacancy: Vacancy = {
			id: crypto.randomUUID(),
			hidden: true,
			title: 'Новая вакансия',
			type: 'Полная занятость',
			location: 'Укажите город',
			salary: 'Укажите зарплату',
			icon: 'M4 7h16v14H4zM9 7V3h6v4',
			description: 'Расскажите о вакансии',
			duties: ['Укажите обязанности'],
			requirements: ['Укажите требования']
		};
		await changeList(
			[...vacancies, vacancy],
			'Вакансия добавлена и скрыта от посетителей. Заполните поля и нажмите «Опубликовать».'
		);
	}

	function toggleVacancy(index: number) {
		const hidden = !vacancies[index].hidden;
		return changeList(
			vacancies.map((v, i) => (i === index ? { ...v, hidden } : v)),
			hidden ? 'Вакансия скрыта от посетителей.' : 'Вакансия опубликована.'
		);
	}

	async function deleteVacancy(id: string) {
		await changeList(
			vacancies.filter((v) => v.id !== id),
			'Вакансия удалена.'
		);
		if (!vacancies.some((v) => v.id === openId)) openId = null;
	}

	function changeBullets(index: number, field: 'duties' | 'requirements', removeIndex?: number) {
		const lines = vacancies[index][field];
		const next =
			removeIndex === undefined
				? [...lines, 'Новый пункт']
				: lines.filter((_, j) => j !== removeIndex);
		const hiddenFields =
			removeIndex !== undefined && Array.isArray(data.hiddenFields)
				? (data.hiddenFields as string[]).flatMap((key) => {
						const prefix = `${index}.${field}.`;
						if (!key.startsWith(prefix)) return [key];
						const bulletIndex = Number(key.slice(prefix.length));
						if (bulletIndex === removeIndex) return [];
						return [bulletIndex > removeIndex ? `${prefix}${bulletIndex - 1}` : key];
					})
				: undefined;
		return changeList(
			vacancies.map((v, i) => (i === index ? { ...v, [field]: next } : v)),
			'Список сохранён.',
			hiddenFields
		);
	}
</script>

<!--
	Содержимое строки позиции. Вынесено в snippet, потому что носитель у него
	разный: посетителю строка отдаётся кнопкой (вся строка — зона нажатия,
	на 390px это единственный способ удержать цель выше 44px), а в режиме
	правки — обычным <div>, см. isOpen() выше.
-->
{#snippet row(vacancy: Vacancy, i: number)}
	<span
		class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-cat-4-400 to-cat-4-500 text-on-accent sm:size-14"
		aria-hidden="true"
	>
		<svg
			class="size-6 sm:size-7"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="1.5"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d={vacancy.icon} />
		</svg>
	</span>

	<span class="flex min-w-0 flex-1 flex-col gap-1.5">
		<span class="p1-title-sub p1-title text-lg sm:text-xl">
			<EditableField
				fieldKey="VacancyList.{i}.title"
				label="Должность"
				value={vacancy.title}
				{isEditable}
				inline
				onSave={(v) => updateVacancy(i, 'title', v)}
			>
				{#snippet children(val)}<RichText value={val} />{/snippet}
			</EditableField>
		</span>
		<span class="p1-muted p1-note">
			<EditableField
				fieldKey="VacancyList.{i}.type"
				label="Занятость"
				value={vacancy.type}
				{isEditable}
				inline
				onSave={(v) => updateVacancy(i, 'type', v)}
			>
				{#snippet children(val)}<RichText value={val} />{/snippet}
			</EditableField>
			·
			<EditableField
				fieldKey="VacancyList.{i}.location"
				label="Город"
				value={vacancy.location}
				{isEditable}
				inline
				onSave={(v) => updateVacancy(i, 'location', v)}
			>
				{#snippet children(val)}<RichText value={val} />{/snippet}
			</EditableField>
		</span>
	</span>

	<!--
		Оклад. На узком экране уходит под подпись отдельной строкой
		(`basis-full` + `order-last`), на широком встаёт в строку перед
		шевроном. Элемент один, а не два по медиазапросу: второй пришлось бы
		завести с тем же ключом правки, и карандашей на одно поле стало бы два.
	-->
	<span class="order-last basis-full sm:order-none sm:basis-auto">
		<span class="p1-numeric inline-block rounded-full border px-4 py-1.5 text-sm {accent.pill}">
			<EditableField
				fieldKey="VacancyList.{i}.salary"
				label="Оклад"
				value={vacancy.salary}
				{isEditable}
				inline
				onSave={(v) => updateVacancy(i, 'salary', v)}
			>
				{#snippet children(val)}<RichText value={val} />{/snippet}
			</EditableField>
		</span>
	</span>

	{#if !isEditable}
		<span
			class="p1-muted flex shrink-0 items-center transition-transform duration-300"
			class:rotate-180={isOpen(vacancy.id)}
			aria-hidden="true"
		>
			<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</span>
	{/if}
{/snippet}

<!--
	Опись открытых позиций.

	ВНИМАНИЕ — стык секций: сверху в блок «вливается» волна из VacancyHero,
	её заливка равна `--ds-light-surface-alt`, то есть фону этой секции
	в светлой теме. В тёмную переводить нужно оба блока сразу, иначе на стыке
	появится полоса.
-->
<section
	class="p1-surface-alt relative isolate overflow-clip py-section-sm"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	{#if isEditable && editContext}
		<!-- Full-height rail keeps the controls within this section. overflow-clip
		     above preserves decoration clipping without creating a scroll container. -->
		<div class="pointer-events-none absolute inset-0 z-[100] p-2 sm:p-6">
			<div
				class="pointer-events-auto sticky ml-auto w-fit"
				style="top: calc(var(--header-h, 0px) + 0.75rem)"
			>
				<SingleVersionSettings
					bind:data
					{editContext}
					{isEditable}
					componentType="VacancyList"
					placement="inline"
					themeToggle
					themeDefault="light"
					title="Открытые позиции"
				/>
			</div>
		</div>
	{/if}

	{#if isLight}
		<div class="pointer-events-none absolute inset-0" aria-hidden="true">
			<div class="vc-rules"></div>
		</div>
	{/if}

	<div class="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
		<div use:revealOnScroll class="vc-reveal text-center">
			<EditableField
				fieldKey="VacancyList.label"
				label="Метка"
				value={String(data?.label ?? 'Открытые позиции')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
				class="vc-item block"
			>
				{#snippet children(displayValue)}
					<span class="p1-label {accent.text}"><RichText value={displayValue} /></span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="VacancyList.title"
				label="Заголовок"
				value={String(data?.title ?? 'Кого мы ищем')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="vc-item vc-d1 mt-5 block"
			>
				{#snippet children(displayValue)}
					<h2 class="p1-title text-3xl text-pretty sm:text-4xl">
						<RichText value={displayValue} />
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="VacancyList.description"
				label="Пояснение"
				value={String(
					data?.description ?? 'Нажмите на позицию, чтобы раскрыть обязанности и требования.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="vc-item vc-d3 mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="p1-body mx-auto max-w-xl text-base/7 text-pretty">
						<RichText value={displayValue} />
					</p>
				{/snippet}
			</EditableField>
		</div>

		<div use:revealOnScroll class="vc-reveal mt-14 flex flex-col gap-4">
			{#if isEditable}
				<div class="p1-body flex flex-wrap items-center gap-4">
					<button
						type="button"
						class={controlClass}
						disabled={controlsDisabled}
						data-goal-ignore="Редактор: добавление вакансии"
						onclick={addVacancy}>Добавить вакансию</button
					>
					<span class="text-sm"
						>Новые вакансии скрыты до публикации. Текст можно изменить через карандаш.</span
					>
				</div>
				<p class="p1-body text-sm" role="status">{saving ? 'Сохранение…' : actionStatus}</p>
				{#if actionError}<p class="p1-title" role="alert">{actionError}</p>{/if}
			{/if}
			{#if (isEditable ? vacancies : publishedVacancies).length === 0}
				<p class="p1-body py-8 text-center">
					{isEditable ? 'Вакансий пока нет. Добавьте первую.' : 'Сейчас открытых вакансий нет.'}
				</p>
			{/if}
			{#each vacancies as vacancy, i (vacancy.id ?? i)}
				{#if isEditable || !vacancy.hidden}
					<div
						inert={saving}
						class="vc-card p1-card p1-card-hover overflow-hidden rounded-3xl border transition duration-300"
						style="--vc-delay: {i * 70}ms"
					>
						{#if isEditable}
							<div
								class="p1-line p1-body flex flex-wrap items-center gap-3 border-b px-6 py-4 sm:px-7"
							>
								<span class="mr-auto text-sm"
									>{vacancy.hidden ? 'Скрыта от посетителей' : 'Опубликована'}</span
								>
								<button
									type="button"
									class={controlClass}
									disabled={controlsDisabled}
									data-goal-ignore="Редактор: видимость вакансии"
									onclick={() => toggleVacancy(i)}
									>{vacancy.hidden ? 'Опубликовать' : 'Скрыть'}</button
								>
								{#if deletingId === vacancy.id}
									<span class="text-sm">Удалить вакансию без возможности восстановления?</span>
									<button
										type="button"
										class={controlClass}
										disabled={controlsDisabled}
										data-goal-ignore="Редактор: подтверждение удаления вакансии"
										onclick={() => deleteVacancy(vacancy.id)}>Да, удалить</button
									>
									<button
										type="button"
										class={controlClass}
										disabled={controlsDisabled}
										data-goal-ignore="Редактор: отмена удаления вакансии"
										onclick={() => (deletingId = null)}>Отмена</button
									>
								{:else}
									<button
										type="button"
										class={controlClass}
										disabled={controlsDisabled}
										data-goal-ignore="Редактор: удаление вакансии"
										onclick={() => (deletingId = vacancy.id)}>Удалить</button
									>
								{/if}
							</div>
							<div class="flex flex-wrap items-center gap-x-4 gap-y-4 p-6 sm:gap-x-6 sm:p-7">
								{@render row(vacancy, i)}
							</div>
						{:else}
							<button
								type="button"
								class="flex w-full cursor-pointer flex-wrap items-center gap-x-4 gap-y-4 p-6 text-left sm:gap-x-6 sm:p-7"
								aria-expanded={isOpen(vacancy.id)}
								aria-controls="vacancy-panel-{vacancy.id ?? i}"
								onclick={() => toggle(vacancy.id)}
							>
								{@render row(vacancy, i)}
							</button>
						{/if}

						<div
							class="vc-fold"
							data-open={isOpen(vacancy.id) ? 'true' : 'false'}
							id="vacancy-panel-{vacancy.id ?? i}"
						>
							<div>
								<div class="px-6 pb-7 sm:px-7 sm:pb-8">
									<div class="p1-line mb-6 border-t"></div>

									<p class="p1-body max-w-3xl text-base/7">
										<EditableField
											fieldKey="VacancyList.{i}.description"
											label="Описание позиции"
											value={vacancy.description}
											{isEditable}
											inline
											multiline
											onSave={(v) => updateVacancy(i, 'description', v)}
										>
											{#snippet children(val)}<RichText value={val} />{/snippet}
										</EditableField>
									</p>

									<!--
									Обязанности и требования: на широком экране две колонки,
									на узком одна. Владелец может править и состав перечней.
								-->
									<div class="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-10">
										<div>
											<span class="p1-label p1-muted">Обязанности</span>
											<ul class="mt-4 flex flex-col gap-3">
												{#each vacancy.duties as duty, j (j)}
													<li class="p1-body flex gap-3 text-sm/6">
														<span
															class="mt-2 size-1.5 shrink-0 rounded-full {accent.dot}"
															aria-hidden="true"
														></span>
														<span>
															<EditableField
																fieldKey="VacancyList.{i}.duties.{j}"
																label="Обязанность"
																value={duty}
																{isEditable}
																inline
																multiline
																onSave={(v) => updateBullet(i, 'duties', j, v)}
															>
																{#snippet children(val)}<RichText value={val} />{/snippet}
															</EditableField>
														</span>
														{#if isEditable}
															<button
																type="button"
																class="{controlClass} shrink-0 self-start"
																disabled={controlsDisabled}
																aria-label="Удалить пункт"
																data-goal-ignore="Редактор: удаление пункта вакансии"
																onclick={() => changeBullets(i, 'duties', j)}>Удалить</button
															>
														{/if}
													</li>
												{/each}
											</ul>
											{#if isEditable}
												<button
													type="button"
													class="{controlClass} mt-4"
													disabled={controlsDisabled}
													data-goal-ignore="Редактор: добавление пункта вакансии"
													onclick={() => changeBullets(i, 'duties')}>Добавить пункт</button
												>
											{/if}
										</div>

										<div>
											<span class="p1-label p1-muted">Требования</span>
											<ul class="mt-4 flex flex-col gap-3">
												{#each vacancy.requirements as requirement, j (j)}
													<li class="p1-body flex gap-3 text-sm/6">
														<span
															class="p1-rail mt-2 size-1.5 shrink-0 rounded-full"
															aria-hidden="true"
														></span>
														<span>
															<EditableField
																fieldKey="VacancyList.{i}.requirements.{j}"
																label="Требование"
																value={requirement}
																{isEditable}
																inline
																multiline
																onSave={(v) => updateBullet(i, 'requirements', j, v)}
															>
																{#snippet children(val)}<RichText value={val} />{/snippet}
															</EditableField>
														</span>
														{#if isEditable}
															<button
																type="button"
																class="{controlClass} shrink-0 self-start"
																disabled={controlsDisabled}
																aria-label="Удалить пункт"
																data-goal-ignore="Редактор: удаление пункта вакансии"
																onclick={() => changeBullets(i, 'requirements', j)}>Удалить</button
															>
														{/if}
													</li>
												{/each}
											</ul>
											{#if isEditable}
												<button
													type="button"
													class="{controlClass} mt-4"
													disabled={controlsDisabled}
													data-goal-ignore="Редактор: добавление пункта вакансии"
													onclick={() => changeBullets(i, 'requirements')}>Добавить пункт</button
												>
											{/if}
										</div>
									</div>

									<!--
									«Откликнуться» — ссылка на якорь формы, а не кнопка со
									скриптом: форма стоит отдельным блоком ниже, и посетитель
									обязан попадать к ней даже без JS. Событие лишь подставляет
									позицию в поле (см. ./apply.ts).
								-->
									<div class="mt-8">
										<a
											class="p1-border p1-title inline-flex items-center gap-2.5 rounded-full border px-7 py-3 text-sm font-semibold transition duration-300 {accent.link}"
											href="#{VACANCY_FORM_ID}"
											onclick={() => requestApply(vacancy.title)}
										>
											Откликнуться
											<span aria-hidden="true">→</span>
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>
</section>
