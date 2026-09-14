import { error } from '@sveltejs/kit';
import type { Cookies } from '@sveltejs/kit';
import { adminAuthApi } from '$lib/server/admin-api';
import { createGraphQLClient } from '$lib/utils/graphql-client';
import { normalizeYandexCounterId } from '$lib/site-settings/analytics';

export const GOALS_COOKIE = 'leget_goals_jwt';
export interface GoalsSite {
	id: string;
	domain: string;
	templateId: number | null;
	headerData: Record<string, unknown> | null;
}
export function siteTemplate(site: GoalsSite): string {
	return site.templateId && [1, 2, 3].includes(site.templateId)
		? `Promo-${site.templateId}`
		: 'Test';
}
export async function requireGoalsSite(cookies: Cookies, hostname: string) {
	const token = cookies.get(GOALS_COOKIE);
	if (!token) error(401, 'Войдите в управление целями.');
	let response: Response;
	try {
		response = await adminAuthApi('/auth/me', {
			headers: { Authorization: `Bearer ${token}` },
			signal: AbortSignal.timeout(10000)
		});
	} catch {
		error(502, 'Не удалось проверить сессию.');
	}
	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			cookies.delete(GOALS_COOKIE, { path: '/goals' });
			error(401, 'Сессия завершена. Войдите повторно.');
		}
		error(502, 'Не удалось проверить сессию.');
	}
	const client = createGraphQLClient({ Authorization: `Bearer ${token}` });
	let result: { myLicenses: GoalsSite[] };
	try {
		result = await client.request(
			`query GoalsOwnedSites { myLicenses { id domain templateId headerData } }`
		);
	} catch {
		error(502, 'Не удалось проверить владельца сайта.');
	}
	const normalized = hostname.toLowerCase().replace(/\.$/, '');
	const site = result.myLicenses.find(
		(site) => site.domain.trim().toLowerCase().replace(/\.$/, '') === normalized
	);
	if (!site) error(403, 'У вас нет доступа к целям этого сайта.');
	return { site, client, counterId: normalizeYandexCounterId(site.headerData?.yandexMetrica) };
}
