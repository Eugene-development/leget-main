import type { PageServerLoad } from './$types';
import { loadRenderPage } from '$lib/server/render-page';

export const load: PageServerLoad = async (event) => {
	return loadRenderPage(event, '/' + (event.params.slug ?? ''));
};
