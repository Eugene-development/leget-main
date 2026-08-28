import { redirect } from '@sveltejs/kit';
import { CLIENT_COOKIE, clearClientSession, readSessionProfile } from '$lib/server/client-session';
import { cabinetHref } from '$lib/utils/cabinet-href';
import type { Actions, PageServerLoad } from './$types';

/** Cookie админской сессии — см. src/routes/admin/+page.server.ts. */
const ADMIN_COOKIE = 'leget_admin_jwt';

/**
 * Кабинет партнёра — защищённая страница.
 *
 * Зеркало `/cabinet`: та же cookie сессии пользователя, та же проверка в две
 * ступени. Отдельной cookie у партнёра нет намеренно — иначе на каждую новую
 * роль заводилась бы своя, а различает их роль в ответе leget-auth.
 *
 *   1. Нет cookie → редирект (кабинета для гостя не существует).
 *   2. Cookie есть → leget-auth проверяет подпись токена и отдаёт роль из БД
 *      (`/api/session/me`). Роль сверяем здесь: партнёрский кабинет открыт
 *      только роли «Партнёр».
 *
 * Роль берётся из ответа сервиса, а не из claim'а cookie: claim — снимок на
 * момент выдачи и после смены роли врёт до истечения TTL.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get(CLIENT_COOKIE);

	if (!token) {
		// Админа с открытой панелью отправляем к ней, остальных — на сайт.
		redirect(303, cookies.get(ADMIN_COOKIE) ? '/admin' : '/?auth=client-login');
	}

	let profile: Awaited<ReturnType<typeof readSessionProfile>> = null;
	try {
		profile = await readSessionProfile(token);
	} catch {
		return { profile: null, serviceUnavailable: true };
	}

	if (!profile) {
		// Токен просрочен или отозван — сессию не держим.
		clearClientSession(cookies);
		redirect(303, '/?auth=client-login');
	}

	if (profile.role !== 'partner') {
		// Сессия действительна, но кабинет чужой. Cookie не трогаем: человек
		// вошёл законно, просто не сюда.
		redirect(303, profile.role === 'admin' ? '/admin' : cabinetHref(profile.role));
	}

	return { profile, serviceUnavailable: false };
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		clearClientSession(cookies);
		redirect(303, '/');
	}
};
