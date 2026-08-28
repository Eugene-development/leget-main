/**
 * Второстепенные ссылки баннера — те, что на десктопе идут строкой слева
 * от контактов: «О компании», «Партнёрство», «Отзывы», «Рассрочка»,
 * «Гарантии», «Контакты».
 *
 * Вынесено 25.08.2026 при разборе мобильной шапки. До этого список стоял
 * копией в `Banner/v1` и `Banner/v2` (одинаковой байт в байт), а мобильной
 * половине шапки он понадобился третьим потребителем: «Контакты» уехали из
 * строки в блок контактов листа меню, и брать оттуда литерал `/contacts`
 * значило бы потерять переименование пункта в редакторе.
 *
 * ⚠️ Ключ `links` в `headerData` **общий** с навигацией шапки (`Header.svelte`
 * читает тот же массив под свои «Главная / Каталог / Услуги / Проекты»).
 * Расходятся они только дефолтами: у тенанта, который список уже правил,
 * обе половины видят его собственный. Это не новость этой правки — так было
 * и до неё, см. комментарий у `links` в Header.svelte.
 */
export type BannerLink = { href: string; label: string };

export const bannerDefaultLinks: readonly BannerLink[] = [
	{ href: '/about', label: 'О компании' },
	{ href: '/partnership', label: 'Партнёрство' },
	{ href: '/testimonials', label: 'Отзывы' },
	{ href: '/installment', label: 'Рассрочка' },
	{ href: '/guarantees', label: 'Гарантии' },
	{ href: '/contacts', label: 'Контакты' }
];

/** Список баннера из данных шапки; пустой или отсутствующий — значит дефолт. */
export function resolveBannerLinks(data: Record<string, unknown> | undefined): BannerLink[] {
	const links = data?.links;
	return Array.isArray(links) && links.length > 0
		? (links as BannerLink[])
		: [...bannerDefaultLinks];
}

/**
 * Пункт «Контакты» — тот же, что в строке ссылок, а не литерал: переименование
 * в редакторе доезжает до всех точек входа, удаление пункта убирает ссылку,
 * а не оставляет мёртвую.
 */
export function resolveContactsLink(data: Record<string, unknown> | undefined): BannerLink | null {
	return resolveBannerLinks(data).find((link) => link.href === '/contacts') ?? null;
}
