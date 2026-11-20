import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { crmSiteId } from '$lib/crm/navigation';
import { adminApi } from '$lib/server/admin-api';
import { crmToken } from '$lib/server/crm';
import type { Promotion } from '$lib/promotions/cabinet';

export async function loadCrmPromotions(event: ServerLoadEvent) {
	const { context, base } = await event.parent();
	const site = crmSiteId(
		context.sites,
		context.current_site?.id,
		event.url.searchParams.get('site')
	);
	event.setHeaders({ 'cache-control': 'private, no-store' });
	if (!site) return { base, site, items: [] as Promotion[], canCreate: false };
	if (!context.sites.some((entry: { id: string }) => entry.id === site))
		error(403, 'Нет доступа к акциям этого сайта.');
	const response = await adminApi(`/crm/sites/${encodeURIComponent(site)}/promotions`, {
		headers: { Authorization: `Bearer ${crmToken(event)}` },
		signal: event.request.signal
	}).catch(() => error(503, 'Не удалось подключиться к CRM.'));
	if (!response.ok) error(response.status, 'Не удалось загрузить акции.');
	const result: { items: Promotion[]; canCreate: boolean } = await response.json();
	return { base, site, ...result };
}
