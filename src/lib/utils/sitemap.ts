const escapeXml = (value: string) =>
	value.replace(
		/[<>&"']/g,
		(char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!
	);

export function sitemapXml(origin: string, paths: string[]): string {
	const urls = [...new Set(paths)].map((path) => {
		if (!path.startsWith('/') || /^\/\//.test(path) || /[{}?#\\\x00-\x20]/u.test(path))
			throw new Error('Invalid public path');
		return new URL(path, origin).href;
	});
	if (urls.length > 50000) throw new Error('Sitemap requires partitioning');
	return (
		'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		urls.map((url) => `<url><loc>${escapeXml(url)}</loc></url>`).join('\n') +
		'\n</urlset>\n'
	);
}
