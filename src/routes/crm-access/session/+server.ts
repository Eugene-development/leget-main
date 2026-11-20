import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { CRM_COOKIE, readSessionProfile } from '$lib/server/client-session';
import { validatedTokenPersistence } from '$lib/server/session-persistence';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, url }) => {
	if (request.headers.get('origin') !== url.origin)
		return json({ message: 'Недопустимый источник запроса.' }, { status: 403 });
	const authorization = request.headers.get('authorization') ?? '';
	if (!/^Bearer\s+\S+$/.test(authorization))
		return json({ message: 'Требуется авторизация.' }, { status: 401 });
	const token = authorization.replace(/^Bearer\s+/, '');
	try {
		const profile = await readSessionProfile(token);
		if (!profile) return json({ message: 'Сессия завершена.' }, { status: 401 });
		if (!['admin', 'superadmin', 'manager'].includes(profile.role))
			return json({ message: 'Недостаточно прав для CRM.' }, { status: 403 });
		cookies.set(CRM_COOKIE, token, {
			path: '/crm',
			httpOnly: true,
			secure: !dev,
			sameSite: 'strict',
			...validatedTokenPersistence(token)
		});
		return json({ success: true });
	} catch {
		return json({ message: 'Сервис авторизации временно недоступен.' }, { status: 503 });
	}
};

export const DELETE: RequestHandler = async ({ request, cookies, url }) => {
	if (request.headers.get('origin') !== url.origin)
		return json({ message: 'Недопустимый источник запроса.' }, { status: 403 });
	cookies.delete(CRM_COOKIE, { path: '/crm' });
	return json({ success: true });
};
