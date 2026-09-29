import { fail, redirect } from '@sveltejs/kit';
import { adminApi, readApiJson } from '$lib/server/admin-api';
import type { Actions, PageServerLoad } from './$types';
const cookie = 'leget_admin_jwt';
export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = cookies.get(cookie);
	if (!token) redirect(303, '/admin');
	const status = ['pending', 'approved', 'rejected'].includes(url.searchParams.get('status') || '')
		? url.searchParams.get('status')!
		: 'pending';
	const requestedPage = Number(url.searchParams.get('page') || 1);
	const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	try {
		const response = await adminApi(`/admin/partners?status=${status}&page=${page}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (!response.ok)
			return {
				applications: null,
				status,
				apiError:
					response.status === 403
						? 'Доступен только суперадминистратору.'
						: 'Не удалось загрузить заявки.'
			};
		const result = await readApiJson(response);
		return {
			applications: result.applications as {
				data: Record<string, any>[];
				current_page: number;
				last_page: number;
			},
			status,
			apiError: null
		};
	} catch {
		return { applications: null, status, apiError: 'Сервис временно недоступен.' };
	}
};
export const actions: Actions = {
	review: async ({ cookies, request }) => {
		const token = cookies.get(cookie);
		if (!token) redirect(303, '/admin');
		const body = await request.formData();
		const id = String(body.get('id') || '');
		const decision = String(body.get('decision') || '');
		if (!/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(id) || !['approve', 'reject'].includes(decision))
			return fail(422, { error: 'Проверьте выбранную заявку.' });
		try {
			const response = await adminApi(`/admin/partners/${id}/${decision}`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify({ note: String(body.get('note') || '').trim() || null })
			});
			const result = await readApiJson(response);
			if (!response.ok)
				return fail(response.status, {
					error: String(result.message || 'Не удалось сохранить решение.')
				});
			return {
				success:
					decision === 'approve'
						? 'Партнёр подключён.'
						: 'Заявка отклонена, доступ партнёра отозван.'
			};
		} catch {
			return fail(503, { error: 'Сервис недоступен. Повторите действие.' });
		}
	}
};
