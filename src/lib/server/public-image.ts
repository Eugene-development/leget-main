import { error } from '@sveltejs/kit';

const MAX_BYTES = 20 * 1024 * 1024;
const imageTypes = new Map([
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
	['image/webp', 'webp'],
	['image/avif', 'avif'],
	['image/gif', 'gif']
]);

export async function fetchPublicImage(source: URL, fetchImage: typeof fetch) {
	let image: Response;
	try {
		image = await fetchImage(source.href, {
			redirect: 'error',
			credentials: 'omit',
			signal: AbortSignal.timeout(15000)
		});
	} catch {
		error(502, 'Не удалось загрузить изображение.');
	}
	const type = image.headers.get('content-type')?.split(';')[0].trim() ?? '';
	const extension = imageTypes.get(type);
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
	return { blob: new Blob(chunks as BlobPart[], { type }), type, extension };
}
