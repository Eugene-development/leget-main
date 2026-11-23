import { json } from '@sveltejs/kit';
import { ClientError } from 'graphql-request';
import { loadCompanyDirectory } from '$lib/server/company-directory';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, request }) => {
	const headers = { 'cache-control': 'no-store' };
	try {
		return json(await loadCompanyDirectory(url, request), { headers });
	} catch (error) {
		const missing =
			error instanceof ClientError &&
			error.response.errors?.some((item) => item.extensions?.code === 'PAGE_NOT_FOUND');
		return json(
			{ message: 'Не удалось загрузить компании.' },
			{ status: missing ? 404 : 503, headers }
		);
	}
};
