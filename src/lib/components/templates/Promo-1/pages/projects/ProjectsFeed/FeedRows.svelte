<script lang="ts">
	// Режим «списком»: один проект — одна строка во всю ширину.
	//
	// Паспорт набран в три колонки равной ширины, как опись величин в
	// `Message/v2`: даты выстраиваются между карточками вертикально, и
	// `tabular-nums` роли `p1-numeric` работает по назначению.
	//
	// Редактора контента здесь нет — см. ./data.ts.
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
</script>

<div class="mt-7 flex flex-col gap-5">
	{#each projects as project, i (project.id)}
		{@const completed = formatCompletedAt(project.completedAt)}
		<!-- `group` несёт наведение, ссылка одна на всю строку: зона нажатия —
		     сама карточка, отдельной кнопки нет. -->
		<a
			class="group p1-card p1-border p1-card-hover flex animate-fade-up-in flex-col overflow-hidden rounded-2xl border shadow-sm transition-[transform,box-shadow,background-color] duration-[var(--ds-motion-duration-ui)] ease-ui hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--p1-field-focus)] focus-visible:outline-none sm:flex-row"
			style="animation-delay: calc({i} * var(--ds-motion-stagger-step))"
			href={projectHref(project)}
			aria-label="{FEED_LINK_LABEL}: {project.value}"
		>
			<!-- `p1-body` на обёртке кадра несущий: заглушка `ImageFallback`
			     берёт цвет текста родителя и без роли растворилась бы в
			     тёмной секции. -->
			<div class="p1-body w-full shrink-0 overflow-hidden sm:w-[340px]">
				<ImageFallback
					src={project.images[0]?.url ?? null}
					alt="Проект «{project.value}»"
					loading="lazy"
					class="aspect-4/3 h-full w-full object-cover transition-transform duration-[var(--ds-motion-duration-ui-slow)] ease-ui group-hover:scale-105 sm:aspect-auto sm:min-h-[244px]"
				/>
			</div>

			<div class="flex flex-1 flex-col p-6 sm:px-7">
				{#if project.categoryValue}
					<span class="p1-label p1-body">{project.categoryValue}</span>
				{/if}
				<h3 class="p1-title p1-title-sub mt-2 text-xl sm:text-[1.375rem]">{project.value}</h3>

				<!-- Подписи внутри карточки — роль `p1-body`, а не `p1-muted`.
				     Замер на тёмной теме: подложка карточки это 4% белого НАД
				     секцией, композит даёт #1a1a1d, и `p1-muted` на нём держит
				     4,13:1 — ниже порога 1.4.3 для кегля 12px. `p1-body` там же
				     даёт 6,84:1. Та же находка, что у описи работ на главной
				     (`Message/v1`), и та же причина: роль подписи калибрована к
				     ПОВЕРХНОСТИ, а карточка поверхность подсвечивает. Иерархию
				     держит величина — она набрана `p1-title`. -->
				<dl class="mt-5 grid gap-4 sm:grid-cols-3">
					{#if project.objectAddress}
						<div class="p1-line border-t pt-3">
							<dt class="p1-label p1-body">Адрес объекта</dt>
							<dd class="p1-title mt-1.5 text-[0.9375rem] leading-snug">
								{project.objectAddress}
							</dd>
						</div>
					{/if}
					{#if completed}
						<div class="p1-line border-t pt-3">
							<dt class="p1-label p1-body">Сдан</dt>
							<dd class="p1-title p1-numeric mt-1.5 text-[0.9375rem] leading-snug">{completed}</dd>
						</div>
					{/if}
					{#if project.maker}
						<div class="p1-line border-t pt-3">
							<dt class="p1-label p1-body">Изготовление</dt>
							<dd class="p1-title mt-1.5 text-[0.9375rem] leading-snug">{project.maker}</dd>
						</div>
					{/if}
				</dl>

				<!-- Бренды отделены от паспорта: паспорт — про сам проект,
				     бренды — про то, из чего он собран. Строка «Техника» не
				     рисуется, когда техники не было: пустая подпись утверждала
				     бы отсутствие данных как факт. -->
				{#if project.hardwareBrands.length > 0 || project.applianceBrands.length > 0}
					<div class="p1-line mt-4 flex flex-wrap gap-x-10 gap-y-2 border-t pt-3.5">
						{#if project.hardwareBrands.length > 0}
							<div class="flex items-baseline gap-2.5">
								<span class="p1-label p1-body">Фурнитура</span>
								<span class="p1-body text-sm">{formatBrands(project.hardwareBrands)}</span>
							</div>
						{/if}
						{#if project.applianceBrands.length > 0}
							<div class="flex items-baseline gap-2.5">
								<span class="p1-label p1-body">Техника</span>
								<span class="p1-body text-sm">{formatBrands(project.applianceBrands)}</span>
							</div>
						{/if}
					</div>
				{/if}

				<span class="p1-accent p1-label mt-auto inline-flex items-center gap-1.5 self-start pt-5">
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
