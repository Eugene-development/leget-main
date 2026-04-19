import type { Handle } from '@sveltejs/kit';

// The hook no longer fetches page data. Each page's +page.server.ts
// is responsible for fetching its own data — this ensures client-side
// navigation always gets fresh content for the correct slug.
export const handle: Handle = async ({ event, resolve }) => {
	return resolve(event);
};
