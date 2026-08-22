import { redirect } from '@sveltejs/kit';
import { CLIENT_COOKIE, clearClientSession, readClientProfile } from '$lib/server/client-session';
import type { Actions, PageServerLoad } from './$types';

/** Cookie админской сессии — см. src/routes/admin/+page.server.ts. */
const ADMIN_COOKIE = 'leget_admin_jwt';

/**
 * Личный кабинет клиента — защищённая страница.
 *
 * Защита серверная и в две ступени:
 *   1. Нет клиентской cookie → редирект (кабинета для гостя не существует).
 *   2. Cookie есть → leget-auth проверяет подпись токена и роль: `/api/client/me`
 *      закрыт middleware EnsureClientAccess, админский токен получает оттуда 403.
 *      Значит, админ в кабинет клиента не попадает.
 *
 * Одной проверки cookie мало: сессии админа и клиента лежат в разных cookie и
 * могут существовать в браузере одновременно. Решает ответ auth-сервиса.
 */
export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get(CLIENT_COOKIE);

	if (!token) {
		// Админа с открытой панелью отправляем к ней, остальных — на сайт.
		redirect(303, cookies.get(ADMIN_COOKIE) ? '/admin' : '/?auth=client-login');
	}

	let profile: Awaited<ReturnType<typeof readClientProfile>> = null;
	try {
		profile = await readClientProfile(token);
	} catch {
		return { profile: null, serviceUnavailable: true };
	}

	if (!profile) {
		// Токен просрочен, отозван или принадлежит админу — сессию не держим.
		clearClientSession(cookies);
		redirect(303, '/?auth=client-login');
	}

	return { profile, serviceUnavailable: false };
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		clearClientSession(cookies);
		redirect(303, '/');
	}
};
