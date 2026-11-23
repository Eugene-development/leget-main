import { fail, redirect } from '@sveltejs/kit';
import type { CompanyCard } from '$lib/partners/types';
import { authApi, readApiJson } from '$lib/server/admin-api';
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
export const load: PageServerLoad = async ({ cookies, setHeaders }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	const token = cookies.get(CLIENT_COOKIE);

	if (!token) {
		// Админа с открытой панелью отправляем к ней, остальных — на сайт.
		redirect(303, cookies.get(ADMIN_COOKIE) ? '/admin' : '/?auth=client-login');
	}

	let profile: Awaited<ReturnType<typeof readSessionProfile>> = null;
	try {
		profile = await readSessionProfile(token);
	} catch {
		return { profile: null, serviceUnavailable: true, companyCard: null, cardError: false };
	}

	if (!profile) {
		// Токен просрочен или отозван — сессию не держим.
		clearClientSession(cookies);
		redirect(303, '/?auth=client-login');
	}

	if (profile.role !== 'partner') {
		// Сессия действительна, но кабинет чужой. Cookie не трогаем: человек
		// вошёл законно, просто не сюда.
		redirect(303, profile.role === 'superadmin' ? '/admin' : cabinetHref(profile.role));
	}

	try {
		const response = await authApi('/partner/company-card', {
			headers: { Authorization: `Bearer ${token}` },
			signal: AbortSignal.timeout(5000)
		});
		if (!response.ok) throw new Error('Company card unavailable');
		const result = await readApiJson(response);
		return {
			profile,
			serviceUnavailable: false,
			companyCard: (result.card ?? null) as CompanyCard | null,
			cardError: false
		};
	} catch {
		return { profile, serviceUnavailable: false, companyCard: null, cardError: true };
	}
};

export const actions: Actions = {
	companyCard: async ({ cookies, request }) => {
		const token = cookies.get(CLIENT_COOKIE);
		if (!token) return fail(401, { cardMessage: 'Войдите в кабинет, чтобы сохранить карточку.' });
		const fields = await request.formData();
		const values = Object.fromEntries(
			['name', 'description', 'city', 'address', 'phone', 'email', 'website'].map((name) => {
				const value = fields.get(name);
				return [name, typeof value === 'string' ? value.trim() : ''];
			})
		);
		const action = fields.get('action');
		try {
			const response = await authApi('/partner/company-card', {
				method: 'PUT',
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify({ ...values, action }),
				signal: AbortSignal.timeout(5000)
			});
			const result = await readApiJson(response);
			if (!response.ok) {
				const denied = response.status === 401 || response.status === 403;
				const cardMessage = denied
					? 'Доступ к карточке изменился. Обновите страницу.'
					: response.status === 409
						? 'Карточку уже опубликовали. Обновите страницу.'
						: response.status === 422
							? 'Проверьте выделенные поля.'
							: 'Не удалось сохранить карточку. Попробуйте ещё раз.';
				return fail(response.status, {
					cardMessage,
					...(denied
						? {}
						: { values, errors: result.errors as Record<string, string[]> | undefined })
				});
			}
			return { saved: action as 'save' | 'publish' | 'unpublish' };
		} catch {
			return fail(503, {
				cardMessage: 'Не удалось сохранить карточку. Попробуйте ещё раз.',
				values
			});
		}
	},
	logout: async ({ cookies }) => {
		clearClientSession(cookies);
		redirect(303, '/');
	}
};
