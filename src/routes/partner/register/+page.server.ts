import { CLIENT_COOKIE } from '$lib/server/client-session';
import { loadPartnerRegistration } from '$lib/server/partner-registration';
import { loadRenderPage } from '$lib/server/render-page';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// Регистрация использует опубликованную шапку и подвал текущего сайта.
	const [rendered, registration] = await Promise.all([
		loadRenderPage({ ...event, url: new URL('/', event.url) }, '/').catch(() => null),
		loadPartnerRegistration(event.cookies.get(CLIENT_COOKIE))
	]);
	if (!rendered?.backendUnavailable) event.setHeaders({ 'cache-control': 'private, no-store' });

	const site = rendered?.pageData.site ?? null;
	const components = rendered?.pageData.page.componentsData as
		| { type: string; data: Record<string, unknown> }[]
		| undefined;
	return {
		...registration,
		site,
		footer: components?.find(({ type }) => type === 'Footer') ?? null
	};
};
