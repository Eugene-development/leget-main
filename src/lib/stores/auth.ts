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
	/**
	 * id вошедшего пользователя — известен раньше, чем весь профиль.
	 *
	 * Нужен для проверки владения сайтом (PageRenderer сверяет его с ownerId из
	 * renderPage). `user` приезжает только с ответом /auth/me, а режим
	 * редактирования включается сразу по наличию токена — если бы владение
	 * проверялось по `user.id`, редактор у владельца появлялся бы лишь после
	 * сетевого круга. Поэтому id кэшируется в localStorage рядом с токеном.
	 *
	 * Кэш оптимистичен, но безопасен: подделав его, пользователь получит только
	 * нарисованный интерфейс редактора — все мутации проверяют владение на
	 * сервере (UpsertPageComponent и соседи).
	 */
	userId: number | null;
	isLoading: boolean;
}

const TOKEN_KEY = 'auth_token';
const USER_ID_KEY = 'auth_user_id';

function readCachedUserId(): number | null {
	if (!browser) return null;
	const raw = localStorage.getItem(USER_ID_KEY);
	if (raw === null || raw.trim() === '') return null;
	const id = Number(raw);
	return Number.isFinite(id) ? id : null;
}

/**
 * Кладёт id в кэш. Нераспознанный id стирает старую запись, а не оставляет её:
 * иначе после входа другим пользователем в кэше остался бы id предыдущего.
 */
function cacheUserId(id: unknown): number | null {
	if (!browser) return null;
	const value = typeof id === 'number' || typeof id === 'string' ? Number(id) : Number.NaN;
	if (!Number.isFinite(value)) {
		localStorage.removeItem(USER_ID_KEY);
		return null;
	}
	localStorage.setItem(USER_ID_KEY, String(value));
	return value;
}

function clearSessionStorage(): void {
	if (!browser) return;
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_ID_KEY);
	localStorage.removeItem('email_verified');
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
		return !browser || localStorage.getItem(TOKEN_KEY) !== token;
	}

	/** Проверка идёт один раз на страницу: повторные вызовы ждут тот же запрос. */
	let pendingInit: Promise<void> | null = null;

	return {
		subscribe,

		/** Check token validity against /auth/me and update state */
		async init() {
			if (!browser) return;
			if (pendingInit) return pendingInit;

			const token = localStorage.getItem(TOKEN_KEY);
			if (!token) return;

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
				userId: s.userId ?? readCachedUserId(),
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
						clearSessionStorage();
						set({ isAuthenticated: false, user: null, userId: null, isLoading: false });
						return;
					}

					const data = await response.json();
					if (isStale(token)) return;
					const user = (data.user ?? data) as AuthUser | null;
					set({
						isAuthenticated: true,
						user,
						userId: cacheUserId(user?.id),
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
				localStorage.setItem(TOKEN_KEY, result.token);
			}
			if (result.email_verified !== undefined) {
				localStorage.setItem('email_verified', result.email_verified ? '1' : '0');
			}

			const user = (result.user ?? null) as AuthUser | null;
			set({
				isAuthenticated: true,
				user,
				userId: cacheUserId(user?.id),
				isLoading: false
			});
		},

		/** Clear token and reset state */
		logout() {
			if (browser) {
				clearSessionStorage();
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
