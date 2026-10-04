import { dev } from '$app/environment';
import { json } from '@sveltejs/kit';
import { authApi, readApiJson } from '$lib/server/admin-api';
import { setClientSession } from '$lib/server/client-session';
import { sessionPersistence } from '$lib/server/session-persistence';
import { claimAttribution } from '$lib/server/attribution';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies, url, params, getClientAddress }) => {
	const reply = (body: unknown, status = 200) =>
		json(body, { status, headers: { 'Cache-Control': 'no-store' } });
	if (request.headers.get('origin') !== url.origin)
		return reply({ message: 'Недопустимый источник запроса.' }, 403);
	if (!['request', 'verify'].includes(params.action))
		return reply({ message: 'Маршрут не найден.' }, 404);
	let body;
	try {
		body = await request.json();
	} catch {
		return reply({ message: 'Некорректный запрос.' }, 400);
	}
	if (!body || !['client', 'admin', 'university'].includes(body.context))
		return reply({ message: 'Некорректный контекст входа.' }, 422);
	try {
		const response = await authApi(`/sms/${params.action}`, {
			method: 'POST',
			headers: { 'X-Forwarded-For': getClientAddress() },
			body: JSON.stringify({
				phone: body.phone,
				context: body.context,
				code: body.code,
				challenge_id: body.challenge_id,
				captcha_token: body.captcha_token,
				remember: body.remember
			})
		});
		const result = await readApiJson(response);
		if (!response.ok)
			return reply({ message: result.message, errors: result.errors }, response.status);
		if (params.action === 'request')
			return reply({
				success: true,
				challenge_id: result.challenge_id,
				expires_in: result.expires_in,
				retry_after: result.retry_after,
				test_mode: result.test_mode,
				test_code: result.test_code
			});
		if (typeof result.token !== 'string')
			return reply({ message: 'Не удалось создать сессию.' }, 502);
		if (body.context === 'admin') {
			if (result.role !== 'superadmin') return reply({ message: 'Недостаточно прав.' }, 403);
			cookies.set('leget_admin_jwt', result.token, {
				path: '/admin',
				httpOnly: true,
				secure: !dev,
				sameSite: 'strict',
				...sessionPersistence(result.expires_in, result.remember)
			});
		} else {
			setClientSession(cookies, result.token, result.expires_in, result.remember);
			await claimAttribution(result.token, cookies);
		}
		return reply({ success: true, user: result.user });
	} catch {
		return reply({ message: 'Сервис авторизации временно недоступен.' }, 503);
	}
};
