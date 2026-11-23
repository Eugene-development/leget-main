import type { PartnerApplication } from '$lib/partners/types';
import { authApi, readApiJson } from './admin-api';
import { readSessionProfile } from './client-session';

export async function loadPartnerRegistration(token: string | undefined) {
	if (!token) return { profile: null, application: null, apiError: null };
	try {
		const signal = AbortSignal.timeout(5000);
		const profile = await readSessionProfile(token, signal);
		if (!profile) return { profile: null, application: null, apiError: null };
		const response = await authApi('/partner/application', {
			headers: { Authorization: `Bearer ${token}` },
			signal
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
			application: result.application as PartnerApplication | null,
			apiError: null
		};
	} catch {
		return {
			profile: null,
			application: null,
			apiError: 'Сервис временно недоступен. Обновите страницу.'
		};
	}
}
