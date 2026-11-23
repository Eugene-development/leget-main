import { json, type RequestEvent } from '@sveltejs/kit';
import { authApi, readApiJson } from '$lib/server/admin-api';
import { CLIENT_COOKIE } from '$lib/server/client-session';
import type { RequestHandler } from './$types';

const readableFormats = ['image/jpeg', 'image/png', 'image/webp'];
const fileError = 'Выберите JPEG, PNG или WebP до 2 МБ после кадрирования.';
const failure = 'Не удалось сохранить логотип. Попробуйте ещё раз.';

export const POST: RequestHandler = (event) => changeLogo(event);
export const DELETE: RequestHandler = (event) => changeLogo(event);

async function changeLogo({ request, url, cookies }: RequestEvent) {
	const headers = { 'cache-control': 'private, no-store' };
	if (request.headers.get('origin') !== url.origin)
		return json({ message: 'Недопустимый источник запроса.' }, { status: 403, headers });
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) return json({ message: 'Войдите в кабинет партнёра.' }, { status: 401, headers });

	let body: FormData | undefined;
	if (request.method === 'POST') {
		try {
			const file = (await request.formData()).get('logo');
			if (
				!(file instanceof File) ||
				!file.size ||
				file.size > 2 * 1024 * 1024 ||
				!readableFormats.includes(file.type)
			) {
				return json({ message: fileError }, { status: 422, headers });
			}
			body = new FormData();
			body.set('logo', file);
		} catch {
			return json({ message: fileError }, { status: 422, headers });
		}
	}

	try {
		const response = await authApi('/partner/company-card/logo', {
			method: request.method,
			headers: { Authorization: `Bearer ${token}` },
			body,
			signal: AbortSignal.timeout(20000)
		});
		const result = await readApiJson(response);
		if (response.ok && (typeof result.logoUrl === 'string' || result.logoUrl === null))
			return json({ logoUrl: result.logoUrl }, { headers });
		let message = failure;
		if (response.status === 403 || response.status === 401)
			message = 'Доступ к карточке изменился. Обновите страницу.';
		if (response.status === 422) message = fileError;
		if (response.status === 429) message = 'Подождите минуту и повторите попытку.';
		return json({ message }, { status: response.ok ? 502 : response.status, headers });
	} catch {
		return json({ message: failure }, { status: 503, headers });
	}
}
