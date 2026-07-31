import type { PageServerLoad } from './$types';
import { loadRenderPage } from '$lib/server/render-page';

export const load: PageServerLoad = async ({ params, request }) => {
	return loadRenderPage(request, '/' + (params.slug ?? ''));
};
