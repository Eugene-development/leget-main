import { json } from '@sveltejs/kit';
import { adminApi, readApiJson } from '$lib/server/admin-api';
import type { RequestHandler } from './$types';
const proxy: RequestHandler = async ({ cookies, request, url, params }) => {
	const token = cookies.get('leget_admin_jwt');
	if (!token) return json({ message: 'Сессия истекла. Войдите в админку.' }, { status: 401 });
	if (request.method !== 'GET' && request.headers.get('origin') !== url.origin)
		return json({ message: 'Недопустимый источник запроса.' }, { status: 403 });
	const path = params.path;
	if (
		!/^(?:(?:courses|interviews|resources)(?:\/[a-z0-9-]+(?:\/(?:publish|archive|revision))?)?|media(?:\/[a-f0-9-]+(?:\/(?:part|complete|abort))?)?)$/.test(
			path
		)
	)
		return json({ message: 'Не найдено.' }, { status: 404 });
	let body: string | undefined;
	if (request.method !== 'GET') {
		body = await request.text();
		if (body.length > 4_000_000)
			return json({ message: 'Слишком большой материал.' }, { status: 413 });
		try {
			JSON.parse(body);
		} catch {
			return json({ message: 'Некорректные данные.' }, { status: 400 });
		}
	}
	try {
		const response = await adminApi(`/admin/university/${path}`, {
			method: request.method,
			headers: { Authorization: `Bearer ${token}` },
			body
		});
		return json(await readApiJson(response), {
			status: response.status,
			headers: { 'cache-control': 'private, no-store' }
		});
	} catch {
		return json(
			{ message: 'Сервис недоступен. Ваши изменения остались в редакторе.' },
			{ status: 503 }
		);
	}
};
export const GET = proxy;
export const POST = proxy;
