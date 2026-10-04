import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { randomBytes } from 'node:crypto';
import { error, type RequestEvent } from '@sveltejs/kit';
import { adminApi } from '$lib/server/admin-api';

const OWNER_COOKIE = 'leget_selection_owner';
export async function growthApi(
	event: RequestEvent,
	path: string,
	payload?: unknown
): Promise<Response> {
	const domain = env.FORM_SITE_DOMAIN || event.url.hostname;
	const query = new URLSearchParams({ domain });
	let owner = event.cookies.get(OWNER_COOKIE);
	if (path === 'selections' && payload !== undefined) {
		if (!owner || !/^[a-f0-9]{64}$/.test(owner)) owner = randomBytes(32).toString('hex');
		event.cookies.set(OWNER_COOKIE, owner, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: !dev,
			maxAge: 60 * 60 * 24 * 30
		});
	}
	try {
		return await adminApi(`/growth/${path}?${query}`, {
			method: payload === undefined ? 'GET' : 'POST',
			headers: {
				'X-Forwarded-For': event.getClientAddress(),
				...(owner ? { 'X-Selection-Edit-Token': owner } : {})
			},
			body: payload === undefined ? undefined : JSON.stringify(payload),
			signal: AbortSignal.timeout(20000)
		});
	} catch {
		error(503, 'Сервис временно недоступен. Повторите попытку.');
	}
}

export async function proxyGrowth(event: RequestEvent): Promise<Response> {
	const path = event.params.path || '';
	if (
		!/^(selection-catalog|estimate|selections(?:\/[a-f0-9]{48}(?:\/(?:comments|revoke))?)?)$/.test(
			path
		)
	)
		error(404);
	if (event.request.method !== 'GET' && event.request.headers.get('origin') !== event.url.origin)
		error(403, 'Неверный источник запроса.');
	const body = event.request.method === 'POST' ? await event.request.json() : undefined;
	const response = await growthApi(event, path, body);
	return new Response(response.body, {
		status: response.status,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'private, no-store',
			'X-Content-Type-Options': 'nosniff'
		}
	});
}
