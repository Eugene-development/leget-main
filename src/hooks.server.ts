import type { Handle } from '@sveltejs/kit';

// The hook no longer fetches page data. Each page's +page.server.ts
// is responsible for fetching its own data — this ensures client-side
// navigation always gets fresh content for the correct slug.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Allow cross-origin resources (e.g. images from Yandex Cloud Storage)
	// to be used with backdrop-filter/CSS effects in the browser.
	// Without this header, some browsers block blur() over cross-origin images.
	response.headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

	return response;
};
