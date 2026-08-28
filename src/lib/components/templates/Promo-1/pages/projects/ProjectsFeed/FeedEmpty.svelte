<script lang="ts">
	// Пустая лента. Общая для обеих версий: у нового тенанта проектов ещё нет,
	// а ссылка «Проекты» уже стоит в меню шапки — без этого состояния страница
	// отдавала бы пустую секцию под заполненным Hero.
	//
	// Текст говорит, ЧТО сделать и ГДЕ: контент ленты правится в карточке
	// проекта каталога, и это единственное место, откуда проекты сюда попадают.
	import '../../../theme.css';
</script>

<div
	class="p1-card p1-border mt-7 flex flex-col items-center gap-3 rounded-2xl border p-11 text-center"
>
	<svg
		class="p1-muted size-11 opacity-50"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		aria-hidden="true"
	>
		<path
			stroke-linejoin="round"
			stroke-width="var(--ds-icon-stroke)"
			d="M3.75 5.25A1.5 1.5 0 0 1 5.25 3.75h13.5a1.5 1.5 0 0 1 1.5 1.5v13.5a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V5.25Z"
		/>
		<path
			stroke-linecap="round"
			stroke-width="var(--ds-icon-stroke)"
			d="M3.75 9.75h16.5M9.75 20.25V9.75"
		/>
	</svg>
	<h3 class="p1-title p1-title-sub mt-1 text-lg">Проектов пока нет</h3>
	<p class="p1-body max-w-md text-sm leading-relaxed">
		Проекты появятся здесь, как только вы добавите их в каталог — в рубрику «Мебель», в нужную
		категорию.
	</p>
	<a
		href="/mebel"
		class="p1-label mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent-surface px-5 py-3 text-on-accent transition-opacity duration-[var(--ds-motion-duration-ui)] ease-ui hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--p1-field-focus)] focus-visible:outline-none"
	>
		Открыть каталог
		<svg class="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
		</svg>
	</a>
</div>
