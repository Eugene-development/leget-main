import type { Handle } from '@sveltejs/kit';

// The hook no longer fetches page data. Each page's +page.server.ts
// is responsible for fetching its own data — this ensures client-side
// navigation always gets fresh content for the correct slug.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

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
