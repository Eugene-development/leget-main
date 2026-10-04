import { error, type ServerLoadEvent } from '@sveltejs/kit';
import { adminApi } from '$lib/server/admin-api';
import { crmToken } from '$lib/server/crm';

export async function loadGrowth(event: ServerLoadEvent, section: 'insights' | 'automation') {
	const parent = await event.parent();
	const sites = parent.context.sites as { id: string; name: string; manage: boolean }[];
	const requested = event.url.searchParams.get('site');
	const site =
		sites.find((item) => item.id === requested) ||
		(!requested
			? sites.find((item) => item.id === parent.context.current_site?.id) || sites[0]
			: undefined);
	if (requested && !site) error(403, 'Нет доступа к CRM этого сайта.');
	if (!site)
		return { ...parent, siteId: '', section, report: null, automation: null, metrika: null };
	const token = crmToken(event);
	const suffix =
		section === 'insights'
			? `?${new URLSearchParams({ from: event.url.searchParams.get('from') || moscowDate(true), to: event.url.searchParams.get('to') || moscowDate(false) })}`
			: '';
	const read = async (path: string) => {
		let response: Response;
		try {
			response = await adminApi(`/crm/growth/sites/${site.id}/${path}`, {
				headers: { Authorization: `Bearer ${token}` },
				signal: event.request.signal
			});
		} catch {
			error(503, 'Не удалось загрузить данные CRM. Повторите загрузку.');
		}
		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			error(response.status, body.message || 'Не удалось загрузить данные CRM.');
		}
		return response.json();
	};
	const [content, metrika] = await Promise.all([
		read(section + suffix),
		section === 'insights' && site.manage ? read('metrika') : Promise.resolve(null)
	]);
	return {
		...parent,
		siteId: site.id,
		section,
		report: section === 'insights' ? content : null,
		automation: section === 'automation' ? content : null,
		metrika
	};
}

function moscowDate(first: boolean) {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Moscow',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(new Date());
	const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	return `${values.year}-${values.month}-${first ? '01' : values.day}`;
}
