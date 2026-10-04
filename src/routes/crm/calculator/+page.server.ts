import { error } from '@sveltejs/kit';
import { crmToken } from '$lib/server/crm';
import { adminApi } from '$lib/server/admin-api';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async (event) => {
	const layout = await event.parent();
	const sites = layout.context.sites as {
		id: string;
		name: string;
		domain: string;
		manage: boolean;
	}[];
	const siteId =
		event.url.searchParams.get('site') || layout.context.current_site?.id || sites[0]?.id;
	const site = sites.find((entry) => entry.id === siteId);
	if (!site) error(404, 'Сайт не найден.');
	if (!site.manage) error(403, 'Калькулятор настраивает владелец сайта.');
	let response: Response;
	try {
		response = await adminApi(`/crm/sites/${site.id}/calculator`, {
			headers: { Authorization: `Bearer ${crmToken(event)}` }
		});
	} catch {
		error(503, 'Не удалось загрузить настройки калькулятора.');
	}
	if (!response.ok) error(response.status, 'Не удалось загрузить настройки калькулятора.');
	return { site, sites, settings: await response.json(), base: layout.base || '/crm' };
};
