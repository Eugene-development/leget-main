import { error, redirect } from '@sveltejs/kit';
import { adminApi } from '$lib/server/admin-api';
import { CLIENT_COOKIE } from '$lib/server/client-session';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ cookies, params, setHeaders }) => {
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) error(401, 'Войдите в университет.');
	const response = await adminApi(`/university/media/${encodeURIComponent(params.id)}`, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!response) error(503, 'Не удалось загрузить файл.');
	if (!response.ok) error(response.status, 'Файл недоступен.');
	const data = await response.json();
	setHeaders({ 'cache-control': 'private, no-store', 'referrer-policy': 'no-referrer' });
	redirect(302, data.url);
};
