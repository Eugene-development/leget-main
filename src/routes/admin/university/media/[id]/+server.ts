import { error, redirect } from '@sveltejs/kit';
import { adminApi } from '$lib/server/admin-api';
import type { RequestHandler } from './$types';
export const GET: RequestHandler = async ({ cookies, params, setHeaders }) => {
	const token = cookies.get('leget_admin_jwt');
	if (!token) error(401);
	const response = await adminApi(`/admin/university/media/${encodeURIComponent(params.id)}`, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!response) error(503);
	if (!response.ok) error(response.status);
	const data = await response.json();
	setHeaders({ 'cache-control': 'private, no-store', 'referrer-policy': 'no-referrer' });
	redirect(302, data.url);
};
