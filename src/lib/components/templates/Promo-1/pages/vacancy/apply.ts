/**
 * Связь «Откликнуться» → форма отклика на странице «Вакансии».
 *
 * Кнопка стоит в одном блоке (VacancyList), поле «Вакансия» — в другом
 * (VacancyForm). Блоки страницы не знают друг о друге и общих пропсов не имеют:
 * состав страницы задаётся конфигом шаблона, и любой из них тенант вправе
 * не иметь вовсе. Поэтому сигнал идёт событием окна — тем же способом, каким
 * шапка Promo-3 слушает `plitka-storage-update`.
 *
 * Переход к форме при этом НЕ зависит от JS: кнопка остаётся ссылкой на якорь
 * `#vacancy-form`, а событие лишь подставляет позицию в поле. Без скрипта
 * посетитель всё равно попадёт к форме и выберет позицию сам.
 */

export const VACANCY_FORM_ID = 'vacancy-form';

const APPLY_EVENT = 'vacancy:apply';

/** Сообщить форме, на какую позицию откликаются. */
export function requestApply(title: string) {
	if (typeof window === 'undefined') return;
	window.dispatchEvent(new CustomEvent(APPLY_EVENT, { detail: { title } }));
}

/** Подписаться на отклик. Возвращает функцию отписки — для onMount. */
export function onApplyRequest(handler: (title: string) => void): () => void {
	if (typeof window === 'undefined') return () => {};

	const listener = (event: Event) => {
		const detail = (event as CustomEvent<{ title?: unknown }>).detail;
		if (typeof detail?.title === 'string') handler(detail.title);
	};

	window.addEventListener(APPLY_EVENT, listener);
	return () => window.removeEventListener(APPLY_EVENT, listener);
}
