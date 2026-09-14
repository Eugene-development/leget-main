import { json } from '@sveltejs/kit';
import { ClientError } from 'graphql-request';
import { createGraphQLClient } from '$lib/utils/graphql-client';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, request, getClientAddress }) => {
	const query = (url.searchParams.get('q') ?? '').trim();
	const offset = Number(url.searchParams.get('offset') ?? 0);
	const headers = { 'Cache-Control': 'no-store' };
	if (Array.from(query).length > 120 || !Number.isInteger(offset) || offset < 0 || offset > 10000) {
		return json({ message: 'Проверьте поисковый запрос.' }, { status: 400, headers });
	}
	if (Array.from(query).length < 3) return json({ items: [], total: 0 }, { headers });
	try {
		const client = createGraphQLClient({
			'X-Forwarded-Host': url.hostname,
			'X-Forwarded-For': getClientAddress()
		});
		const result = await client.request<{
			searchSite: { items: Array<{ title: string; url: string; snippet: string }>; total: number };
		}>({
			document: `query SearchSite($query: String!, $offset: Int!) {
				searchSite(query: $query, offset: $offset) { items { title url snippet } total }
			}`,
			variables: { query, offset },
			signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)])
		});
		return json(result.searchSite, { headers });
	} catch (error) {
		const limited =
			error instanceof ClientError &&
			error.response.errors?.some((item) => item.extensions?.code === 'RATE_LIMITED');
		return json(
			{
				message: limited
					? 'Слишком много запросов. Повторите через минуту.'
					: 'Не удалось загрузить результаты. Попробуйте ещё раз.'
			},
			{
				status: limited ? 429 : 502,
				headers
			}
		);
	}
};
