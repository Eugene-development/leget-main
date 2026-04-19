import type { Handle } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { ClientError } from 'graphql-request';
import { createGraphQLClient } from '$lib/utils/graphql-client';

const RENDER_PAGE_QUERY = `
	query RenderPage($slug: String!) {
		renderPage(slug: $slug) {
			site { name metaDescription }
			page { slug componentsData }
		}
	}
`;

interface RenderPageResponse {
	renderPage: {
		site: {
			name: string | null;
			metaDescription: string | null;
		};
		page: {
			slug: string;
			componentsData: unknown[];
		};
	};
}

export const handle: Handle = async ({ event, resolve }) => {
	const pathname = event.url.pathname;

	// Skip internal SvelteKit routes and static assets
	if (
		pathname.startsWith('/_app/') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/__data') ||
		pathname.startsWith('/.well-known')
	) {
		return resolve(event);
	}

	const hostname = event.url.hostname;
	const slug = pathname;

	const client = createGraphQLClient({
		'X-Forwarded-Host': hostname
	});

	try {
		const data = await client.request<RenderPageResponse>(RENDER_PAGE_QUERY, { slug });

		event.locals.pageData = {
			site: data.renderPage.site,
			page: data.renderPage.page
		};
	} catch (err) {
		if (err instanceof ClientError) {
			const code = err.response.errors?.[0]?.extensions?.['code'] as string | undefined;

			if (code === 'SITE_NOT_FOUND' || code === 'PAGE_NOT_FOUND') {
				error(404, 'Not found');
			}

			if (code === 'SITE_SUSPENDED') {
				error(403, 'Site suspended');
			}

			// Unhandled GraphQL error — treat as server error
			error(502, 'Bad gateway');
		}

		// Network error or other non-GraphQL failure (e.g. leget-api unreachable)
		const message = err instanceof Error ? err.message : 'Bad gateway';
		console.error('[leget-main] Failed to reach leget-api:', message);
		error(502, 'Bad gateway');
	}

	return resolve(event);
};
