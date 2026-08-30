import { building } from '$app/environment';
import { captureAttribution } from '$lib/server/attribution';
import { CLIENT_COOKIE, decodeClientDisplay } from '$lib/server/client-session';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url, request }) => {
	// Layout не загружает pageData — каждая страница делает это сама.
	// Это гарантирует, что при клиентской навигации данные всегда актуальны.

	// Клиентская сессия нужна ЗДЕСЬ, потому что кнопки входа и ссылка на кабинет
	// живут в баннере на каждой странице. Читается только payload cookie — без
	// запроса к leget-auth, иначе каждая страница сайта ходила бы в auth-сервис.
	// Настоящая проверка — на самой странице кабинета (/cabinet).
	//
	// На пререндере (каталог /_ds собирается в файлы) cookie не существует и
	// обращение к ней падает — поэтому ветка отключена флагом building.
	if (building) return { client: null };

	// Рекламная атрибуция снимается ЗДЕСЬ, а не в hooks.server.ts: корневой
	// layout отрабатывает на каждой странице сайта, а хук данных страницы
	// не грузит и на пререндере cookie не имеет вовсе.
	//
	// Ничего не делает, если в адресе нет рекламных меток: обычный переход
	// по закладке не должен затирать источник, из которого человек пришёл
	// впервые. Первое касание замораживается — см. $lib/server/attribution.
	captureAttribution(url, request.headers.get('referer'), cookies);

	return { client: decodeClientDisplay(cookies.get(CLIENT_COOKIE)) };
};
