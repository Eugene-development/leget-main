import { growthContext, growthRead } from '$lib/server/growth-context';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const context = await growthContext(event, event.parent);
	return {
		...context,
		checklist: await growthRead(event, `/crm/portal/sites/${context.site}/launch`)
	};
};
