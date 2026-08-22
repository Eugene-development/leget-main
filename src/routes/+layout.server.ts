import { building } from '$app/environment';
import { CLIENT_COOKIE, decodeClientDisplay } from '$lib/server/client-session';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
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

	return { client: decodeClientDisplay(cookies.get(CLIENT_COOKIE)) };
};
