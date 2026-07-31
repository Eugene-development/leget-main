import { error } from '@sveltejs/kit';
import { ClientError } from 'graphql-request';
import { createGraphQLClient } from '$lib/utils/graphql-client';

const RENDER_PAGE_QUERY = `
	query RenderPage($slug: String!) {
		renderPage(slug: $slug) {
			site {
				name
				metaDescription
				templateId
				faviconUrl
				header { data }
				footer { data }
			}
			page { id licenseId slug componentsData }
		}
	}
`;

export interface RenderPageResponse {
	renderPage: {
		site: {
			name: string | null;
			metaDescription: string | null;
			templateId: number | null;
			faviconUrl: string | null;
			header: { data: Record<string, unknown> } | null;
			footer: { data: Record<string, unknown> } | null;
		};
		page: {
			id: string;
			licenseId: string;
			slug: string;
			componentsData: unknown[];
		};
	};
}

/**
 * Запрос renderPage к leget-api. Сайт определяется по hostname, который уходит
 * в X-Forwarded-Host — на нём leget-api резолвит лицензию и шаблон.
 *
 * Общий для catch-all маршрута и маршрутов отдельных страниц (src/routes/about
 * и т.п.), чтобы обработка кодов ошибок жила в одном месте.
 */
export async function loadRenderPage(request: Request, slug: string) {
	const hostname = new URL(request.url).hostname;
	const client = createGraphQLClient({ 'X-Forwarded-Host': hostname });

	try {
		const data = await client.request<RenderPageResponse>(RENDER_PAGE_QUERY, { slug });

		return {
			pageData: {
				site: data.renderPage.site,
				page: data.renderPage.page
			}
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

			error(502, 'Bad gateway');
		}

		const message = err instanceof Error ? err.message : 'Bad gateway';
		console.error('[leget-main] Failed to reach leget-api:', message);
		error(502, 'Bad gateway');
	}
}
