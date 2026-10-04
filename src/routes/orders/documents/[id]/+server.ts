import { error } from '@sveltejs/kit';
import { orderApi, orderDomain } from '$lib/server/order-portal';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async (event) => {
	if (!/^[A-Z0-9]{26}$/.test(event.params.id)) error(404);
	const response = await orderApi(
		event,
		`documents/${event.params.id}?domain=${encodeURIComponent(orderDomain(event))}`
	);
	const headers = new Headers({
		'Cache-Control': 'private,no-store',
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'no-referrer'
	});
	for (const name of ['content-type', 'content-disposition']) {
		const value = response.headers.get(name);
		if (value) headers.set(name, value);
	}
	return new Response(response.body, { status: response.status, headers });
};
