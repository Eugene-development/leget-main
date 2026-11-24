import { loadRenderPage } from '$lib/server/render-page';
import { templatePageStyles } from '$lib/server/template-page-styles';
import type { PageServerLoad } from './$types';

/** Контент страницы приходит из каталога; выбор ID остаётся в браузере. */
export const load: PageServerLoad = async (event) => {
	const result = await loadRenderPage(event, '/favorites');
	if (!event.isDataRequest)
		event.locals.pageStylesheets = templatePageStyles(result.pageData.site.templateId, '/favorites');
	return result;
};
