import { redirect } from '@sveltejs/kit';
import { adminAuthApi } from '$lib/server/admin-api';
import type { PageServerLoad } from './$types';

const COOKIE_NAME = 'leget_goals_jwt';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get(COOKIE_NAME);
	if (!token) redirect(303, '/');

	try {
		const response = await adminAuthApi('/auth/me', {
			headers: { Authorization: `Bearer ${token}` }
		});

		if (!response.ok) {
			cookies.delete(COOKIE_NAME, { path: '/goals' });
			redirect(303, '/');
		}
	} catch {
		cookies.delete(COOKIE_NAME, { path: '/goals' });
		redirect(303, '/');
	}

	return {};
};
