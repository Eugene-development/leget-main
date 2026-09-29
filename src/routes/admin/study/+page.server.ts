import { error, fail, redirect } from '@sveltejs/kit';
import { authApi, readApiJson } from '$lib/server/admin-api';
import { readSessionProfile, setClientSession } from '$lib/server/client-session';
import type { Actions, PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('leget_admin_jwt');
	if (!token) redirect(303, '/admin');
	let profile;
	try {
		profile = await readSessionProfile(token);
	} catch {
		error(503, 'Сервис временно недоступен.');
	}
	if (!profile) redirect(303, '/admin');
	if (profile.role !== 'superadmin') error(403, 'Недостаточно прав.');
	return { profile };
};
export const actions: Actions = {
	enroll: async ({ cookies }) => {
		const token = cookies.get('leget_admin_jwt');
		if (!token) redirect(303, '/admin');
		try {
			const profile = await readSessionProfile(token);
			if (profile?.role !== 'superadmin') return fail(403, { error: 'Недостаточно прав.' });
			const response = await authApi('/university/enroll', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: '{}'
			});
			const result = await readApiJson(response);
			if (!response.ok || typeof result.token !== 'string')
				return fail(response.status >= 400 ? response.status : 502, {
					error: 'Не удалось открыть обучение. Повторите попытку.'
				});
			setClientSession(cookies, result.token, result.expires_in);
		} catch {
			return fail(503, { error: 'Сервис недоступен. Повторите попытку.' });
		}
		redirect(303, '/university/student');
	}
};
