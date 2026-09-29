import { json } from '@sveltejs/kit';
import { authApi, readApiJson } from '$lib/server/admin-api';
import { CLIENT_COOKIE, setClientSession } from '$lib/server/client-session';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	if (params.path !== 'catalog') return json({ message: 'Не найдено' }, { status: 404 });
	try {
		const response = await authApi('/university/catalog');
		return json(await readApiJson(response), { status: response.status });
	} catch {
		return json({ message: 'Не удалось загрузить программу. Повторите попытку.' }, { status: 503 });
	}
};
export const POST: RequestHandler = async ({ params, request, cookies, url, getClientAddress }) => {
	if (request.headers.get('origin') !== url.origin)
		return json({ message: 'Недопустимый источник запроса.' }, { status: 403 });
	const path = params.path;
	if (
		!['register', 'login', 'enroll'].includes(path) &&
		!/^courses\/[a-z0-9-]+\/assess$/.test(path)
	)
		return json({ message: 'Не найдено' }, { status: 404 });
	let body: Record<string, unknown>;
	try {
		body = await request.json();
		if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
	} catch {
		return json({ message: 'Некорректный запрос.' }, { status: 400 });
	}
	const token = cookies.get(CLIENT_COOKIE);
	if (!['register', 'login'].includes(path) && !token)
		return json({ message: 'Войдите в университет.' }, { status: 401 });
	try {
		const response = await authApi(`/university/${path}`, {
			method: 'POST',
			headers: {
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				'X-Forwarded-For': getClientAddress()
			},
			body: JSON.stringify(body)
		});
		const result = await readApiJson(response);
		if (response.ok && typeof result.token === 'string')
			setClientSession(cookies, result.token, result.expires_in);
		// JWT never leaves the server.
		delete result.token;
		return json(result, { status: response.status });
	} catch {
		return json({ message: 'Сервис временно недоступен. Повторите попытку.' }, { status: 503 });
	}
};
