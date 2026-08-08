// See https://svelte.dev/docs/kit/types#app.d.ts

import type { RenderPageResponse } from '$lib/server/render-page';

declare global {
	namespace App {
		interface Locals {}

		interface Error {
			message: string;
			/**
			 * Данные страницы 404 шаблона: сервер кладёт их в тело ошибки, чтобы
			 * +error.svelte отрисовал фирменную страницу, а не заглушку. Есть
			 * только у 404 и только если шаблон объявил страницу '/404'.
			 */
			pageData?: {
				site: RenderPageResponse['renderPage']['site'];
				page: RenderPageResponse['renderPage']['page'];
			} | null;
		}
	}
}

export {};
