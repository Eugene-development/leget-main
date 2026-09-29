import { error, redirect } from '@sveltejs/kit';
import { adminApi } from '$lib/server/admin-api';
import type { EditorItem, Kind } from '$lib/university/admin/types';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ cookies, params, setHeaders }) => {
	const token = cookies.get('leget_admin_jwt');
	if (!token) redirect(303, '/admin');
	if (!['courses', 'interviews', 'resources'].includes(params.kind)) error(404);
	setHeaders({ 'cache-control': 'private, no-store' });
	const response = await adminApi(`/admin/university/${params.kind}`, {
		headers: { Authorization: `Bearer ${token}` }
	}).catch(() => null);
	if (!response) error(503);
	if (!response.ok) error(response.status);
	const item = ((await response.json()).items as EditorItem[]).find((i) => i.slug === params.slug);
	if (!item) error(404);
	return { item, kind: params.kind as Kind };
};
