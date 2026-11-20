import { getAuthToken } from '$lib/utils/auth-session';
import { getGraphQLUrl } from '$lib/utils/config';

export async function uploadSiteFile(
	file: File,
	licenseId: string,
	folder: string,
	onProgress: (percent: number) => void
): Promise<string> {
	// 1. Получаем pre-signed URL
	const token = getAuthToken();
	if (!token) throw new Error('Сессия истекла. Войдите снова и повторите загрузку.');
	const apiUrl = getGraphQLUrl();

	const gqlRes = await fetch(apiUrl, {
		method: 'POST',
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

	if (!gqlRes.ok) throw new Error(`Не удалось подготовить загрузку (HTTP ${gqlRes.status})`);
	const gqlData = await gqlRes.json();
	if (gqlData.errors?.length) throw new Error(gqlData.errors[0]?.message);

	const { uploadUrl, objectUrl } = gqlData.data.generateUploadUrl;

	// 2. Загружаем через XHR для отображения прогресса
	await new Promise<void>((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('PUT', uploadUrl);
		xhr.setRequestHeader('Content-Type', file.type);
		xhr.upload.onprogress = (ev) => {
			if (ev.lengthComputable) {
				onProgress(Math.round((ev.loaded / ev.total) * 100));
			}
		};
		xhr.onload = () =>
			xhr.status >= 200 && xhr.status < 300
				? resolve()
				: reject(new Error(`Не удалось загрузить файл (HTTP ${xhr.status})`));
		xhr.onerror = () =>
			reject(new Error('Не удалось загрузить файл. Проверьте подключение и повторите попытку.'));
		xhr.onabort = () => reject(new Error('Загрузка прервана.'));
		xhr.send(file);
	});

	return objectUrl;
}
