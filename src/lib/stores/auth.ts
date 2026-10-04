import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getAuthApiUrl } from '$lib/utils/config';
import {
	clearAuthSession,
	getAuthToken,
	getAuthUserId,
	saveAuthSession,
	setAuthUserId
} from '$lib/utils/auth-session';

export interface AuthUser {
	id: number;
	name: string;
	email: string;
}

interface AuthState {
	isAuthenticated: boolean;
	user: AuthUser | null;
	/**
	 * id вошедшего пользователя — известен раньше, чем весь профиль.
	 *
	 * Нужен для проверки владения сайтом (PageRenderer сверяет его с ownerId из
	 * renderPage). `user` приезжает только с ответом /auth/me, а режим
	 * редактирования включается сразу по наличию токена — если бы владение
	 * проверялось по `user.id`, редактор у владельца появлялся бы лишь после
	 * сетевого круга. Поэтому id кэшируется в выбранном хранилище рядом с токеном.
	 *
	 * Кэш оптимистичен, но безопасен: подделав его, пользователь получит только
	 * нарисованный интерфейс редактора — все мутации проверяют владение на
	 * сервере (UpsertPageComponent и соседи).
	 */
	userId: number | null;
	isLoading: boolean;
}

function createAuthStore() {
	const { subscribe, set, update } = writable<AuthState>({
		isAuthenticated: false,
		user: null,
		userId: null,
		isLoading: false
	});

	/**
	 * Ответ /auth/me актуален, только пока в хранилище лежит тот же токен, с
	 * которым ушёл запрос. Если пользователь успел войти заново (login() кладёт
	 * новый токен), ответ на старый — уже мусор: применив его, мы сбрасывали
	 * свежий вход, стирали новый токен и гасили режим редактирования.
	 */
	function isStale(token: string): boolean {
		if (!browser) return true;
		const current = getAuthToken();
		if (!current) set({ isAuthenticated: false, user: null, userId: null, isLoading: false });
		else if (current !== token) {
			// A cross-tab login can replace an expired temporary session. Do not leave
			// its optimistic identity active; an already accepted new login stays intact.
			update((state) =>
				state.isLoading
					? { isAuthenticated: false, user: null, userId: null, isLoading: false }
					: state
			);
		}
		return current !== token;
	}

	/** Проверка идёт один раз на страницу: повторные вызовы ждут тот же запрос. */
	let pendingInit: Promise<void> | null = null;

	return {
		subscribe,
		acceptLogin(result: {
			token: string;
			user: AuthUser;
			email_verified: boolean;
			remember?: boolean;
		}) {
			saveAuthSession(result);
			set({
				isAuthenticated: true,
				user: result.user,
				userId: setAuthUserId(result.user.id),
				isLoading: false
			});
		},

		/** Check token validity against /auth/me and update state */
		async init() {
			if (!browser) return;
			if (pendingInit) return pendingInit;

			const token = getAuthToken();
			if (!token) {
				set({ isAuthenticated: false, user: null, userId: null, isLoading: false });
				return;
			}

			// Токен есть — считаем сессию активной сразу, не дожидаясь ответа.
			// Иначе редактор включался только после сетевого запроса: на живом
			// сайте это заметная задержка при каждой загрузке страницы. Проверка
			// идёт следом и снимает флаг, если токен оказался недействителен.
			// Гостю это ничего не показывает: без токена ветка не выполняется.
			// Вместе с флагом сессии поднимаем и кэшированный id: владение сайтом
			// проверяется на клиенте, и без id редактор у владельца ждал бы /auth/me.
			// Пустой кэш (вход был до появления ключа) не страшен — id приедет
			// ответом ниже; до тех пор режим редактирования просто выключен.
			update((s) => ({
				...s,
				isAuthenticated: true,
				userId: s.userId ?? getAuthUserId(),
				isLoading: true
			}));

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
						clearAuthSession();
						set({ isAuthenticated: false, user: null, userId: null, isLoading: false });
						return;
					}

					const data = await response.json();
					if (isStale(token)) return;
					const user = (data.user ?? data) as AuthUser | null;
					set({
						isAuthenticated: true,
						user,
						userId: setAuthUserId(user?.id),
						isLoading: false
					});
				} catch {
					// Сеть не ответила — токен не трогаем (может быть исправен),
					// но режим редактирования не оставляем включённым вслепую.
					if (isStale(token)) return;
					set({ isAuthenticated: false, user: null, userId: null, isLoading: false });
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
			captchaToken: string | null = null,
			remember = false
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
					captcha_token: captchaToken,
					remember
				})
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				// При непройденной капче у бэкенда есть более понятное сообщение в errors.
				const captchaErr = result?.errors?.captcha_token?.[0];
				throw new Error(captchaErr || result.message || 'Ошибка входа');
			}

			if (!result.token) throw new Error('Сервер не вернул сессию. Повторите вход.');
			saveAuthSession(result);

			const user = (result.user ?? null) as AuthUser | null;
			set({
				isAuthenticated: true,
				user,
				userId: setAuthUserId(user?.id),
				isLoading: false
			});
		},

		/** Clear token and reset state */
		logout() {
			if (browser) {
				clearAuthSession();
				// Сессия карты целей хранится в отдельной httpOnly-cookie, поэтому
				// клиент не может удалить её напрямую. Endpoint завершает её вместе
				// с общей пользовательской сессией; ошибка сети не блокирует выход.
				void fetch('/goals/session', { method: 'DELETE' }).catch(() => undefined);
				void fetch('/site-settings/session', { method: 'DELETE' }).catch(() => undefined);
			}
			set({ isAuthenticated: false, user: null, userId: null, isLoading: false });
		}
	};
}

export const auth = createAuthStore();
