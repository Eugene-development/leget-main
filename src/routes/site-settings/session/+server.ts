import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { adminAuthApi } from '$lib/server/admin-api';
import type { RequestHandler } from './$types';

const COOKIE_NAME = 'leget_site_settings_jwt';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const authorization = request.headers.get('authorization') ?? '';
	if (!/^Bearer\s+\S+$/.test(authorization)) {
		return json({ message: 'Требуется авторизация.' }, { status: 401 });
	}

	try {
		const response = await adminAuthApi('/auth/me', {
			headers: { Authorization: authorization }
		});
		if (!response.ok) return json({ message: 'Сессия недействительна.' }, { status: 401 });

		cookies.set(COOKIE_NAME, authorization.slice(7), {
			path: '/site-settings',
			httpOnly: true,
			secure: !dev,
			sameSite: 'strict',
			maxAge: 3_600
		});
		return json({ success: true });
	} catch {
		return json({ message: 'Сервис авторизации временно недоступен.' }, { status: 503 });
	}
};

export const DELETE: RequestHandler = async ({ cookies }) => {
	cookies.delete(COOKIE_NAME, { path: '/site-settings' });
	return json({ success: true });
};
