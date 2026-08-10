import { error, redirect } from '@sveltejs/kit';
import { adminApi, readApiJson } from '$lib/server/admin-api';
import type { RequestHandler } from './$types';

const COOKIE_NAME = 'leget_admin_jwt';
const PERIODS = new Set(['day', 'week', 'month', 'quarter', 'year']);

function isIsoDate(value: string | null): value is string {
	return value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function disposition(filename: string): string {
	return `attachment; filename="${filename}"`;
}

export const GET: RequestHandler = async ({ cookies, url }) => {
	const period = url.searchParams.get('period');
	const date = url.searchParams.get('date');

	if (!period || !PERIODS.has(period) || !isIsoDate(date)) {
		error(400, 'Укажите корректные период и дату выгрузки.');
	}

	const token = cookies.get(COOKIE_NAME);
	if (!token) {
		redirect(303, '/admin');
	}

	let response: Response;
	try {
		response = await adminApi(
			`/admin/conversions/offline/export?period=${encodeURIComponent(period)}&date=${encodeURIComponent(date)}`,
			{ headers: { Accept: 'text/csv', Authorization: `Bearer ${token}` } }
		);
	} catch {
		error(503, 'Сервис конверсий временно недоступен.');
	}

	if (response.status === 401 || response.status === 403) {
		cookies.delete(COOKIE_NAME, { path: '/admin' });
		redirect(303, '/admin');
	}

	if (!response.ok) {
		const result = await readApiJson(response);
		error(
			response.status,
			typeof result.message === 'string' ? result.message : 'Не удалось сформировать выгрузку.'
		);
	}

	const filename = `yandex-offline-conversions-${period}-${date}.csv`;
	return new Response(response.body, {
		headers: {
			'Content-Type': response.headers.get('content-type') || 'text/csv; charset=UTF-8',
			'Content-Disposition': response.headers.get('content-disposition') || disposition(filename),
			'Cache-Control': 'private, no-store, max-age=0',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
