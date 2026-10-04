import { growthContext, growthRead } from '$lib/server/growth-context';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const context = await growthContext(event, event.parent);
	const search = event.url.searchParams.get('order_search') || '';
	const page = event.url.searchParams.get('order_page') || '1';
	const query = new URLSearchParams({ search, page, per_page: '30' });
	const response = await growthRead(event, `/crm/sites/${context.site}/deals?${query}`);
	return {
		...context,
		search,
		deals: response.items.data,
		pagination: {
			current_page: response.items.current_page,
			last_page: response.items.last_page,
			total: response.items.total
		}
	};
};
