import type { CompanyFilter } from '$lib/partners/directory';
import type { CompanyDirectory } from '$lib/partners/types';
import { createGraphQLClient } from '$lib/utils/graphql-client';

const DIRECTORY_QUERY = `
	query PartnerCompanies($type: PartnerCompanyType, $page: Int!, $perPage: Int!) {
		partnerCompanies(type: $type, page: $page, perPage: $perPage) {
			items { path name typeLabel city description logoUrl }
			page
			lastPage
		}
	}
`;

export function directorySelection(url: URL): { filter: CompanyFilter | null; page: number } {
	const type = url.searchParams.get('type');
	const filter = type === 'manufacturer' || type === 'supplier' ? type : null;
	const requestedPage = Number(url.searchParams.get('page'));
	const page =
		Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= 2147483647
			? requestedPage
			: 1;
	return { filter, page };
}

export async function loadCompanyDirectory(url: URL, request: Request) {
	const { filter, page } = directorySelection(url);
	const client = createGraphQLClient({ 'X-Forwarded-Host': new URL(request.url).hostname });
	const result = await client.request<{ partnerCompanies: CompanyDirectory }>({
		document: DIRECTORY_QUERY,
		variables: { type: filter?.toUpperCase() ?? null, page, perPage: 9 },
		signal: AbortSignal.any([request.signal, AbortSignal.timeout(5000)])
	});
	return result.partnerCompanies;
}
