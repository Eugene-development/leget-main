import { error, type RequestEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { adminApi } from './admin-api';

export const ORDER_COOKIE = 'leget_order_access';
export const orderDomain = (event: Pick<RequestEvent, 'url'>) =>
	env.FORM_SITE_DOMAIN || event.url.hostname;
export async function orderApi(event: RequestEvent, path: string, init: RequestInit = {}) {
	let response: Response;
	try {
		response = await adminApi(`/growth/orders/${path}`, {
			...init,
			signal: event.request.signal,
			headers: {
				...(event.cookies.get(ORDER_COOKIE)
					? { Authorization: `Bearer ${event.cookies.get(ORDER_COOKIE)}` }
					: {}),
				...init.headers
			}
		});
	} catch {
		error(503, 'Кабинет временно недоступен. Повторите действие.');
	}
	return response;
}
export async function readOrder(event: RequestEvent) {
	if (!event.cookies.get(ORDER_COOKIE)) return null;
	const response = await orderApi(
		event,
		`session?domain=${encodeURIComponent(orderDomain(event))}`
	);
	if (response.status === 401) {
		event.cookies.delete(ORDER_COOKIE, { path: '/orders' });
		return null;
	}
	if (!response.ok) error(response.status, 'Не удалось загрузить заказ. Повторите попытку.');
	return response.json();
}
