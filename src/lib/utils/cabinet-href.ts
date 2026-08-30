/**
 * Куда ведёт «Личный кабинет» в шапке и подвале — зависит от роли.
 *
 * Одно место на все четыре точки входа (кнопки баннера и три версии футера):
 * когда появится следующая роль со своим кабинетом, править придётся здесь,
 * а не искать по разметке захардкоженный `/cabinet`.
 *
 * Роль берётся из claim'а cookie и границей доступа не является — она решает
 * только, какую ссылку показать. Сам кабинет проверяет роль на сервере
 * (`+page.server.ts` спрашивает `/api/session/me`), поэтому подделанная cookie
 * даёт неверную ссылку, а не доступ.
 */
const CABINETS: Record<string, string> = {
	client: '/cabinet',
	partner: '/partner',
	curator: '/curator'
};

/** Пути всех кабинетов — по ним logout понимает, что уходить надо на главную. */
export const CABINET_PATHS = Object.values(CABINETS);

/**
 * Запасной путь — главная, а НЕ `/cabinet`.
 *
 * Кабинеты уводят чужую роль друг к другу (`/cabinet` → `/partner` и обратно).
 * Если роль без своего кабинета получала бы `/cabinet`, эта страница снова
 * отправила бы её в `cabinetHref` — и редирект замкнулся бы в петлю.
 */
export function cabinetHref(role: string | undefined): string {
	return CABINETS[role ?? ''] ?? '/';
}

export function isCabinetPath(pathname: string): boolean {
	return CABINET_PATHS.some((path) => pathname.startsWith(path));
}
