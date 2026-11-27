import { error } from '@sveltejs/kit';
import { fetchPublicImage } from '$lib/server/public-image';
import { parsePublicImageSource } from '$lib/utils/public-media';
import type { RequestHandler } from './$types';

const requests = new Map<string, { count: number; until: number }>();

export const GET: RequestHandler = async ({ url, fetch, getClientAddress }) => {
	const source = parsePublicImageSource(url.searchParams.get('url') ?? '');
	if (!source) error(400, 'Недопустимый адрес изображения.');

	const now = Date.now();
	for (const [key, value] of requests) if (value.until <= now) requests.delete(key);
	const address = getClientAddress();
	const quota = requests.get(address) ?? { count: 0, until: now + 60000 };
	if (quota.count >= 30 || (!requests.has(address) && requests.size >= 1000)) {
		error(429, 'Слишком много скачиваний. Повторите через минуту.');
	}
	quota.count++;
	requests.set(address, quota);

	const { blob, type, extension } = await fetchPublicImage(source, fetch);
	return new Response(blob, {
		headers: {
			'Content-Type': type,
			'Content-Disposition': `attachment; filename="kitchen.${extension}"`,
			'Content-Length': String(blob.size),
			'Cache-Control': 'public, max-age=300',
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
