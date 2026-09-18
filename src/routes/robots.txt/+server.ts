import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) =>
	new Response(
		`User-agent: *\nDisallow: /admin\nDisallow: /cabinet\nDisallow: /site-settings\nDisallow: /goals\nDisallow: /_ds\nDisallow: /favorites\nSitemap: ${url.origin}/sitemap.xml\n`,
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
	);
