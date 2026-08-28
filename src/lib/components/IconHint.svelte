<script lang="ts">
	/**
	 * Подсказка под значковой кнопкой — правая зона хэдера («Избранное», вход,
	 * регистрация).
	 *
	 * Зачем своя, а не `title`. Нативная подсказка появляется через секунду с
	 * лишним, рисуется системой (мимо шаблона и дизайн-системы) и не приходит
	 * с клавиатуры. Кнопка без подписи — ровно тот случай, когда подсказка не
	 * украшение, а единственное, что называет действие зрячему пользователю.
	 *
	 * Только CSS, без состояния. Родитель обязан быть `group relative`;
	 * раскрытие вешается на `group-hover` и `group-focus-visible`, поэтому
	 * подсказка приходит и по табу, и без единого байта JS — в том числе до
	 * гидратации.
	 *
	 * Доступность: имя кнопке даёт её собственный `sr-only`, поэтому подсказка
	 * помечена `aria-hidden` — иначе скринридер прочитал бы подпись дважды.
	 *
	 * Движение: проявление, спуск на 4px и доводчик масштаба от `origin-top` —
	 * подсказка разворачивается из-под кнопки, а не возникает рядом с ней.
	 * Длительность не написана числом: голый `transition-*` и есть системная
	 * (`--default-transition-duration` в layout.css равен
	 * `--ds-motion-duration-ui`). Задержка стоит только на появлении — с ней
	 * подсказка не мигает, когда курсор пересекает ряд кнопок по дороге, а
	 * исчезает сразу: базовое состояние возвращается без задержки. При
	 * `prefers-reduced-motion` остаётся проявление без движения.
	 */
	let {
		text,
		align = 'center'
	}: {
		text: string;
		/** У последней кнопки в ряду центр подсказки уезжает за край страницы. */
		align?: 'center' | 'right';
	} = $props();

	// Кегль подсказки — роль `p1-note` (0.6875rem = 11px у Базовой), а не
	// литерал: мелкая строка принадлежит дизайн-системе, у плотной он один,
	// у просторной другой. Импорт нужен здесь, в самом файле: бочка `index.ts`
	// маскирует пропуск в проде, а dev и изолированные чанки — нет.
	import '$lib/components/templates/Promo-1/theme.css';
</script>

<span
	aria-hidden="true"
	class="p1-note pointer-events-none absolute top-full z-50 mt-2 origin-top -translate-y-1 scale-95 rounded-lg bg-ink-950/95 px-2.5 py-1.5 font-medium whitespace-nowrap text-on-dark opacity-0 shadow-xl ring-1 ring-on-dark/10 backdrop-blur-sm transition ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 group-hover:delay-150 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:transition-opacity {align ===
	'right'
		? 'right-0'
		: 'left-1/2 -translate-x-1/2'}"
>
	{text}
	<!-- Хвостик: тот же квадрат, повёрнутый на 45°. Кольца ему не нужно —
	     он уходит под тело подсказки, и видна только верхняя половина. -->
	<span
		class="absolute -top-1 size-2 rotate-45 rounded-[2px] bg-ink-950/95 {align === 'right'
			? 'right-3.5'
			: 'left-1/2 -ml-1'}"
	></span>
</span>
