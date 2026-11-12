export type TopBarLink = { href: string; label: string };

export function topBarVersion(data: Record<string, unknown>): 'v1' | 'v2' {
	return data.topBarVersion === 'v2' ? 'v2' : 'v1';
}

const defaultLinks: TopBarLink[] = [
	{ href: '/about', label: 'О фабрике' },
	{ href: '/styles', label: 'Стили' },
	{ href: '/facades', label: 'Фасады' },
	{ href: '/furniture', label: 'Фурнитура' },
	{ href: '/designers', label: 'Дизайнерам' }
];

/** Only navigation URLs; prevent script/data schemes in owner-edited links. */
export function isTopBarHref(href: string): boolean {
	if (!href || /[\s\\\u0000-\u001f\u007f]/.test(href)) return false;
	if (href.startsWith('#')) return true;
	if (href.startsWith('/') && !href.startsWith('//')) return true;
	try {
		const url = new URL(href);
		return url.protocol === 'https:' || url.protocol === 'http:';
	} catch {
		return false;
	}
}

/** Keep the existing header_data keys: no migration or second contact source. */
export function topBarLinks(data: Record<string, unknown>): TopBarLink[] {
	const links = Array.isArray(data.topLinks) ? data.topLinks : defaultLinks;
	return links.filter((link): link is TopBarLink =>
		Boolean(
			link &&
			typeof link.label === 'string' &&
			typeof link.href === 'string' &&
			link.label.trim() &&
			isTopBarHref(link.href)
		)
	);
}

export function topBarPhone(data: Record<string, unknown>): string {
	if (data.phone === null) return '';
	return typeof data.phone === 'string' ? data.phone.trim() : '8 (915) 400-00-20';
}

export function topBarEmail(data: Record<string, unknown>): string {
	if (data.email === null) return '';
	return typeof data.email === 'string' ? data.email.trim() : 'info@mebelzov.com';
}
