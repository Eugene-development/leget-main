/**
 * Один контракт данных для обеих версий блока 1.26.2 (ProjectsFeed).
 *
 * Блок принципиально отличается от соседей по шаблону тем, что его содержимое
 * ему НЕ принадлежит: работы приходят из каталога (обогащение `ProjectsFeed`
 * в RenderPage.php), а правит их тенант в карточке проекта — в одной точке.
 * Поэтому здесь нет ни `*_DEFAULT_*` со стартовым контентом, ни функций
 * слияния сохранённого с дефолтным: сливать не с чем, выдумывать за тенанта
 * чужие адреса и даты нельзя, а пустая лента — законное состояние нового сайта.
 *
 * Ровно по этой же причине ни одна версия блока не импортирует `EditableField`
 * и не зовёт `saveComponentData` для полей работы. Требование «контент правится
 * в одном месте» держится конструкцией, а не соглашением: чтобы его нарушить,
 * нужно дописать в блок редактор, а не забыть про договорённость.
 */

/** Один проект в ленте. Форма — из обогащения RenderPage. */
export type FeedProject = {
	id: string;
	/** Название работы (`mebel_projects.value`). */
	value: string;
	slug: string;
	/** Категория рубрики «Мебель» — она же первый сегмент ссылки на проект. */
	categorySlug: string | null;
	categoryValue: string | null;
	shortDescription: string | null;
	/**
	 * Дата завершения в ISO (`YYYY-MM-DD`). Необязательна: карточка каталога
	 * могла быть заведена до появления поля, и лента показывает её всё равно —
	 * строка «Сдан» просто не рисуется.
	 */
	completedAt: string | null;
	/** Адрес, уже усечённый сервером до города и района. */
	objectAddress: string | null;
	maker: string | null;
	hardwareBrands: string[];
	applianceBrands: string[];
	images: { url: string; hash?: string }[];
};

/**
 * Сколько проектов на странице. Общее число для обеих версий и для всех ширин:
 * размер страницы — свойство данных, а не вёрстки, и «на телефоне четыре, на
 * десктопе шесть» рассинхронизировало бы номера страниц между устройствами —
 * ссылка на третью страницу вела бы у двоих на разные работы.
 */
export const FEED_PAGE_SIZE = 4;

/** Подпись перехода. Не редактируется и одинакова у обеих версий: это имя
 *  действия, а не текст блока — разные слова на соседних карточках одной
 *  ленты читались бы как разные действия. */
export const FEED_LINK_LABEL = 'Смотреть проект';

