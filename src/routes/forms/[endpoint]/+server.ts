import { createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { CLIENT_COOKIE } from '$lib/server/client-session';
import type { RequestHandler } from './$types';

/** Same-origin intake: bind the source to the HTTP host, never to a form field. */
export const POST: RequestHandler = async ({ request, url, params, cookies, getClientAddress }) => {
	if (!['contact', 'service-request', 'partner-application'].includes(params.endpoint)) error(404);
	if (request.headers.get('origin') !== url.origin) error(403, 'Неверный источник формы.');
	const token = params.endpoint === 'partner-application' ? cookies.get(CLIENT_COOKIE) : null;
	if (params.endpoint === 'partner-application' && !token) error(401, 'Сначала войдите в аккаунт.');
	const secret = env.FORM_CONTEXT_SECRET;
	if (!secret || secret.length < 32) error(503, 'Приём заявок временно недоступен.');
	const domain = (env.FORM_SITE_DOMAIN || url.hostname).toLowerCase().replace(/^www\./, '');
	const payload = Buffer.from(
		JSON.stringify({
			domain,
			timestamp: Math.floor(Date.now() / 1000),
			client_ip: getClientAddress()
		})
	).toString('base64url');
	const signature = createHmac('sha256', secret).update(payload).digest('hex');
	const body = await request.formData();
	body.delete('license_id');
	const base =
		env.AUTH_BACKEND_URL ||
		`${env.RUNTIME_AUTH_API_URL || env.PUBLIC_AUTH_URL || 'http://localhost:8000'}/api`;
	try {
		const response = await fetch(
			`${base.replace(/\/$/, '')}/${params.endpoint === 'partner-application' ? 'partner/apply' : `notify/${params.endpoint}`}`,
			{
				method: 'POST',
				body,
				headers: {
					Accept: 'application/json',
					...(token ? { Authorization: `Bearer ${token}` } : {}),
					'X-Leget-Form-Context': `${payload}.${signature}`,
					'X-Forwarded-For': getClientAddress()
				},
				signal: AbortSignal.timeout(45000)
			}
		);
		return new Response(await response.text(), {
			status: response.status,
			headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
		});
	} catch {
		error(503, 'Не удалось связаться с сервисом заявок. Повторите отправку.');
	}
};
