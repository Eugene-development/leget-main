import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { GOALS_COOKIE, requireGoalsSite, siteTemplate } from '$lib/server/goals-access';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, url, setHeaders }) => {
	setHeaders({ 'Cache-Control': 'private, no-store' });
	if (!cookies.get(GOALS_COOKIE)) redirect(303, '/');
	const { site, counterId } = await requireGoalsSite(cookies, url.hostname);
	return {
		metrikaConfigured: !!env.YANDEX_METRIKA_OAUTH_TOKEN?.trim(),
		goalsSite: { domain: site.domain, template: siteTemplate(site), counterId }
	};
};
