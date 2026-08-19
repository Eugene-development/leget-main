import type { Handle } from '@sveltejs/kit';
import { BASE_SLUG } from '$lib/design-systems/registry';

/**
 * Открывающий тег `<html>` в app.html с дефолтным слагом — то, что подменяем.
 *
 * Якорь — весь тег, а не голый `data-ds="base"`: ведущий комментарий app.html
 * уходит в браузер и стоит ВЫШЕ тега, поэтому подмена по одному атрибуту
 * перехватилась бы литералом-двойником из комментария. `lang="ru" data-ds="base"`
 * встречается в документе ровно раз — в самом теге.
 */
const HTML_TAG_DEFAULT = `<html lang="ru" data-ds="${BASE_SLUG}"`;

// The hook no longer fetches page data. Each page's +page.server.ts
// is responsible for fetching its own data — this ensures client-side
// navigation always gets fresh content for the correct slug.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		/**
		 * Подстановка выбранной дизайн-системы в `<html data-ds="…">`.
		 *
		 * Почему здесь, а не в компоненте: токены объявлены на `:root[data-ds=…]`,
		 * то есть атрибут обязан стоять на корневом элементе документа. Перенести
		 * его на обёртку рендера (как сделано с `siteAppearance`) нельзя — селектор
		 * перестал бы совпадать, а `[data-ds=…]` без `:root` имеет специфичность
		 * (0,1,0) и уже не перебивает Базовую, объявленную на голом `:root`.
		 * Порядок склейки CSS решал бы, какая палитра победит.
		 *
		 * Почему не в самом хуке резолвится сайт: хук данных страницы не грузит
		 * (см. комментарий выше). Slug кладёт в `locals` серверная загрузка
		 * страницы, а она отрабатывает до рендера — к моменту первого чанка
		 * значение уже на месте.
		 *
		 * Замена строковая и якорится на весь открывающий тег `<html>` (см.
		 * HTML_TAG_DEFAULT): `String.replace` подменяет первое вхождение, а тег
		 * с `lang="ru" data-ds="base"` в документе один. Контент страницы или
		 * комментарий, случайно содержащий `data-ds="base"`, не перехватит подмену.
		 */
		transformPageChunk: ({ html }) => {
			const slug = event.locals.designSystem;
			if (!slug || slug === BASE_SLUG) return html;

			return html.replace(HTML_TAG_DEFAULT, `<html lang="ru" data-ds="${slug}"`);
		}
	});

	// Allow cross-origin resources (e.g. images from Yandex Cloud Storage)
	// to be used with backdrop-filter/CSS effects in the browser.
	// Without this header, some browsers block blur() over cross-origin images.
	//
	// Applied only to static asset responses — NOT to the HTML document.
	// Setting CORP on the HTML doc triggers extra preflight/no-cors checks in
	// some browsers and keeps the tab spinner spinning after the page renders.
	const contentType = response.headers.get('content-type') ?? '';
	const isDocument = contentType.startsWith('text/html');
	if (!isDocument) {
		response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
	}

	return response;
};
