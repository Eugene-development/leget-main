import { json } from '@sveltejs/kit';
import { authApi, readApiJson } from '$lib/server/admin-api';
import { setClientSession } from '$lib/server/client-session';
import type { RequestHandler } from './$types';

/**
 * Регистрация клиента. Успешная регистрация сразу открывает сессию — тем же
 * httpOnly-cookie, что и вход (см. client-session.ts).
 */
export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	let body: Record<string, unknown>;
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return json({ message: 'Некорректный запрос.' }, { status: 400 });
	}

	const payload = {
		name: String(body.name ?? '').trim(),
		email: String(body.email ?? '')
			.trim()
			.toLowerCase(),
		password: String(body.password ?? ''),
		password_confirmation: String(body.password_confirmation ?? ''),
		phone: String(body.phone ?? '').trim() || null,
		region: String(body.region ?? '').trim() || null,
		captcha_token: body.captcha_token == null ? null : String(body.captcha_token)
	};

	if (!payload.name || !payload.email || !payload.password) {
		return json({ message: 'Заполните имя, email и пароль.' }, { status: 422 });
	}

	try {
		const response = await authApi('/client/register', {
			method: 'POST',
			headers: { 'X-Forwarded-For': getClientAddress() },
			body: JSON.stringify(payload)
		});
		const result = await readApiJson(response);

		if (!response.ok || typeof result.token !== 'string') {
			return json(
				{
					message:
						typeof result.message === 'string' ? result.message : 'Не удалось зарегистрироваться.',
					errors: result.errors ?? null
				},
				{ status: response.status >= 400 ? response.status : 422 }
			);
		}

		setClientSession(cookies, result.token, result.expires_in);

		return json({ success: true, user: result.user ?? null });
	} catch {
		return json({ message: 'Сервис авторизации временно недоступен.' }, { status: 503 });
	}
};
