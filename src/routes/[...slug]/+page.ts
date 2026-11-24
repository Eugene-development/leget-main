import { loadTemplatePage } from '$lib/components/templates/load-template-page';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ data }) => ({
	...data,
	...(await loadTemplatePage(data.pageData.site.templateId, data.pageData.page.slug))
});
