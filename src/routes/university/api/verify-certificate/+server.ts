import { json } from '@sveltejs/kit';
import { createHmac } from 'node:crypto';
import { env } from '$env/dynamic/private';
import { authApi } from '$lib/server/admin-api';
import type { RequestHandler } from './$types';

const headers = { 'cache-control': 'private, no-store' };
export const POST: RequestHandler = async ({ request, url, getClientAddress }) => {
	if (request.headers.get('origin') !== url.origin)
		return json({ message: 'Недопустимый источник запроса.' }, { status: 403, headers });
	let id: string;
	try {
		const body = await request.json();
		if (typeof body?.certificate_id !== 'string') throw new Error();
		id = body.certificate_id.trim().toLowerCase();
		if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id))
			throw new Error();
	} catch {
		return json({ message: 'Введите полный ID записи из сертификата.' }, { status: 422, headers });
	}
	try {
		const secret = env.FORM_CONTEXT_SECRET;
		if (!secret || secret.length < 32) throw new Error('Missing gateway configuration');
		const context = Buffer.from(
			JSON.stringify({
				purpose: 'university-verification',
				timestamp: Math.floor(Date.now() / 1000),
				client_ip: getClientAddress(),
				certificate_id: id
			})
		).toString('base64url');
		const signature = createHmac('sha256', secret).update(context).digest('hex');
		// A public lookup deliberately carries no session token and never changes a session.
		const response = await authApi('/university/verify-certificate', {
			method: 'POST',
			headers: { 'X-Leget-University-Context': `${context}.${signature}` },
			body: JSON.stringify({ certificate_id: id }),
			signal: AbortSignal.timeout(10_000)
		});
		if (response.status === 429)
			return json(
				{ message: 'Слишком много проверок. Попробуйте позже.' },
				{
					status: 429,
					headers: { ...headers, 'retry-after': response.headers.get('retry-after') ?? '60' }
				}
			);
		if (response.status === 404)
			return json(
				{ message: 'Сертификат с таким ID не найден. Проверьте номер записи.' },
				{ status: 404, headers }
			);
		if (response.status === 422)
			return json(
				{ message: 'Введите полный ID записи из сертификата.' },
				{ status: 422, headers }
			);
		if (!response.ok) throw new Error();
		const data = await response.json();
		return json(data, { headers });
	} catch {
		return json(
			{ message: 'Проверка временно недоступна. Попробуйте ещё раз.' },
			{ status: 503, headers }
		);
	}
};
