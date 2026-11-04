import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) =>
	new Response(
		`User-agent: *\nDisallow: /cabinet\nDisallow: /site-settings\nDisallow: /goals\nDisallow: /_ds\nDisallow: /favorites\nClean-param: utm_source&utm_medium&utm_campaign&utm_campaign_id&utm_term&utm_content&utm_id&utm_referrer&yclid&ysclid&ybaip&etext&gclid&fbclid /\nSitemap: ${url.origin}/sitemap.xml\n`,
		{ headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
	);
