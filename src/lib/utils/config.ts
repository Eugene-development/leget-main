/**
 * Runtime configuration helper for LEGET Main
 *
 * PUBLIC_AUTH_URL and PUBLIC_API_URL are exposed to the client via SvelteKit's $env/static/public.
 */

import { PUBLIC_AUTH_URL, PUBLIC_API_URL } from '$env/static/public';
import { env } from '$env/dynamic/public';

/**
 * @returns Auth API base URL (e.g. https://auth.leget.ru/api)
 */
export function getAuthApiUrl(): string {
	return (PUBLIC_AUTH_URL || 'http://localhost:8000') + '/api';
}

/**
 * @returns GraphQL API URL (e.g. https://api.leget.ru/graphql)
 */
export function getGraphQLUrl(): string {
	return (PUBLIC_API_URL || 'http://localhost:8001') + '/graphql';
}

/** All account roles recover their password on the central LEGET frontend. */
export function getPasswordRecoveryUrl(): string {
	return new URL('/forgot-password', env.PUBLIC_FRONTEND_URL || 'https://leget.ru').href;
}
