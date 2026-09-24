import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { CLIENT_COOKIE, readSessionProfile } from '$lib/server/client-session';
import { adminApi, authApi } from '$lib/server/admin-api';
import { env } from '$env/dynamic/private';

export function crmToken(event: Pick<RequestEvent, 'cookies' | 'url'>): string {
	const admin = event.url.pathname.startsWith('/admin/crm');
	const token = event.cookies.get(admin ? 'leget_admin_jwt' : CLIENT_COOKIE);
	if (!token) redirect(303, admin ? '/admin' : '/?auth=client-login');
	return token;
}

export async function loadCrm(event: Pick<RequestEvent, 'cookies' | 'url'>) {
	const token = crmToken(event);
	const profile = await readSessionProfile(token).catch(() => null);
	if (!profile) error(401, 'Сессия завершена. Войдите снова.');
	const domain = env.FORM_SITE_DOMAIN || event.url.hostname;
	const response = await adminApi(`/crm/context?domain=${encodeURIComponent(domain)}`, {
		headers: { Authorization: `Bearer ${token}` }
	});
	if (!response.ok) error(response.status, 'Не удалось загрузить CRM.');
	const context = await response.json();
	return {
		profile,
		context,
		base: event.url.pathname.startsWith('/admin/crm') ? '/admin/crm' : '/crm'
	};
}

/** All CRM browser mutations are same-origin. No bearer token reaches JavaScript. */
export async function proxyCrm(event: RequestEvent): Promise<Response> {
	const token = crmToken(event);
	const { request, url, params } = event;
	const path = params.path || '';
	if (!/^[a-zA-Z0-9/_-]+$/.test(path) || path.includes('..')) error(404);
	if (request.method !== 'GET' && request.headers.get('origin') !== url.origin)
		error(403, 'Неверный источник запроса.');
	let response: Response;
	try {
		if (path.startsWith('intake/')) {
			const action = path.slice(7);
			if (request.method !== 'POST' || !['offline', 'apply'].includes(action)) error(404);
			const form = await request.formData();
			const site = String(form.get('license_id') || '');
			if (!/^[A-Z0-9]{26}$/.test(site)) error(422, 'Выберите сайт.');
			form.delete('license_id');
			const body = Object.fromEntries(
				[...form.entries()].filter((entry) => typeof entry[1] === 'string')
			);
			response = await authApi(`/crm/sites/${site}/${action}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify(body)
			});
		} else if (/^sites\/[A-Z0-9]{26}\/attachments\/[A-Z0-9]{26}$/.test(path)) {
			if (request.method !== 'GET') error(405);
			response = await authApi(`/crm/${path}`, { headers: { Authorization: `Bearer ${token}` } });
		} else {
			const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
			let body: BodyInit | undefined;
			if (request.method !== 'GET') {
				if (request.headers.get('content-type')?.includes('multipart/form-data')) {
					body = await request.formData();
					// adminApi's JSON default must not overwrite the FormData boundary.
					const backend =
						env.API_BACKEND_URL ||
						env.LEGET_API_URL ||
						env.RUNTIME_API_BASE_URL ||
						env.PUBLIC_API_URL ||
						'http://localhost:8001';
					response = await fetch(`${backend.replace(/\/$/, '')}/crm/${path}`, {
						method: request.method,
						headers: { ...headers, Accept: 'application/json' },
						body
					});
					return forward(response);
				}
				body = JSON.stringify(await request.json());
			}
			response = await adminApi(`/crm/${path}${url.search}`, {
				method: request.method,
				headers,
				body
			});
		}
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		error(503, 'Сервис CRM временно недоступен. Повторите действие.');
	}
	return forward(response);
}

function forward(response: Response): Response {
	const headers = new Headers({
		'Cache-Control': 'private, no-store',
		'X-Content-Type-Options': 'nosniff'
	});
	for (const name of ['content-type', 'content-disposition', 'content-security-policy']) {
		const value = response.headers.get(name);
		if (value) headers.set(name, value);
	}
	return new Response(response.body, { status: response.status, headers });
}
