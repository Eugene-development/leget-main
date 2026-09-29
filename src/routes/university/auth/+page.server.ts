import { error, redirect } from '@sveltejs/kit';
import { CLIENT_COOKIE, readSessionProfile, clearClientSession } from '$lib/server/client-session';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get(CLIENT_COOKIE);
	if (!token) return { profile: null };
	let profile;
	try {
		profile = await readSessionProfile(token);
	} catch {
		error(503, 'Не удалось загрузить аккаунт. Обновите страницу.');
	}
	if (!profile) {
		clearClientSession(cookies);
		return { profile: null };
	}
	if (profile.role === 'student' || profile.roles?.includes('student'))
		redirect(303, '/university/student');
	return { profile };
};
