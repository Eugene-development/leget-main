<script lang="ts">
	// Артикул: 1.26.1.1 — см. docs/architecture/component-articles-map.md
	//
	// Блок сменил роль 24.08.2026 и сменил её целиком. Раньше это был Hero на
	// общем `_shared/PageHero.svelte`: тёмная плашка, слово «Проекты» и волна —
	// то есть первый экран, занятый обещанием списка, который начинался под ним.
	// Замер показал 48% окна ноутбука до первой работы.
	//
	// Теперь отдельной шапки у страницы нет вовсе. Её открывает САМА последняя
	// сданная работа, а название страницы стоит меткой над ней. Граница
	// «шапка / контент» и есть то, что съедало экран; убрали границу — экран
	// остался содержанию: до первой работы 124px вместо 416.
	//
	// Имя типа осталось `ProjectsHero`, хотя блок больше не Hero. Причина та же,
	// что у ключа `cards` в `Message`: тип — это идентификатор строки в каталоге
	// компонентов, от него считается артикул, и переименование выдало бы блоку
	// новый номер (1.26.3) вместо 1.26.1. См. component-articles.md:
	// «Имя — единственное имя блока… и потому не всегда точно описывает,
	// подо что блок используется».
	//
	// Контент работы блок НЕ редактирует — он приходит из каталога и правится
	// в карточке проекта, в одной точке (разбор в ProjectsFeed/data.ts).
	// Редактируется только метка с названием страницы: это текст страницы,
	// а не текст проекта.
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import SingleVersionSettings from '$lib/components/SingleVersionSettings.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import {
		FEED_LINK_LABEL,
		formatCompletedAt,
		projectHref,
		resolveFeedProjects,
		type FeedProject
	} from './ProjectsFeed/data';
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

	// Последнюю работу присылает обогащение одним объектом, а не первым
	// элементом списка: делить список на «последнюю» и «остальные» — забота
	// сервера, где живёт порядок (см. RenderPage::getFeedProjects).
	// Пропускаем через тот же разрешитель, что и лента: контракт у них общий,
	// и второй разбор той же формы разошёлся бы с первым.
	const latest = $derived<FeedProject | null>(
		resolveFeedProjects(data?.latest == null ? [] : [data.latest])[0] ?? null
	);
	const completed = $derived(formatCompletedAt(latest?.completedAt ?? null));
	const total = $derived(typeof data?.total === 'number' ? data.total : 0);

	async function saveTitle(value: string) {
		if (!editContext) return;
		const updated = { ...data, title: value };
		await saveComponentData(editContext, 'ProjectsHero', updated);
		data = updated;
	}
</script>

<!-- Последняя работа (ProjectsHero) -->
<section class="p1-surface-alt relative" data-p1-theme={isLight ? 'light' : 'dark'}>
	<SingleVersionSettings
		bind:data
		{editContext}
		{isEditable}
		componentType="ProjectsHero"
		themeToggle
		themeDefault="light"
		title="Последняя работа"
	/>

	<div class="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
		<!-- Метка с названием страницы и счётчиком портфолио. Счётчик считает ВСЕ
		     работы, включая показанную здесь: это размер портфолио, а не остаток
		     списка, — поэтому у ленты ниже собственного счётчика нет. -->
		<div class="flex items-baseline justify-between gap-6">
			<EditableField
				fieldKey="ProjectsHero.title"
				label="Название страницы"
				value={String(data?.title ?? 'Проекты')}
				{isEditable}
				inline
				onSave={saveTitle}
				class="inline"
			>
				{#snippet children(displayValue)}
					<h1 class="p1-label p1-muted">{displayValue}</h1>
				{/snippet}
			</EditableField>
			{#if total > 0}
				<span class="p1-note p1-numeric p1-muted">{total} работ</span>
			{/if}
		</div>

		{#if latest}
			<!-- Ссылка одна на весь разворот: зона нажатия — сам разворот. -->
			<a
				class="group p1-card p1-border p1-card-hover mt-4 grid animate-fade-up-in overflow-hidden rounded-3xl border shadow-sm transition-[transform,box-shadow,background-color] duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--p1-field-focus)] focus-visible:outline-none lg:grid-cols-[7fr_5fr] lg:gap-10"
				href={projectHref(latest)}
				aria-label="{FEED_LINK_LABEL}: {latest.value}"
			>
				<!-- `p1-body` на обёртке кадра несущий: заглушка `ImageFallback`
				     берёт цвет текста родителя и без роли растворилась бы в
				     тёмной секции. -->
				<div class="p1-body overflow-hidden">
					<ImageFallback
						src={latest.images[0]?.url ?? null}
						alt="Проект «{latest.value}»"
						class="aspect-video h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui group-hover:scale-105 lg:aspect-auto lg:min-h-[360px]"
					/>
				</div>

				<div class="flex flex-col justify-center p-6 sm:p-8 lg:py-10 lg:pr-11 lg:pl-0">
					<span class="p1-label p1-accent">
						Последняя работа{latest.categoryValue ? ` · ${latest.categoryValue}` : ''}
					</span>
					<!-- Название работы набрано дисплейной ролью и крупно: на этой
					     странице оно и есть заголовок первого экрана. Ниже, в
					     ленте, те же названия идут ролью `p1-title-sub` — там они
					     пункты списка, а не заголовок. -->
					<p class="p1-title p1-title-display mt-3.5 text-3xl sm:text-4xl">{latest.value}</p>

					<dl class="mt-6 flex flex-col">
						{#if latest.objectAddress}
							<div class="p1-line flex items-baseline justify-between gap-4 border-t py-2.5">
								<dt class="p1-label p1-body">Адрес объекта</dt>
								<dd class="p1-title text-right text-[0.9375rem]">{latest.objectAddress}</dd>
							</div>
						{/if}
						{#if completed}
							<div class="p1-line flex items-baseline justify-between gap-4 border-t py-2.5">
								<dt class="p1-label p1-body">Сдан</dt>
								<dd class="p1-title p1-numeric text-right text-[0.9375rem]">{completed}</dd>
							</div>
						{/if}
						{#if latest.maker}
							<div class="p1-line flex items-baseline justify-between gap-4 border-t py-2.5">
								<dt class="p1-label p1-body">Изготовление</dt>
								<dd class="p1-title text-right text-[0.9375rem]">{latest.maker}</dd>
							</div>
						{/if}
					</dl>

					<span class="p1-accent p1-label mt-6 inline-flex items-center gap-1.5 self-start">
						{FEED_LINK_LABEL}
						<svg
							class="size-3.5 transition-transform duration-[var(--ds-motion-duration-ui)] ease-ui group-hover:translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2.5"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</span>
				</div>
			</a>
		{/if}
	</div>
</section>
