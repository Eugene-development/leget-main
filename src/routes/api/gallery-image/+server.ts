import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MAX_BYTES = 20 * 1024 * 1024;
const imageTypes: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
	'image/avif': 'avif',
	'image/gif': 'gif'
};
const requests = new Map<string, { count: number; until: number }>();

export const GET: RequestHandler = async ({ url, fetch, getClientAddress }) => {
	let source: URL;
	try {
		source = new URL(url.searchParams.get('url') ?? '');
	} catch {
		error(400, 'Некорректный адрес изображения.');
	}
	// Only public site media. Never forward credentials, signed URLs or redirects.
	if (
		source.protocol !== 'https:' ||
		source.hostname !== 'storage.yandexcloud.net' ||
		source.port ||
		source.username ||
		source.password ||
		source.search ||
		source.hash ||
		!/^\/(leget-main|zovtop)\/.+/.test(source.pathname)
	)
		error(400, 'Недопустимый адрес изображения.');

	const now = Date.now();
	for (const [key, value] of requests) if (value.until <= now) requests.delete(key);
	const address = getClientAddress();
	const quota = requests.get(address) ?? { count: 0, until: now + 60000 };
	if (quota.count >= 30 || (!requests.has(address) && requests.size >= 1000)) {
		error(429, 'Слишком много скачиваний. Повторите через минуту.');
	}
	quota.count++;
	requests.set(address, quota);

	let image: Response;
	try {
		image = await fetch(source.href, {
			redirect: 'error',
			credentials: 'omit',
			signal: AbortSignal.timeout(15000)
		});
	} catch {
		error(502, 'Не удалось загрузить изображение.');
	}
	const type = image.headers.get('content-type')?.split(';')[0].trim() ?? '';
	const extension = imageTypes[type];
	if (!image.ok || !extension || !image.body) {
		await image.body?.cancel();
		error(502, 'Изображение недоступно.');
	}
	if (Number(image.headers.get('content-length')) > MAX_BYTES) {
		await image.body.cancel();
		error(413, 'Изображение слишком большое.');
	}
	// Enforce the limit even when the upstream omits Content-Length.
	const reader = image.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > MAX_BYTES) {
				await reader.cancel();
				error(413, 'Изображение слишком большое.');
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}
	return new Response(new Blob(chunks as BlobPart[], { type }), {
		headers: {
			'Content-Type': type,
			'Content-Disposition': `attachment; filename="kitchen.${extension}"`,
			'Content-Length': String(size),
			'Cache-Control': 'public, max-age=300',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
