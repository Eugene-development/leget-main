import { error } from '@sveltejs/kit';
import { growthApi } from '$lib/growth/selections/server';
import { loadRenderPage } from '$lib/server/render-page';
import type { Selection } from '$lib/growth/selections/api';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	event.setHeaders({
		'Cache-Control': 'private, no-store',
		'Referrer-Policy': 'no-referrer',
		'X-Robots-Tag': 'noindex, nofollow'
	});
	if (!/^[a-f0-9]{48}$/.test(event.params.token)) error(404, 'Подборка не найдена.');
	const [response, rendered] = await Promise.all([
		growthApi(event, `selections/${event.params.token}`),
		loadRenderPage(event, '/')
	]);
	if (!response.ok)
		error(
			response.status === 404 ? 404 : 503,
			response.status === 404
				? 'Подборка недоступна. Ссылка истекла или была закрыта.'
				: 'Не удалось загрузить подборку.'
		);
	const selection = (await response.json()) as Selection;
	return { selection, site: rendered.pageData.site };
};
