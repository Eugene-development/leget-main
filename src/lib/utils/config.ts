/**
 * Runtime configuration helper for LEGET Main
 *
 * PUBLIC_AUTH_URL and PUBLIC_API_URL are exposed to the client via SvelteKit's $env/static/public.
 */

import { PUBLIC_AUTH_URL, PUBLIC_API_URL } from '$env/static/public';

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
