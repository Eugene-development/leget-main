import { json } from '@sveltejs/kit';
import { authApi, readApiJson } from '$lib/server/admin-api';
import { claimAttribution } from '$lib/server/attribution';
import { clearClientSession, setClientSession } from '$lib/server/client-session';
import type { RequestHandler } from './$types';

/**
 * Вход клиента. Модалка в шапке шлёт сюда email/пароль, сервер обменивает их
 * в leget-auth на JWT и кладёт его в httpOnly-cookie — браузер токен не видит.
 *
 * Админский адрес получает 403 от leget-auth: роли исключают друг друга.
 */
export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	let body: Record<string, unknown>;
	try {
		body = (await request.json()) as Record<string, unknown>;
	} catch {
		return json({ message: 'Некорректный запрос.' }, { status: 400 });
	}

	const email = String(body.email ?? '')
		.trim()
		.toLowerCase();
	const password = String(body.password ?? '');
	const captchaToken = body.captcha_token == null ? null : String(body.captcha_token);

	if (!email || !password) {
		return json({ message: 'Введите email и пароль.' }, { status: 422 });
	}

	try {
		const response = await authApi('/client/login', {
			method: 'POST',
			// Запрос идёт с адреса контейнера leget-main, поэтому реальный IP
			// посетителя передаём отдельно — SmartCaptcha сверяет его с тем,
			// на котором был решён виджет.
			headers: { 'X-Forwarded-For': getClientAddress() },
			body: JSON.stringify({ email, password, captcha_token: captchaToken })
		});
		const result = await readApiJson(response);

		if (!response.ok || typeof result.token !== 'string') {
			return json(
				{
					message:
						typeof result.message === 'string' ? result.message : 'Неверный email или пароль.',
					errors: result.errors ?? null
				},
				{ status: response.status >= 400 ? response.status : 401 }
			);
		}

		setClientSession(cookies, result.token, result.expires_in);

		// Повторный рекламный переход обновляет последнее касание. Первое
		// на сервере не перезаписывается — ни этим вызовом, ни любым другим.
		await claimAttribution(result.token, cookies);

		return json({ success: true, user: result.user ?? null });
	} catch {
		return json({ message: 'Сервис авторизации временно недоступен.' }, { status: 503 });
	}
};

/** Выход: cookie удаляется, серверная сессия клиенту больше не принадлежит. */
export const DELETE: RequestHandler = async ({ cookies }) => {
	clearClientSession(cookies);
	return json({ success: true });
};
