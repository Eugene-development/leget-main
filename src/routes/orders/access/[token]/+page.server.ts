import { dev } from '$app/environment';
import { fail, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { orderApi, orderDomain, ORDER_COOKIE, readOrder } from '$lib/server/order-portal';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const response = await orderApi(
		event,
		`invitation/${encodeURIComponent(event.params.token)}?domain=${encodeURIComponent(orderDomain(event))}`
	);
	return {
		available: response.ok,
		exchangeKey: randomUUID(),
		existingSession: Boolean(await readOrder(event))
	};
};
export const actions: Actions = {
	default: async (event) => {
		const body = await event.request.formData();
		const response = await orderApi(event, 'exchange', {
			method: 'POST',
			body: JSON.stringify({
				token: event.params.token,
				domain: orderDomain(event),
				exchange_key: body.get('exchange_key')
			})
		});
		if (!response.ok)
			return fail(response.status, {
				message:
					'Приглашение недействительно, истекло или уже использовано. Запросите новую ссылку у менеджера.'
			});
		const result = await response.json();
		event.cookies.set(ORDER_COOKIE, result.session, {
			path: '/orders',
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: Math.min(30 * 86400, Number(result.expires_in))
		});
		redirect(303, '/orders');
	}
};