function asText(value: unknown): string | null {
	return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function asBrands(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.map((item) => asText(item)).filter((item): item is string => item !== null);
}

/**
 * Приводит присланное обогащением к контракту.
 *
 * Работы без категории отбрасываются, а не рисуются некликабельными: ссылка
 * на проект собирается как `/mebel/{category}/{project}`, и без первого
 * сегмента карточка вела бы на битый адрес. Такое возможно, когда владелец
 * сайта отключил рубрику уже после того, как проект был заведён.
 */
export function resolveFeedProjects(value: unknown): FeedProject[] {
	if (!Array.isArray(value)) return [];

	return value
		.map((item) => {
			const p = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;

			return {
				id: String(p.id ?? ''),
				value: asText(p.value) ?? '',
				slug: asText(p.slug) ?? '',
				categorySlug: asText(p.categorySlug),
				categoryValue: asText(p.categoryValue),
				shortDescription: asText(p.shortDescription),
				completedAt: asText(p.completedAt),
				objectAddress: asText(p.objectAddress),
				maker: asText(p.maker),
				hardwareBrands: asBrands(p.hardwareBrands),
				applianceBrands: asBrands(p.applianceBrands),
				images: Array.isArray(p.images)
					? (p.images as { url?: unknown; hash?: unknown }[])
							.map((img) => ({ url: asText(img?.url) ?? '', hash: asText(img?.hash) ?? undefined }))
							.filter((img) => img.url !== '')
					: []
			};
		})
		.filter((p) => p.value !== '' && p.slug !== '' && p.categorySlug !== null);
}

/** Ссылка на страницу проекта — ту же, что открывается из рубрики каталога. */
export function projectHref(project: FeedProject): string {
	return `/mebel/${project.categorySlug}/${project.slug}`;
}

/**
 * Дата завершения в вид `14.03.2026`.
 *
 * Разбирается вручную, а не `new Date(iso)`: строка `2026-03-14` разбирается
 * как полночь UTC, и восточнее Гринвича `toLocaleDateString` показывал бы
 * следующий день. Сдвигать дату завершения на сутки из-за часового пояса
 * посетителя — это врать о чужой работе.
 */
export function formatCompletedAt(iso: string | null): string | null {
	if (!iso) return null;

	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
	if (!match) return null;

	const [, year, month, day] = match;
	return `${day}.${month}.${year}`;
}

/** Бренды одной строкой. Разделитель — тонкая точка, как в паспорте. */
export function formatBrands(brands: string[]): string {
	return brands.join(' · ');
}

/**
 * Режим просмотра ленты — выбор ПОСЕТИТЕЛЯ, а не владельца сайта.
 *
 * Не путать с версией блока: версия это дизайн, её выбирает владелец в
 * переключателе вариантов, и посетитель на неё повлиять не может. Режим —
 * функциональный: одни и те же работы либо строками, либо плиткой. Версия
 * задаёт, с какого режима страница ОТКРЫВАЕТСЯ; дальше решает посетитель.
 */
export type FeedView = 'list' | 'tiles';

/**
 * Ключ выбора в localStorage.
 *
 * С префиксом `leget:` — на домене тенанта в том же хранилище живут ключи
 * приложения (`auth_token` и прочие), и голое `view` однажды с чем-нибудь
 * столкнётся.
 */
export const FEED_VIEW_STORAGE_KEY = 'leget:projects-view';

function isFeedView(value: unknown): value is FeedView {
	return value === 'list' || value === 'tiles';
}

/**
 * Сохранённый выбор посетителя, если он есть и он осмысленный.
 *
 * Читается ТОЛЬКО на клиенте и только после гидратации: на сервере
 * `localStorage` нет, а отдавать SSR-разметку по хранилищу конкретного
 * браузера всё равно нельзя — ответ страницы кэшируется одним куском на всех.
 * Поэтому сервер рисует режим версии, а сохранённый выбор применяется следом.
 * Цена — возможная перекладка сразу после загрузки; плата за то, что разметка
 * приходит полной и работает без JS.
 *
 * Любая ошибка чтения (приватный режим, отключённое хранилище, чужое значение)
 * трактуется как «выбора нет»: режим просмотра не то, ради чего стоит падать.
 */
export function readStoredView(): FeedView | null {
	try {
		const stored = localStorage.getItem(FEED_VIEW_STORAGE_KEY);
		return isFeedView(stored) ? stored : null;
	} catch {
		return null;
	}
}

/** Запомнить выбор. Молча ничего не делает там, где хранилище недоступно. */
export function storeView(view: FeedView): void {
	try {
		localStorage.setItem(FEED_VIEW_STORAGE_KEY, view);
	} catch {
		// Приватный режим или переполненное хранилище — не повод ломать страницу.
	}
}

/** Забыть выбор: посетитель вернулся к умолчанию версии. */
export function clearStoredView(): void {
	try {
		localStorage.removeItem(FEED_VIEW_STORAGE_KEY);
	} catch {
		// См. storeView.
	}
}

/** Страницы пагинации: `[1, 2, 3]`. Пустая лента даёт пустой список. */
export function pageNumbers(total: number, perPage = FEED_PAGE_SIZE): number[] {
	const count = Math.ceil(total / perPage);
	return count > 1 ? Array.from({ length: count }, (_, i) => i + 1) : [];
}
