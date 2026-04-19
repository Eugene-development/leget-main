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

	return {
		subscribe,

		/** Check token validity against /auth/me and update state */
		async init() {
			if (!browser) return;

			const token = localStorage.getItem('auth_token');
			if (!token) return;

			update((s) => ({ ...s, isLoading: true }));

			try {
				const authApiUrl = getAuthApiUrl();
				const response = await fetch(`${authApiUrl}/auth/me`, {
					method: 'GET',
					headers: {
						Accept: 'application/json',
						Authorization: `Bearer ${token}`
					}
				});

				if (!response.ok) {
					localStorage.removeItem('auth_token');
					localStorage.removeItem('email_verified');
					set({ isAuthenticated: false, user: null, isLoading: false });
					return;
				}

				const data = await response.json();
				set({ isAuthenticated: true, user: data.user ?? data, isLoading: false });
			} catch {
				set({ isAuthenticated: false, user: null, isLoading: false });
			}
		},

		/** Login with email/password, store token on success */
		async login(email: string, password: string): Promise<void> {
			const authApiUrl = getAuthApiUrl();
			const response = await fetch(`${authApiUrl}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify({ email: email.trim().toLowerCase(), password })
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || 'Ошибка входа');
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
			}
			set({ isAuthenticated: false, user: null, isLoading: false });
		}
	};
}

export const auth = createAuthStore();
