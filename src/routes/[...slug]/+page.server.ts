import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { loadRenderPage } from '$lib/server/render-page';
import { templatePageStyles } from '$lib/server/template-page-styles';

export const load: PageServerLoad = async (event) => {
	const slug = '/' + (event.params.slug ?? '');
	const result = await loadRenderPage(event, slug);
	if (slug === '/404' && result.pageData.site.templateId === 2) {
		error(404, { message: 'Not found', pageData: result.pageData });
	}
	if (!event.isDataRequest)
		event.locals.pageStylesheets = templatePageStyles(
			result.pageData.site.templateId,
			result.pageData.page.slug
		);
	return result;
};
