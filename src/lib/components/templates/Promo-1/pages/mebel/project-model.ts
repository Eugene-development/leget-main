import { projectRequest } from './project-request';

export const MAX_MODEL_BYTES = 25 * 1024 * 1024;
export const MAX_HTML_MODEL_BYTES = 5 * 1024 * 1024;
export interface ProjectModel {
	url: string;
	size?: number;
	sha256?: string;
	format?: 'html';
	transfer_size?: number;
	encoding?: string;
	triangles?: number;
	parts?: number;
}

export function readProjectModel(meta?: Record<string, unknown> | null): ProjectModel | null {
	const value = meta?.model_3d;
	if (!value || typeof value !== 'object' || !('url' in value) || typeof value.url !== 'string')
		return null;
	try {
		const url = new URL(value.url);
		if (
			url.protocol !== 'https:' ||
			url.hostname !== 'storage.yandexcloud.net' ||
			url.username ||
			url.password ||
			url.port ||
			url.search ||
			url.hash ||
			!/^\/[^/]+\/mebel-models\/[a-f0-9]{32}\/[a-zA-Z0-9]{40}\.(glb|html)$/.test(url.pathname)
		)
			return null;
		return {
			...value,
			...(url.pathname.endsWith('.html') ? { format: 'html' } : { format: undefined })
		} as ProjectModel;
	} catch {
		return null;
	}
}

export async function validateModelFile(file: File): Promise<void> {
	if (!/\.glb$/i.test(file.name) || file.size < 20 || file.size > MAX_MODEL_BYTES)
		throw new Error('Выберите GLB до 25 МБ. Сжатие выполняется автоматически.');
	const header = new DataView(await file.slice(0, 20).arrayBuffer());
	if (
		header.getUint32(0, true) !== 0x46546c67 ||
		header.getUint32(4, true) !== 2 ||
		header.getUint32(8, true) !== file.size ||
		header.getUint32(16, true) !== 0x4e4f534a
	)
		throw new Error('Файл повреждён или не является моделью GLB 2.0.');
}

/** Cache successful PUTs so a failed project save does not upload the file twice. */
export function createModelUploader() {
	const uploaded = new WeakMap<File, string>();
	return async (file: File): Promise<string> => {
		await validateModelFile(file);
		const cached = uploaded.get(file);
		if (cached) return cached;
		const mimeType = /\.html$/i.test(file.name) ? 'text/html' : 'model/gltf-binary';
		const { generateUploadUrl: info } = await projectRequest<{
			generateUploadUrl: { uploadUrl: string; objectUrl: string };
		}>(
			`mutation ProjectModelUpload($filename: String!, $mimeType: String!, $folder: String) {
			generateUploadUrl(filename: $filename, mimeType: $mimeType, folder: $folder) { uploadUrl objectUrl }
		}`,
			{ filename: file.name, mimeType, folder: 'mebel-models' }
		);
		if (!info?.uploadUrl || !info.objectUrl)
			throw new Error('Не удалось подготовить загрузку 3D-модели.');
		try {
			const response = await fetch(info.uploadUrl, {
				method: 'PUT',
				headers: { 'Content-Type': mimeType },
				body: file
			});
			if (!response.ok) throw new Error('Upload failed');
		} catch {
			throw new Error(
				'Не удалось загрузить 3D-модель. Проверьте подключение и повторите сохранение.'
			);
		}
		uploaded.set(file, info.objectUrl);
		return info.objectUrl;
	};
}
