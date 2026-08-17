import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getAuthApiUrl } from '$lib/utils/config';

export interface AuthUser {
	id: number;
	name: string;
	email: string;
}

interface AuthState {
	isAuthenticated: boolean;
	user: AuthUser | null;
	isLoading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		isAuthenticated: false,
		user: null,
		isLoading: false
	});

	/**
	 * Ответ /auth/me актуален, только пока в хранилище лежит тот же токен, с
	 * которым ушёл запрос. Если пользователь успел войти заново (login() кладёт
	 * новый токен), ответ на старый — уже мусор: применив его, мы сбрасывали
	 * свежий вход, стирали новый токен и гасили режим редактирования.
	 */
	function isStale(token: string): boolean {
		return !browser || localStorage.getItem('auth_token') !== token;
	}

	/** Проверка идёт один раз на страницу: повторные вызовы ждут тот же запрос. */
	let pendingInit: Promise<void> | null = null;

	return {
		subscribe,

		/** Check token validity against /auth/me and update state */
		async init() {
			if (!browser) return;
			if (pendingInit) return pendingInit;

			const token = localStorage.getItem('auth_token');
			if (!token) return;

			// Токен есть — считаем сессию активной сразу, не дожидаясь ответа.
			// Иначе редактор включался только после сетевого запроса: на живом
			// сайте это заметная задержка при каждой загрузке страницы. Проверка
			// идёт следом и снимает флаг, если токен оказался недействителен.
			// Гостю это ничего не показывает: без токена ветка не выполняется.
			update((s) => ({ ...s, isAuthenticated: true, isLoading: true }));

			pendingInit = (async () => {
				try {
					const authApiUrl = getAuthApiUrl();
					const response = await fetch(`${authApiUrl}/auth/me`, {
						method: 'GET',
						headers: {
							Accept: 'application/json',
							Authorization: `Bearer ${token}`
						}
					});

					if (isStale(token)) return;

					if (!response.ok) {
						localStorage.removeItem('auth_token');
						localStorage.removeItem('email_verified');
						set({ isAuthenticated: false, user: null, isLoading: false });
						return;
					}

					const data = await response.json();
					if (isStale(token)) return;
					set({ isAuthenticated: true, user: data.user ?? data, isLoading: false });
				} catch {
					// Сеть не ответила — токен не трогаем (может быть исправен),
					// но режим редактирования не оставляем включённым вслепую.
					if (isStale(token)) return;
					set({ isAuthenticated: false, user: null, isLoading: false });
				} finally {
					pendingInit = null;
				}
			})();

			return pendingInit;
		},

		/** Login with email/password, store token on success */
		async login(
			email: string,
			password: string,
			captchaToken: string | null = null
		): Promise<void> {
			const authApiUrl = getAuthApiUrl();
			const response = await fetch(`${authApiUrl}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({
					email: email.trim().toLowerCase(),
					password,
					captcha_token: captchaToken
				})
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				// При непройденной капче у бэкенда есть более понятное сообщение в errors.
				const captchaErr = result?.errors?.captcha_token?.[0];
				throw new Error(captchaErr || result.message || 'Ошибка входа');
			}

			if (result.token) {
				localStorage.setItem('auth_token', result.token);
			}
			if (result.email_verified !== undefined) {
				localStorage.setItem('email_verified', result.email_verified ? '1' : '0');
			}

			set({ isAuthenticated: true, user: result.user ?? null, isLoading: false });
		},

		/** Clear token and reset state */
		logout() {
			if (browser) {
				localStorage.removeItem('auth_token');
				localStorage.removeItem('email_verified');
				// Сессия карты целей хранится в отдельной httpOnly-cookie, поэтому
				// клиент не может удалить её напрямую. Endpoint завершает её вместе
				// с общей пользовательской сессией; ошибка сети не блокирует выход.
				void fetch('/goals/session', { method: 'DELETE' }).catch(() => undefined);
				void fetch('/site-settings/session', { method: 'DELETE' }).catch(() => undefined);
			}
			set({ isAuthenticated: false, user: null, isLoading: false });
		}
	};
}

export const auth = createAuthStore();
