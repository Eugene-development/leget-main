import { adminApi, readApiJson } from '$lib/server/admin-api';

/**
 * Серверные вызовы промо-API leget-api.
 *
 * Токен подставляется здесь и только здесь: браузеру он не отдаётся ни в одном
 * из кабинетов, поэтому любой запрос к промо-маршрутам обязан идти через
 * серверную часть. Права проверяет leget-api способностями (`can:`) — здесь
 * их не дублируем и на них не полагаемся как на единственную защиту: страница
 * прячет чужие действия, сервер их запрещает.
 */
export interface PromoResult {
	ok: boolean;
	status: number;
	data: Record<string, unknown>;
	message: string | null;
	/** Доменный код ошибки промокодов — по нему интерфейс может разветвиться. */
	code: string | null;
}

export async function promoApi(
	path: string,
	token: string,
	init: RequestInit = {}
): Promise<PromoResult> {
	try {
		const response = await adminApi(path, {
			...init,
			headers: {
				Authorization: `Bearer ${token}`,
				...init.headers
			}
		});

		const data = await readApiJson(response);

		return {
			ok: response.ok,
			status: response.status,
			data,
			message: typeof data.message === 'string' ? data.message : null,
			code: typeof data.code === 'string' ? data.code : null
		};
	} catch {
		return {
			ok: false,
			status: 503,
			data: {},
			message: 'Сервис промокодов временно недоступен.',
			code: 'SERVICE_UNAVAILABLE'
		};
	}
}

/** POST с телом в JSON — форма кабинета всегда шлёт объект. */
export async function promoPost(
	path: string,
	token: string,
	body: Record<string, unknown>
): Promise<PromoResult> {
	return promoApi(path, token, { method: 'POST', body: JSON.stringify(body) });
}

/**
 * Собрать строку запроса из значений формы, выбрасывая пустые.
 *
 * Пустой фильтр не должен превращаться в `status=` — сервер отверг бы его
 * валидацией, хотя человек просто ничего не выбрал.
 */
export function query(params: Record<string, string | number | null | undefined>): string {
	const search = new URLSearchParams();

	for (const [key, value] of Object.entries(params)) {
		if (value === null || value === undefined || value === '') continue;
		search.set(key, String(value));
	}

	const encoded = search.toString();
	return encoded === '' ? '' : `?${encoded}`;
}
