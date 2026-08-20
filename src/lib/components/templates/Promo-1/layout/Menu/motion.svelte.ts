/**
 * Мост из токенного слоя в `transition:fly` — один на все варианты меню.
 *
 * Длительность и шаг каскада живут в CSS (`--ds-motion-duration-ui`,
 * `--ds-motion-stagger-step`), а переходы Svelte принимают их числом из JS.
 * Моста между слоями у шаблона нет, поэтому значения читаются вычисленным
 * стилем корня; ступенчатая шкала `--ds-motion-stagger-1..5` не годится —
 * она обрывается на пятой ступени, а рубрик шесть.
 *
 * Вынесено 20.08.2026 при разборе мобильного меню: тот же эффект стоял копией
 * в `Menu/v1` и `Menu/v4`, а с четырьмя мобильными вариантами копий стало бы
 * шесть. Возвращает геттеры, а не значения: вызов идёт в инициализации
 * компонента, а читается результат уже после первого прогона эффекта.
 */
export function createMenuMotion() {
	let reduceMotion = $state(false);
	let uiDuration = $state(0);
	let staggerStep = $state(0);

	$effect(() => {
		const root = getComputedStyle(document.documentElement);
		uiDuration = Number.parseFloat(root.getPropertyValue('--ds-motion-duration-ui')) || 0;
		staggerStep = Number.parseFloat(root.getPropertyValue('--ds-motion-stagger-step')) || 0;

		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (reduceMotion = mq.matches);
		sync();
		mq.addEventListener('change', sync);
		return () => mq.removeEventListener('change', sync);
	});

	return {
		/** Длительность появления: ноль, если система просит не двигать. */
		get enterDuration() {
			return reduceMotion ? 0 : uiDuration;
		},
		/** Задержка ступени каскада для элемента с индексом `idx`. */
		enterDelay(idx: number) {
			return reduceMotion ? 0 : idx * staggerStep;
		}
	};
}
