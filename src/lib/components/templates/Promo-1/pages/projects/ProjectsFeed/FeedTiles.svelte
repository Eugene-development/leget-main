<script lang="ts">
	// Режим «плиткой»: кадр сверху, под ним короткий паспорт строками.
	//
	// Три колонки на широком экране, две на планшете. Не четыре: карточка ужи́
	// трёх, и адрес вида «Красногорск, Павшинская пойма» начинает переноситься
	// на три строки — плитка перестаёт быть плиткой и превращается в столбик
	// текста с картинкой.
	//
	// Кадр 16/9, а не 4/3: у плитки на строку приходится больше карточек, и при
	// 4/3 колонка кадров съедала бы экран, оставляя паспорт за сгибом.
	// Пропорция та же, что у `record-frame` в `Message/v2`.
	//
	// Бренды здесь сведены в одну строку без разделения на фурнитуру и технику:
	// в узкой карточке две подписи «Фурнитура» и «Техника» занимают больше
	// места, чем сами названия. Полное разделение остаётся в режиме «списком».
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import {
		FEED_LINK_LABEL,
		formatBrands,
		formatCompletedAt,
		projectHref,
		type FeedProject
	} from './data';
	import '../../../theme.css';

	let { projects }: { projects: FeedProject[] } = $props();

	function allBrands(project: FeedProject): string {
		return formatBrands([...project.hardwareBrands, ...project.applianceBrands]);
	}
</script>

<div class="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each projects as project, i (project.id)}
		{@const completed = formatCompletedAt(project.completedAt)}
		{@const brands = allBrands(project)}
		<a
			class="group p1-card p1-border p1-card-hover flex animate-fade-up-in flex-col overflow-hidden rounded-2xl border shadow-sm transition-[transform,box-shadow,background-color] duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--p1-field-focus)] focus-visible:outline-none"
			style="animation-delay: calc({i} * var(--ds-motion-stagger-step))"
			href={projectHref(project)}
			aria-label="{FEED_LINK_LABEL}: {project.value}"
		>
			<div class="p1-body overflow-hidden">
				<ImageFallback
					src={project.images[0]?.url ?? null}
					alt="Проект «{project.value}»"
					loading="lazy"
					class="aspect-video w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui group-hover:scale-105"
				/>
			</div>

			<div class="flex flex-1 flex-col px-5 pt-4 pb-4">
				{#if project.categoryValue}
					<span class="p1-label p1-body">{project.categoryValue}</span>
				{/if}
				<h3 class="p1-title p1-title-sub mt-1.5 text-lg">{project.value}</h3>
				{#if project.objectAddress}
					<p class="p1-body mt-1 text-sm leading-snug">{project.objectAddress}</p>
				{/if}

				<!-- Роли подписей — `p1-body`, а не `p1-muted`: разбор контраста
				     на тёмной карточке в шапке FeedRows.svelte. -->
				<dl class="mt-3 flex flex-col">
					{#if completed}
						<div class="p1-line flex items-baseline justify-between gap-3 border-t py-2">
							<dt class="p1-label p1-body">Сдан</dt>
							<dd class="p1-title p1-numeric text-right text-sm">{completed}</dd>
						</div>
					{/if}
					{#if project.maker}
						<div class="p1-line flex items-baseline justify-between gap-3 border-t py-2">
							<dt class="p1-label p1-body">Изготовление</dt>
							<dd class="p1-title text-right text-sm">{project.maker}</dd>
						</div>
					{/if}
					{#if brands}
						<div class="p1-line flex items-baseline justify-between gap-3 border-t py-2">
							<dt class="p1-label p1-body">Бренды</dt>
							<dd class="p1-body text-right text-sm">{brands}</dd>
						</div>
					{/if}
				</dl>

				<span
					class="p1-accent p1-label p1-line mt-auto inline-flex items-center gap-1.5 border-t pt-3.5"
				>
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
	{/each}
</div>
