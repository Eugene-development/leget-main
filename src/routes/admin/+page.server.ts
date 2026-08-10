import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { fail } from '@sveltejs/kit';
import { adminApi, adminAuthApi, readApiJson } from '$lib/server/admin-api';
import type { Actions, PageServerLoad } from './$types';

const COOKIE_NAME = 'leget_admin_jwt';

function adminEmails(): string[] {
	return (env.LEGET_ADMIN_EMAILS ?? '')
		.split(',')
		.map((email) => email.trim().toLowerCase())
		.filter(Boolean);
}

function isAdminEmail(email: string): boolean {
	return adminEmails().includes(email.trim().toLowerCase());
}

function bearer(token: string): HeadersInit {
	return { Authorization: `Bearer ${token}` };
}

function safePage(value: string | null): number {
	const page = Number.parseInt(value ?? '1', 10);
	return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = cookies.get(COOKIE_NAME);
	if (!token) {
		return { authenticated: false, conversions: null, summary: null };
	}

	try {
		const response = await adminApi(
			`/admin/conversions?page=${safePage(url.searchParams.get('page'))}&per_page=50`,
			{
				headers: bearer(token)
			}
		);
		const result = await readApiJson(response);

		if (response.status === 401 || response.status === 403) {
			cookies.delete(COOKIE_NAME, { path: '/admin' });
			return { authenticated: false, conversions: null, summary: null, sessionExpired: true };
		}

		if (!response.ok) {
			return {
				authenticated: true,
				conversions: null,
				summary: null,
				apiError:
					typeof result.message === 'string' ? result.message : 'Не удалось загрузить конверсии.'
			};
		}

		return {
			authenticated: true,
			conversions: result.conversions ?? null,
			summary: result.summary ?? null
		};
	} catch {
		return {
			authenticated: true,
			conversions: null,
			summary: null,
			apiError: 'Сервис конверсий временно недоступен.'
		};
	}
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(formData.get('password') ?? '');

		if (!email || !password) {
			return fail(422, { action: 'login', message: 'Введите email и пароль.', email });
		}

		if (!isAdminEmail(email)) {
			return fail(401, {
				action: 'login',
				message: 'Неверные учётные данные или недостаточно прав.',
				email
			});
		}

		try {
			const response = await adminAuthApi('/admin/login', {
				method: 'POST',
				body: JSON.stringify({ email, password })
			});
			const result = await readApiJson(response);

			if (!response.ok || typeof result.token !== 'string') {
				return fail(response.status >= 400 ? response.status : 401, {
					action: 'login',
					message:
						typeof result.message === 'string'
							? result.message
							: 'Неверные учётные данные или недостаточно прав.',
					email
				});
			}

			cookies.set(COOKIE_NAME, result.token, {
				path: '/admin',
				httpOnly: true,
				secure: !dev,
				sameSite: 'strict',
				maxAge: typeof result.expires_in === 'number' ? result.expires_in : 3_600
			});

			return { action: 'login', success: true };
		} catch {
			return fail(503, {
				action: 'login',
				message: 'Сервис авторизации временно недоступен.',
				email
			});
		}
	},

	logout: async ({ cookies }) => {
		cookies.delete(COOKIE_NAME, { path: '/admin' });
		return { action: 'logout', success: true };
	},

	createOffline: async ({ request, cookies }) => {
		const token = cookies.get(COOKIE_NAME);
		if (!token) {
			return fail(401, { action: 'createOffline', message: 'Сессия истекла. Войдите снова.' });
		}

		const formData = await request.formData();
		const values = {
			offline_type: String(formData.get('offline_type') ?? '').trim(),
			name: String(formData.get('name') ?? '').trim(),
			contact: String(formData.get('contact') ?? '').trim(),
			ad_id: String(formData.get('ad_id') ?? '').trim() || null,
			comment: String(formData.get('comment') ?? '').trim() || null
		};

		try {
			const response = await adminApi('/admin/conversions', {
				method: 'POST',
				headers: bearer(token),
				body: JSON.stringify(values)
			});
			const result = await readApiJson(response);

			if (response.status === 401 || response.status === 403) {
				cookies.delete(COOKIE_NAME, { path: '/admin' });
				return fail(401, { action: 'createOffline', message: 'Сессия истекла. Войдите снова.' });
			}

			if (!response.ok) {
				return fail(response.status, {
					action: 'createOffline',
					message:
						typeof result.message === 'string' ? result.message : 'Не удалось добавить конверсию.',
					values
				});
			}

			return {
				action: 'createOffline',
				success: true,
				message: typeof result.message === 'string' ? result.message : 'Офлайн-конверсия добавлена.'
			};
		} catch {
			return fail(503, {
				action: 'createOffline',
				message: 'Сервис конверсий временно недоступен.',
				values
			});
		}
	}
};
