import { createGraphQLClient } from '$lib/utils/graphql-client';
import { sitemapXml } from '$lib/utils/sitemap';
import { ClientError } from 'graphql-request';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, request }) => {
	try {
		const client = createGraphQLClient({ 'X-Forwarded-Host': url.hostname });
		const result = await client.request<{ siteMap: string[] }>({
			document: 'query SiteMap { siteMap }',
			signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)])
		});
		return new Response(sitemapXml(url.origin, result.siteMap), {
			headers: {
				'Content-Type': 'application/xml; charset=utf-8',
				'Cache-Control': 'public, max-age=60'
			}
		});
	} catch (cause) {
		const missing =
			cause instanceof ClientError &&
			cause.response.errors?.some((e) => e.extensions?.code === 'SITE_NOT_FOUND');
		return new Response(missing ? 'Site not found' : 'Sitemap temporarily unavailable', {
			status: missing ? 404 : 503,
			headers: { 'Cache-Control': 'no-store' }
		});
	}
};
