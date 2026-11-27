import { templateMediaAliases } from './template-media-aliases';

const storageOrigin = 'https://storage.yandexcloud.net';
const thumbnailOrigin = 'https://avatars.mds.yandex.net';
const thumbnailPath = '/media/yandex-thumbs/';
const thumbnailId = /^[a-f0-9]{40}-[0-9]+-images-thumbs$/;
const publicMediaPrefix = '/media/';
const imageExtension = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i;
const storagePath = /^\/(leget-main|novostroy|zovrus|zovtop)\/.+/;
const partnerImages = new Map([
	['/media/partners/zov.png', `${storageOrigin}/leget-main/templates/promo-1/brands/zov.png`],
	['/media/partners/aristo.png', `${storageOrigin}/leget-main/templates/promo-1/brands/aristo.png`]
]);
const legacyPartnerUrls = new Map([
	['https://zov.com.by/images/logo3.png', partnerImages.get('/media/partners/zov.png')!],
	['https://www.aristo.ru/include/logo_header.png', partnerImages.get('/media/partners/aristo.png')!]
]);

function parseImageUrl(value: string): URL | null {
	try {
		const source = new URL(value);
		return source.username || source.password || source.hash ? null : source;
	} catch {
		return null;
	}
}

function isPublicStorageObject(source: URL): boolean {
	return source.origin === storageOrigin && !source.search && storagePath.test(source.pathname);
}

export function parsePublicImageSource(value: string): URL | null {
	const source = parseImageUrl(value);
	return source && isPublicStorageObject(source) ? source : null;
}

export function publicMediaUrl<T extends string | null | undefined>(value: T): T | string {
	if (!value) return value;
	const source = parseImageUrl(legacyPartnerUrls.get(value) ?? value);
	if (!source) return value;
	if (isPublicStorageObject(source) && imageExtension.test(source.pathname)) {
		const path = templateMediaAliases.get(source.pathname) ?? source.pathname;
		return publicMediaPrefix + path.slice(1);
	}
	const id = source.searchParams.get('id');
	if (
		source.origin === thumbnailOrigin &&
		source.pathname === '/i' &&
		id &&
		thumbnailId.test(id) &&
		source.searchParams.size === 2 &&
		source.searchParams.get('n') === '13'
	)
		return thumbnailPath + id;
	return value;
}

export function publicMediaSource(url: URL): URL | null {
	if (url.search || !url.pathname.startsWith(publicMediaPrefix)) return null;
	const partner = partnerImages.get(url.pathname);
	if (partner) return new URL(partner);
	if (url.pathname.startsWith(thumbnailPath)) {
		const id = url.pathname.slice(thumbnailPath.length);
		return thumbnailId.test(id) ? new URL(`/i?id=${id}&n=13`, thumbnailOrigin) : null;
	}
	const objectPath = url.pathname.slice(publicMediaPrefix.length);
	const source = parsePublicImageSource(`${storageOrigin}/${objectPath}`);
	if (!source || !imageExtension.test(source.pathname)) return null;
	const alias = templateMediaAliases.get(source.pathname);
	return alias ? new URL(alias, storageOrigin) : source;
}

export function galleryImageDownloadUrl(image: string, origin: string): string {
	const url = new URL(image, origin);
	return url.origin === origin && publicMediaSource(url)
		? url.href
		: `/api/gallery-image?url=${encodeURIComponent(image)}`;
}
