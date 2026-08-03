/**
 * Единая дизайн-система страницы «Контакты» (шаблон Promo-1).
 *
 * Зачем: пользователь свободно переключает версии блоков (v1 / v2) и отключает
 * блоки, но страница обязана оставаться стилистически цельной. Поэтому версии
 * различаются ТОЛЬКО композицией (сетка, выравнивание, порядок элементов),
 * а палитра, типографика, радиусы, тени, кнопки и анимации берутся отсюда.
 *
 * Ритм поверхностей закреплён за слотом страницы, а НЕ за версией блока:
 *   ContactsHero → ink · ContactChannels → base · ContactAddress → paper ·
 *   ContactMessengers → base (+ ink-карточка внутри) · ContactCTA → ink
 *
 * Классы `ct-*` (текстуры и анимации появления) лежат в `./theme.css`.
 */

/** Акцент страницы — красный. Telegram-синий допускается только как бренд-цвет мессенджера. */
export const ct = {
	/** Поверхности секций. */
	surface: {
		ink: 'p1-surface',
		base: 'p1-surface',
		paper: 'p1-surface-paper'
	},

	/** Каркас секции: общая обёртка, вертикальные отступы, контейнеры. */
	section: {
		shell: 'relative isolate overflow-hidden',
		pad: 'py-20 sm:py-24 lg:py-28',
		heroPad: 'flex min-h-96 items-center py-14 sm:min-h-104 sm:py-16 lg:min-h-112 lg:py-20',
		container: 'relative mx-auto w-full max-w-7xl px-6 lg:px-8',
		containerMid: 'relative mx-auto w-full max-w-5xl px-6 lg:px-8',
		containerText: 'relative mx-auto w-full max-w-4xl px-6 lg:px-8',
		containerNarrow: 'relative mx-auto w-full max-w-3xl px-6 lg:px-8'
	},

	/** Надпись над заголовком. Один трекинг и один регистр на всей странице. */
	eyebrow: {
		onInk:
			'p1-accent inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] uppercase sm:text-xs',
		onLight:
			'p1-accent inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] uppercase sm:text-xs',
		dashOnInk: 'p1-accent-bg h-px w-8 opacity-80',
		dashOnLight: 'p1-accent-bg h-px w-8 opacity-60'
	},

	/** Заголовки. Одна шкала и одно начертание для всех версий. */
	title: {
		h1OnInk:
			'text-4xl leading-[1.05] font-semibold tracking-[-0.035em] p1-title text-pretty sm:text-5xl lg:text-6xl',
		h2OnInk:
			'text-3xl leading-[1.08] font-semibold tracking-[-0.03em] p1-title text-pretty sm:text-4xl lg:text-5xl',
		h2OnLight:
			'text-3xl leading-[1.08] font-semibold tracking-[-0.03em] p1-title text-pretty sm:text-4xl lg:text-5xl',
		h3OnLight: 'p1-title text-xl font-semibold tracking-[-0.01em]'
	},

	/** Основной текст. */
	body: {
		onInk: 'p1-body text-sm/6 sm:text-base/7',
		onInkMuted: 'p1-muted text-sm/6 sm:text-base/7',
		onLight: 'p1-body text-sm/6 sm:text-base/7',
		labelOnLight: 'p1-title font-semibold'
	},

	/** Декоративные акценты: волосяная линия сверху секции и ромбовидный разделитель. */
	accent: {
		toplineOnInk:
			'absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-red-400/70 to-transparent',
		toplineOnLight:
			'absolute top-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-red-500/40 to-transparent',
		hairlineOnCard:
			'pointer-events-none absolute -top-px left-1/2 h-px w-24 -translate-x-1/2 bg-red-500/70',
		diamond: 'size-1.5 rotate-45 border border-red-500/70',
		ruleOnInk: 'p1-line h-px flex-1',
		ruleOnLight: 'p1-line h-px flex-1'
	},

	/** Карточки: единые радиусы и тени. */
	card: {
		onInk: 'p1-card rounded-3xl border backdrop-blur-sm sm:rounded-4xl',
		onLight: 'p1-card rounded-3xl border sm:rounded-4xl',
		/** Тёмная панель-акцент внутри светлой секции. */
		inkPanel:
			'rounded-3xl border border-white/10 bg-[#09090b] shadow-[0_40px_100px_-50px_rgba(15,23,42,0.7)] sm:rounded-4xl',
		/** Небольшая карточка-плитка (каналы связи, пункты списка). */
		tileOnLight:
			'p1-card group relative overflow-hidden rounded-3xl border p-8 transition duration-300 hover:border-red-600/40 motion-safe:hover:-translate-y-1'
	},

	/** Иконка-плитка под акцентным цветом. */
	iconTile:
		'flex size-14 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white shadow-[0_16px_40px_-18px_rgba(220,38,38,0.85)]',

	/** Кнопки. Основная — красная «пилюля», вспомогательная — контурная. */
	btn: {
		primary:
			'group inline-flex items-center justify-center gap-2.5 rounded-full bg-red-600 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(220,38,38,0.9)] transition duration-300 hover:bg-red-500 hover:shadow-[0_22px_55px_-16px_rgba(220,38,38,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 motion-safe:hover:-translate-y-0.5',
		ghostOnInk:
			'group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 motion-safe:hover:-translate-y-0.5',
		ghostOnLight:
			'group inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-900/15 bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition duration-300 hover:border-slate-900/30 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-400 motion-safe:hover:-translate-y-0.5',
		/** Текстовая ссылка-действие внутри карточки. */
		link: 'inline-flex items-center gap-2 text-lg font-semibold text-red-600 transition hover:text-red-500'
	},

	/** Стрелка «→» с общим hover-сдвигом. */
	arrow: 'transition-transform duration-300 group-hover:translate-x-1',

	/** Бренд-цвет Telegram — единственное разрешённое отклонение от акцента. */
	telegram: '#229ED9'
} as const;

/**
 * Появление секции при попадании во вьюпорт.
 * Общая для всех блоков страницы: одинаковый порог и один и тот же класс-триггер,
 * чтобы блоки «оживали» синхронно по одному сценарию.
 */
export function revealOnScroll(node: HTMLElement) {
	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('ct-reveal-visible');
		return;
	}

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			node.classList.add('ct-reveal-visible');
			observer.unobserve(node);
		},
		{ threshold: 0.2 }
	);

	observer.observe(node);
	return { destroy: () => observer.disconnect() };
}
