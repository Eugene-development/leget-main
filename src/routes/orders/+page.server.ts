import { redirect } from '@sveltejs/kit';
import { ORDER_COOKIE, readOrder } from '$lib/server/order-portal';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => ({ portal: await readOrder(event) });
export const actions: Actions = {
	logout: ({ cookies }) => {
		cookies.delete(ORDER_COOKIE, { path: '/orders' });
		redirect(303, '/orders');
	}
};
