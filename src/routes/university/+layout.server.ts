import { loadRenderPage } from '$lib/server/render-page';
import type { LayoutServerLoad } from './$types';

// Carry the tenant's chosen design system and analytics into its learning area.
export const load: LayoutServerLoad = async (event) => {
	event.setHeaders({ 'cache-control': 'private, no-store' });
	try {
		const result = await loadRenderPage(event, '/university');
		return { site: result.pageData.site };
	} catch {
		// Authentication and existing student records remain usable during a site API outage.
		return { site: null };
	}
};
