// See https://svelte.dev/docs/kit/types#app.d.ts

import type { RenderPageResponse } from '$lib/server/render-page';

declare global {
	namespace App {
		interface Locals {
			/**
			 * Дизайн-система, которой рендерится ЭТОТ запрос — slug, уже проверенный
			 * по фронтовому реестру. Кладёт `loadRenderPage()`, читает
			 * `transformPageChunk` в hooks.server.ts и ставит атрибутом `data-ds`
			 * на `<html>`.
			 *
			 * Через locals, а не через данные страницы, по механической причине:
			 * `data-ds` обязан стоять на корневом элементе документа (токены объявлены
			 * на `:root[data-ds=…]`), а app.html компонентам недоступен. Служебные
			 * маршруты — настройки, админка, каталог `/_ds` — сайт не грузят и поле
			 * не ставят; там остаётся Базовая из app.html.
			 */
			designSystem?: string;
		}

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
