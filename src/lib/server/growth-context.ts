import { error, type RequestEvent } from '@sveltejs/kit';
import { adminApi } from './admin-api';
import { crmToken } from './crm';

export async function growthContext(
	event: RequestEvent,
	parent: () => Promise<Record<string, any>>
) {
	const data = await parent();
	const sites = data.context.sites || [];
	const site =
		event.url.searchParams.get('site') || data.context.current_site?.id || sites[0]?.id || '';
	const current = sites.find((s: { id: string }) => s.id === site);
	if (!current) error(403, 'Нет доступа к выбранному сайту.');
	return { sites, site, domain: String(current.domain), base: String(data.base || '/crm') };
}
export async function growthRead(event: RequestEvent, path: string) {
	let response: Response;
	try {
		response = await adminApi(path, {
			headers: { Authorization: `Bearer ${crmToken(event)}` },
			signal: event.request.signal
		});
	} catch {
		error(503, 'Сервис временно недоступен. Повторите загрузку.');
	}
	if (!response.ok) error(response.status, 'Не удалось загрузить данные. Повторите попытку.');
	return response.json();
}
