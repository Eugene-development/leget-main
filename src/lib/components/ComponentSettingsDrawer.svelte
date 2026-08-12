<script lang="ts">
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';

	/**
	 * Панель настроек блока: артикул, анимации, сброс контента, отключение.
	 *
	 * Рендерит и компактную кнопку-триггер (встраивается в панель инструментов блока),
	 * и саму выезжающую панель. Эталон интерфейса — баннер Promo-1: узкому блоку не
	 * подходит ряд кнопок поверх контента, поэтому редкие операции ушли в SideDrawer,
	 * а снаружи остались только выбор варианта и тумблер темы.
	 *
	 * Компонент не знает, как сохраняются данные: сброс и отключение приходят
	 * колбэками от владельца (VersionSwitcher).
	 */
	let {
		open = $bindable(false),
		title,
		article = null,
		articleSectionHint = null,
		articleComponentHint = null,
		canReset = false,
		isResetting = false,
		onReset,
		isDisabled = false,
		enabledVersionLabel = null,
		onToggleDisabled
	}: {
		/** Открыта ли панель. Владелец может закрыть её извне (напр. после сброса). */
		open?: boolean;
		/** Заголовок панели — человекочитаемое имя блока («Главный экран»). */
		title: string;
		/** Артикул активной версии; null — строка артикула не показывается. */
		article?: string | null;
		/** Подпись к сегменту страницы в тултипе артикула (slug). */
		articleSectionHint?: string | null;
		/** Подпись к сегменту компонента в тултипе артикула (тип блока). */
		articleComponentHint?: string | null;
		/** Есть ли что сбрасывать (блок редактировался). */
		canReset?: boolean;
		isResetting?: boolean;
		onReset: () => void;
		/** Текущее состояние блока: отключён для обычных посетителей. */
		isDisabled?: boolean;
		/** Вариант, который вернётся при включении («2» → «вариант 2»). */
		enabledVersionLabel?: string | null;
		onToggleDisabled: () => void;
	} = $props();
</script>

<!-- Компактный триггер: становится в один ряд с «Вариантами» и тумблером темы -->
<button
	type="button"
	class="flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-slate-950/75 p-2.5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/25 active:scale-95"
	onclick={() => (open = true)}
	title="Настройки блока"
	aria-label="Настройки блока"
>
	<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
		<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
		<circle cx="9" cy="6" r="2" fill="currentColor" />
		<circle cx="15" cy="12" r="2" fill="currentColor" />
		<circle cx="8" cy="18" r="2" fill="currentColor" />
	</svg>
</button>

<SideDrawer bind:open {title} eyebrow={null}>
	<div class="flex flex-col gap-6">
		<!-- Артикул выбранной версии -->
		{#if article}
			<div class="flex items-center gap-2">
				<span class="text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">
					Артикул
				</span>
				<ArticleBadge
					{article}
					sectionLabel="Страница"
					sectionHint={articleSectionHint}
					componentHint={articleComponentHint}
					align="left"
				/>
			</div>
		{/if}

		<!-- Анимации (заглушка: функциональность в разработке) -->
		<section class="border-white/10 pt-5 {article ? 'border-t' : ''}">
			<h4 class="text-[10px] text-white/40 uppercase">Анимации</h4>
			<p class="mt-2 text-xs leading-relaxed text-slate-400">
				Включение и отключение анимаций блока. Функция появится в одном из ближайших обновлений.
			</p>
			<button
				type="button"
				class="mt-4 flex w-full cursor-not-allowed items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3 text-xs font-bold tracking-wider text-slate-500 uppercase"
				disabled
				aria-disabled="true"
			>
				<span>Отключить анимации</span>
				<span
					class="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-[9px] font-bold tracking-wider text-amber-300/80 uppercase"
				>
					В разработке
				</span>
			</button>
		</section>

		<!-- Сброс контента -->
		<section class="border-t border-white/10 pt-5">
			<h4 class="text-[10px] text-white/40 uppercase">Контент</h4>
			<p class="mt-2 text-xs leading-relaxed text-slate-400">
				{#if canReset}
					Сброс вернёт тексты и изображения блока к значениям по умолчанию. Выбранный вариант и тема
					не изменятся.
				{:else}
					Контент блока не изменялся — сбрасывать нечего.
				{/if}
			</p>
			<button
				type="button"
				class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs font-bold tracking-wider text-red-300 uppercase transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/3 disabled:text-slate-500 disabled:hover:bg-white/3 {canReset
					? 'cursor-pointer'
					: ''}"
				onclick={onReset}
				disabled={isResetting || !canReset}
			>
				<svg
					class="h-3.5 w-3.5"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M4 4v6h6M20 20v-6h-6M5 14a7.5 7.5 0 0 0 12.32 2.5M19 10A7.5 7.5 0 0 0 6.68 7.5"
					/>
				</svg>
				{isResetting ? 'Сброс...' : 'Сбросить контент'}
			</button>
		</section>

		<!-- Отключение блока -->
		<section class="border-t border-white/10 pt-5">
			<h4 class="text-[10px] text-white/40 uppercase">Блок</h4>
			<p class="mt-2 text-xs leading-relaxed text-slate-400">
				{#if isDisabled}
					Блок отключён и не отображается обычным посетителям.
					{#if enabledVersionLabel}Включение вернёт вариант {enabledVersionLabel}.{/if}
				{:else}
					Отключённый блок остаётся виден вам в режиме редактирования, но не показывается обычным
					посетителям.
				{/if}
			</p>
			<button
				type="button"
				class="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-xs font-bold tracking-wider uppercase transition-all duration-300 active:scale-[0.98] {isDisabled
					? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200 hover:border-emerald-500/45 hover:bg-emerald-500/20'
					: 'border-red-500/20 bg-red-500/5 text-red-300 hover:border-red-500/40 hover:bg-red-500/15 hover:text-red-200'}"
				onclick={onToggleDisabled}
			>
				<span class="h-2 w-2 rounded-full {isDisabled ? 'bg-emerald-400' : 'bg-red-500'}"></span>
				{isDisabled ? 'Включить блок' : 'Отключить блок'}
			</button>
		</section>
	</div>
</SideDrawer>
