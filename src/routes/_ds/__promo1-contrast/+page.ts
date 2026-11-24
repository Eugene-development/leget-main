import { catalogEntries, resolveComponent } from '$lib/ds/registry';
import type { PageLoad } from './$types';

// Interactive developer fixture, protected by /_ds/+layout.server.ts.
export const prerender = false;

export const load: PageLoad = async () => {
	const entries = await catalogEntries(1);
	return {
		entries: await Promise.all(
			entries.map(async (entry) => ({
				...entry,
				component: (await resolveComponent(1, entry.pageSlug, entry.type))!
			}))
		)
	};
};
