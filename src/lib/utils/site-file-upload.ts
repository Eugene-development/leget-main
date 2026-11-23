import { getAuthToken } from '$lib/utils/auth-session';
import { getGraphQLUrl } from '$lib/utils/config';
import { graphQLError, requestError, storageUploadError } from './user-error.js';

export async function uploadSiteFile(
	file: File,
	licenseId: string,
	folder: string,
	onProgress?: (percent: number) => void
): Promise<string> {
	// 1. Получаем pre-signed URL
	const token = getAuthToken();
	if (!token) throw requestError(401);
	const apiUrl = getGraphQLUrl();

	const gqlRes = await fetch(apiUrl, {
		method: 'POST',
		signal: AbortSignal.timeout(15000),
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: `
				mutation GenerateUploadUrl($filename: String!, $mimeType: String!, $folder: String, $licenseId: ID) {
					generateUploadUrl(filename: $filename, mimeType: $mimeType, folder: $folder, licenseId: $licenseId) {
						uploadUrl
						objectUrl
					}
				}
			`,
			variables: {
				filename: file.name,
				mimeType: file.type,
				folder,
				licenseId
			}
		})
	});

	const gqlData = await gqlRes.json().catch(() => null);
	if (!gqlRes.ok || gqlData?.errors?.length) {
		throw graphQLError(gqlRes.status, gqlData?.errors);
	}
	const { uploadUrl, objectUrl } = gqlData?.data?.generateUploadUrl ?? {};
	if (typeof uploadUrl !== 'string' || !uploadUrl || typeof objectUrl !== 'string' || !objectUrl) {
		throw requestError(502);
	}

	await putStorageFile(file, uploadUrl, onProgress);
	return objectUrl;
}

export function putStorageFile(
	file: File,
	uploadUrl: string,
	onProgress?: (percent: number) => void
): Promise<void> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', uploadUrl);
		xhr.timeout = 180000;
		xhr.setRequestHeader('Content-Type', file.type);
		xhr.upload.onprogress = (ev) => {
			if (ev.lengthComputable) {
				onProgress?.(Math.round((ev.loaded / ev.total) * 100));
			}
		};
		xhr.onload = () =>
			xhr.status >= 200 && xhr.status < 300
				? resolve()
				: reject(storageUploadError(xhr.status));
		xhr.onerror = () => reject(storageUploadError('network'));
		xhr.ontimeout = () => reject(storageUploadError('timeout'));
		xhr.onabort = () => reject(new DOMException('Upload aborted', 'AbortError'));
		xhr.send(file);
	});
}
