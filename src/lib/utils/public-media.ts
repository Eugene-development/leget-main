const storageOrigin = 'https://storage.yandexcloud.net';
export const publicMediaPrefix = '/media/';
const rasterExtension = /\.(?:avif|gif|jpe?g|png|webp)$/i;

export function parsePublicImageSource(value: string): URL | null {
	try {
		const source = new URL(value);
		if (
			source.origin !== storageOrigin ||
			source.username ||
			source.password ||
			source.search ||
			source.hash ||
			!/^\/(leget-main|zovtop)\/.+/.test(source.pathname)
		)
			return null;
		return source;
	} catch {
		return null;
	}
}

export function publicMediaUrl(value: string): string {
	const source = parsePublicImageSource(value);
	return source && rasterExtension.test(source.pathname)
		? publicMediaPrefix + source.pathname.slice(1)
		: value;
}

export function publicMediaSource(url: URL): URL | null {
	if (url.search || !url.pathname.startsWith(publicMediaPrefix)) return null;
	const objectPath = url.pathname.slice(publicMediaPrefix.length);
	const source = parsePublicImageSource(`${storageOrigin}/${objectPath}`);
	return source && rasterExtension.test(source.pathname) ? source : null;
}
