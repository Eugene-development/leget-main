import { dev } from '$app/environment';
import type { Cookies } from '@sveltejs/kit';
import { authApi, readApiJson } from '$lib/server/admin-api';

/**
 * Сессия клиента (роль «Клиент») в leget-main.
 *
 * JWT лежит в httpOnly-cookie и браузеру не отдаётся. Это не только защита от
 * XSS: режим редактирования сайта включается по токену в localStorage
 * (`$lib/stores/auth`), поэтому клиентский токен туда попасть НЕ должен —
 * иначе любой зарегистрировавшийся посетитель получил бы интерфейс владельца.
 *
 * Область cookie — весь сайт (`/`), а не `/cabinet`: кнопки входа и ссылка на
 * кабинет живут в баннере на каждой странице, и без cookie на `/` шапка не
 * знала бы, вошёл ли пользователь. Админская сессия остаётся отдельной cookie
 * с областью `/admin` — пересечься они не могут.
 */
export const CLIENT_COOKIE = 'leget_client_jwt';

/** Заявка, вынутая из JWT без проверки подписи — только для отрисовки шапки. */
export interface ClientDisplay {
	name: string;
	email: string;
}

export interface ClientProfile {
	id: number;
	name: string;
	email: string;
	phone: string | null;
	region: string | null;
	email_verified: boolean;
	role: string;
	created_at: string | null;
}

export function setClientSession(cookies: Cookies, token: string, expiresIn: unknown): void {
	cookies.set(CLIENT_COOKIE, token, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		// lax, а не strict: на кабинет приходят по обычной ссылке из письма или
		// закладки, и strict оставил бы такой переход без cookie — гость.
		sameSite: 'lax',
		maxAge: typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : 3_600
	});
}

export function clearClientSession(cookies: Cookies): void {
	cookies.delete(CLIENT_COOKIE, { path: '/' });
}

/**
 * Имя и email из payload токена — без сетевого запроса и без проверки подписи.
 *
 * Этого достаточно, чтобы шапка отрисовала «Личный кабинет» вместо «Войти» уже
 * в SSR. Подделанная cookie даст только неверную надпись в шапке: страница
 * кабинета всё равно спрашивает leget-auth (`readClientProfile`), а он проверяет
 * подпись и роль.
 */
export function decodeClientDisplay(token: string | undefined): ClientDisplay | null {
	if (!token) return null;

	const payload = token.split('.')[1];
	if (!payload) return null;

	try {
		const json = JSON.parse(
			Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
		) as Record<string, unknown>;

		if (typeof json.exp === 'number' && json.exp * 1000 <= Date.now()) return null;

		const email = typeof json.email === 'string' ? json.email : '';
		if (!email) return null;

		return { name: typeof json.name === 'string' && json.name ? json.name : email, email };
	} catch {
		return null;
	}
}

/**
 * Профиль клиента из leget-auth. `null` — токена нет, он недействителен или
 * принадлежит администратору (403 от EnsureClientAccess).
 */
export async function readClientProfile(token: string): Promise<ClientProfile | null> {
	const response = await authApi('/client/me', {
		headers: { Authorization: `Bearer ${token}` }
	});

	if (!response.ok) return null;

	const result = await readApiJson(response);
	const user = result.user;

	return user && typeof user === 'object' ? (user as ClientProfile) : null;
}
