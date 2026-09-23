import { error, redirect } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { authApi } from './admin-api';
import { CLIENT_COOKIE } from './client-session';

export async function universityData<T>(cookies: Cookies, path: string): Promise<T> {
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) redirect(303, '/university/auth');
	let response: Response;
	try {
		response = await authApi(`/university/${path}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
	} catch {
		error(503, 'Университет временно недоступен. Попробуйте обновить страницу.');
	}
	if (response.status === 401) redirect(303, '/university/auth');
	if (response.status === 403) redirect(303, '/university/auth?enroll=1');
	if (!response.ok)
		error(
			response.status,
			response.status === 404 ? 'Материал не найден.' : 'Не удалось загрузить учебные данные.'
		);
	return (await response.json()) as T;
}
