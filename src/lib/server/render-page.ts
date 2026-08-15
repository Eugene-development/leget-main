import { error } from '@sveltejs/kit';
import { ClientError, type GraphQLClient } from 'graphql-request';
import { createGraphQLClient } from '$lib/utils/graphql-client';

/** Слаг страницы 404 в шаблоне — см. config/templates.php в leget-api. */
const NOT_FOUND_SLUG = '/404';

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
			page {
				id
				licenseId
				slug
				requestedSlug
				componentsData
				seo {
					title
					description
					keywords
					rawTitle
					rawDescription
					isDynamic
					pattern
					variables { token label value }
				}
			}
		}
	}
`;

export interface PageSeoData {
	title: string | null;
	description: string | null;
	keywords: string | null;
	rawTitle: string | null;
	rawDescription: string | null;
	isDynamic: boolean;
	pattern: string;
	variables: Array<{
		token: string;
		label: string;
		value: string;
	}>;
}

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
			requestedSlug: string;
			componentsData: unknown[];
			seo: PageSeoData;
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

			if (code === 'PAGE_NOT_FOUND') {
				error(404, { message: 'Not found', pageData: await loadNotFoundPage(client, slug) });
			}

			if (code === 'SITE_NOT_FOUND') {
				// Сайт не резолвится по домену — шаблона нет, показать нечего,
				// кроме нейтральной заглушки из +error.svelte.
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

/**
 * Данные страницы 404 сайта — тем же запросом renderPage по слагу '/404'.
 *
 * Зачем отдельный запрос, а не рендер ошибки «как есть»: страница 404 обязана
 * выглядеть страницей шаблона (свой хэдер, футер, палитра), а +error.svelte о
 * сайте не знает ничего — layout его не загружает. Ответ уходит в теле ошибки,
 * поэтому статус остаётся честным 404, а не soft-404 с кодом 200.
 *
 * Шаблон без страницы '/404' (и любой сбой при её загрузке) — не повод падать:
 * возвращаем null, +error.svelte покажет нейтральную заглушку.
 */
async function loadNotFoundPage(client: GraphQLClient, slug: string) {
	// Сам '/404' не существует в шаблоне — второй такой же запрос вернёт ту же
	// ошибку, поэтому за ним не идём.
	if (slug === NOT_FOUND_SLUG) return null;

	try {
		const data = await client.request<RenderPageResponse>(RENDER_PAGE_QUERY, {
			slug: NOT_FOUND_SLUG
		});

		return { site: data.renderPage.site, page: data.renderPage.page };
	} catch {
		return null;
	}
}
