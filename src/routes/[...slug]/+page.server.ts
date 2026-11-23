import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadRenderPage } from '$lib/server/render-page';

export const load: PageServerLoad = async (event) => {
	const slug = '/' + (event.params.slug ?? '');
	const result = await loadRenderPage(event, slug);
	if (slug === '/404' && result.pageData.site.templateId === 2) {
		error(404, { message: 'Not found', pageData: result.pageData });
	}
	return result;
};
