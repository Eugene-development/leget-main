import { error } from '@sveltejs/kit';
import { fetchPublicImage } from '$lib/server/public-image';
import { publicMediaSource } from '$lib/utils/public-media';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const source = publicMediaSource(url);
	if (!source) error(404, 'Изображение недоступно.');

	const { blob, type, lastModified } = await fetchPublicImage(source, fetch);
	return new Response(blob, {
		headers: {
			'Content-Type': type,
			'Content-Length': String(blob.size),
			...(lastModified ? { 'Last-Modified': lastModified } : {}),
			'Cache-Control': 'public, max-age=300',
			'Content-Security-Policy': "default-src 'none'; sandbox",
			'X-Content-Type-Options': 'nosniff'
		}
	});
};
