import { redirect } from '@sveltejs/kit';
import { companyDirectoryHref } from '$lib/partners/directory';
import { CLIENT_COOKIE } from '$lib/server/client-session';
import { directorySelection, loadCompanyDirectory } from '$lib/server/company-directory';
import { loadPartnerRegistration } from '$lib/server/partner-registration';
import { loadRenderPage } from '$lib/server/render-page';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const company = event.params.company;
	const slug = company ? `/b2b/${company}` : '/b2b';
	if (!event.url.searchParams.has('draft')) {
		event.setHeaders({ 'cache-control': 'private, no-store' });
	}
	const rendered = await loadRenderPage(event, slug);
	if (company) return { ...rendered, slug, directory: null };

	const { filter, page } = directorySelection(event.url);
	const [directory, registration] = await Promise.all([
		loadCompanyDirectory(event.url, event.request).catch(() => null),
		loadPartnerRegistration(event.cookies.get(CLIENT_COOKIE))
	]);
	if (directory && page > directory.lastPage) {
		redirect(302, companyDirectoryHref(filter, directory.lastPage));
	}

	return {
		...rendered,
		slug,
		directory: {
			directory,
			directoryError: !directory,
			filter,
			registration: {
				...registration,
				profile: registration.profile && { role: registration.profile.role }
			}
		}
	};
};
