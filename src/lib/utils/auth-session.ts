/** Browser storage for the separate site-editor session, never cabinet cookies. */
const keys = ['auth_token', 'auth_user_id', 'email_verified'] as const;

function claims(token: string): { exp?: number; remember?: boolean } | null {
	try {
		const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
		return JSON.parse(atob(encoded));
	} catch {
		return null;
	}
}

export function clearAuthSession(): void {
	if (typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') return;
	for (const storage of [localStorage, sessionStorage]) {
		for (const key of keys) storage.removeItem(key);
	}
}

function currentStorage(): Storage | null {
	if (typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') return null;
	for (const storage of [sessionStorage, localStorage]) {
		const token = storage.getItem('auth_token');
		if (!token) continue;
		const payload = claims(token);
		if (!payload || typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) {
			// Another tab may have established a valid remembered session meanwhile.
			for (const key of keys) storage.removeItem(key);
			continue;
		}
		// Old clients persisted every login. Keep those sessions only in the current tab.
		if (storage === localStorage && payload.remember !== true) {
			for (const key of keys) {
				const value = localStorage.getItem(key);
				if (value !== null) sessionStorage.setItem(key, value);
				else sessionStorage.removeItem(key);
				localStorage.removeItem(key);
			}
			return sessionStorage;
		}
		return storage;
	}
	return null;
}

export function getAuthToken(): string | null {
	return currentStorage()?.getItem('auth_token') ?? null;
}

export function getAuthUserId(): number | null {
	const raw = currentStorage()?.getItem('auth_user_id');
	if (!raw?.trim()) return null;
	const id = Number(raw);
	return Number.isFinite(id) ? id : null;
}

export function setAuthUserId(id: unknown): number | null {
	const storage = currentStorage();
	const value = typeof id === 'number' || typeof id === 'string' ? Number(id) : Number.NaN;
	if (!storage || !Number.isFinite(value)) {
		storage?.removeItem('auth_user_id');
		return null;
	}
	storage.setItem('auth_user_id', String(value));
	return value;
}

export function saveAuthSession(result: {
	token: string;
	remember?: boolean;
	email_verified?: boolean;
	user?: { id: number } | null;
}): void {
	clearAuthSession();
	const storage = result.remember === true ? localStorage : sessionStorage;
	storage.setItem('auth_token', result.token);
	if (result.email_verified !== undefined) {
		storage.setItem('email_verified', result.email_verified ? '1' : '0');
	}
	setAuthUserId(result.user?.id);
}
