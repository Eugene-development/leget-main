import { error, redirect } from '@sveltejs/kit';
import { adminApi } from '$lib/server/admin-api';
import type { EditorItem, Kind } from '$lib/university/admin/types';
import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ cookies, setHeaders }) => {
	const token = cookies.get('leget_admin_jwt');
	if (!token) redirect(303, '/admin');
	setHeaders({ 'cache-control': 'private, no-store' });
	const entries = await Promise.all(
		(['courses', 'interviews', 'resources'] as Kind[]).map(async (kind) => {
			const r = await adminApi(`/admin/university/${kind}`, {
				headers: { Authorization: `Bearer ${token}` }
			}).catch(() => null);
			if (!r) error(503, 'Редактор временно недоступен.');
			if (r.status === 401) redirect(303, '/admin');
			if (!r.ok) error(r.status, 'Не удалось открыть редактор университета.');
			return [kind, (await r.json()).items as EditorItem[]] as const;
		})
	);
	return { catalog: Object.fromEntries(entries) as Record<Kind, EditorItem[]> };
};
