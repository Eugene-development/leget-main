import { env } from '$env/dynamic/private';

function trimSlash(value: string): string {
	return value.replace(/\/$/, '');
}

function authBaseUrl(): string {
	if (env.AUTH_BACKEND_URL) return trimSlash(env.AUTH_BACKEND_URL);
	if (env.RUNTIME_AUTH_API_URL) return `${trimSlash(env.RUNTIME_AUTH_API_URL)}/api`;
	if (env.PUBLIC_AUTH_URL) return `${trimSlash(env.PUBLIC_AUTH_URL)}/api`;

	return 'http://localhost:8000/api';
}

function apiBaseUrl(): string {
	if (env.API_BACKEND_URL) return trimSlash(env.API_BACKEND_URL);
	if (env.LEGET_API_URL) return trimSlash(env.LEGET_API_URL);
	if (env.RUNTIME_API_BASE_URL) return trimSlash(env.RUNTIME_API_BASE_URL);
	if (env.PUBLIC_API_URL) return trimSlash(env.PUBLIC_API_URL);

	return 'http://localhost:8001';
}

/** Серверный запрос к API leget-auth (вход админа, вход и регистрация клиента). */
export async function authApi(path: string, init: RequestInit = {}): Promise<Response> {
	return fetch(`${authBaseUrl()}${path}`, {
		...init,
		headers: {
			Accept: 'application/json',
			...(init.body ? { 'Content-Type': 'application/json' } : {}),
			...init.headers
		}
	});
}

/** Историческое имя authApi — оставлено для маршрута /admin. */
export const adminAuthApi = authApi;

export async function adminApi(path: string, init: RequestInit = {}): Promise<Response> {
	return fetch(`${apiBaseUrl()}${path}`, {
		...init,
		headers: {
			Accept: 'application/json',
			...(init.body ? { 'Content-Type': 'application/json' } : {}),
			...init.headers
		}
	});
}

export async function readApiJson(response: Response): Promise<Record<string, unknown>> {
	try {
		return await response.json();
	} catch {
		return {};
	}
}
