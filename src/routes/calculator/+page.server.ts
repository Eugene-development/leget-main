import { error } from '@sveltejs/kit';
import { growthApi } from '$lib/growth/selections/server';
import { loadRenderPage } from '$lib/server/render-page';
import type { EstimateSettings } from '$lib/growth/estimates/api';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const [response, rendered] = await Promise.all([
		growthApi(event, 'estimate'),
		loadRenderPage(event, '/')
	]);
	if (!response.ok) error(503, 'Не удалось загрузить калькулятор. Повторите загрузку.');
	return { settings: (await response.json()) as EstimateSettings, site: rendered.pageData.site };
};
