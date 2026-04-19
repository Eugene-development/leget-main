/**
 * Runtime configuration helper for LEGET Main
 *
 * PUBLIC_AUTH_URL is exposed to the client via SvelteKit's $env/static/public.
 */

import { PUBLIC_AUTH_URL } from '$env/static/public';

/**
 * @returns Auth API base URL (e.g. https://auth.leget.ru/api)
 */
export function getAuthApiUrl(): string {
	return (PUBLIC_AUTH_URL || 'http://localhost:8000') + '/api';
}
