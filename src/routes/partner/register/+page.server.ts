import { authApi, readApiJson } from '$lib/server/admin-api';
import { CLIENT_COOKIE, readSessionProfile } from '$lib/server/client-session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) return { profile: null, application: null, apiError: null };
	try {
		const profile = await readSessionProfile(token);
		if (!profile) return { profile: null, application: null, apiError: null };
		const response = await authApi('/partner/application', {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (!response.ok)
			return {
				profile,
				application: null,
				apiError: 'Не удалось загрузить статус заявки. Обновите страницу.'
			};
		const result = await readApiJson(response);
		return {
			profile,
			application: result.application as Record<string, string> | null,
			apiError: null
		};
	} catch {
		return {
			profile: null,
			application: null,
			apiError: 'Сервис временно недоступен. Обновите страницу.'
		};
	}
};
