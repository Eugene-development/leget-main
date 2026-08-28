import { redirect } from '@sveltejs/kit';
import { adminApi, readApiJson } from '$lib/server/admin-api';
import type { Actions, PageServerLoad } from './$types';

const COOKIE_NAME = 'leget_admin_jwt';

function safePage(value: string | null): number {
	const page = Number.parseInt(value ?? '1', 10);
	return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

/**
 * «Мои клиенты» — список регистраций.
 *
 * Страница живёт под /admin и пользуется той же httpOnly-cookie: её область —
 * `/admin`, поэтому вложенный маршрут её получает, а клиентские страницы (`/`)
 * — нет. Без cookie отправляем на /admin, там форма входа.
 *
 * Кто попадает в список, решает leget-api: из выдачи исключены пользователи
 * с ролью `admin`, а сам endpoint закрыт способностью `clients.view`.
 */
export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = cookies.get(COOKIE_NAME);
	if (!token) {
		redirect(303, '/admin');
	}

	const search = url.searchParams.get('search')?.trim() ?? '';
	const query = new URLSearchParams({
		page: String(safePage(url.searchParams.get('page'))),
		per_page: '50'
	});
	if (search) query.set('search', search);

	let response: Response;
	let result: Record<string, unknown>;
	try {
		response = await adminApi(`/admin/clients?${query.toString()}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
		result = await readApiJson(response);
	} catch {
		// Отдельный try только вокруг сети: redirect() ниже бросает исключение,
		// и общий catch превратил бы разлогин в «сервис недоступен».
		return {
			clients: null,
			summary: null,
			search,
			apiError: 'Сервис клиентов временно недоступен.'
		};
	}

	if (response.status === 401 || response.status === 403) {
		cookies.delete(COOKIE_NAME, { path: '/admin' });
		redirect(303, '/admin');
	}

	if (!response.ok) {
		return {
			clients: null,
			summary: null,
			search,
			apiError:
				typeof result.message === 'string' ? result.message : 'Не удалось загрузить клиентов.'
		};
	}

	return {
		clients: result.clients ?? null,
		summary: result.summary ?? null,
		search,
		apiError: null
	};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		cookies.delete(COOKIE_NAME, { path: '/admin' });
		redirect(303, '/admin');
	}
};
