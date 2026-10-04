import { json } from '@sveltejs/kit';
import { authApi, readApiJson } from '$lib/server/admin-api';
import { CLIENT_COOKIE, setClientSession, readSessionProfile } from '$lib/server/client-session';
import type { RequestHandler } from './$types';
export const POST: RequestHandler = async ({ request, cookies, url }) => {
	if (request.headers.get('origin') !== url.origin)
		return json({ message: 'Недопустимый источник запроса.' }, { status: 403 });
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) return json({ message: 'Сначала войдите в существующий аккаунт.' }, { status: 401 });
	try {
		const response = await authApi('/client/activate', {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}` },
			body: '{}'
		});
		const result = await readApiJson(response);
		if (response.ok && typeof result.token === 'string')
			setClientSession(cookies, result.token, result.expires_in, result.remember);
		delete result.token;
		return json(result, { status: response.status });
	} catch {
		return json({ message: 'Сервис недоступен. Повторите подключение.' }, { status: 503 });
	}
};

export const GET: RequestHandler = async ({ cookies }) => {
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) return json({ user: null }, { status: 401 });
	try {
		return json(
			{ user: await readSessionProfile(token) },
			{ headers: { 'Cache-Control': 'private, no-store' } }
		);
	} catch {
		return json({ message: 'Сервис недоступен.' }, { status: 503 });
	}
};
