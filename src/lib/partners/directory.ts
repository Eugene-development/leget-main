export type CompanyFilter = 'manufacturer' | 'supplier';

export function companyDirectoryHref(filter: CompanyFilter | null, page = 1, path = '/b2b') {
	const query = new URLSearchParams();
	if (filter) query.set('type', filter);
	if (page > 1) query.set('page', String(page));
	return query.size ? `${path}?${query}` : path;
}
