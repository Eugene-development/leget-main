/**
 * Утилита для inline-редактирования компонентов страницы.
 *
 * Вызывает мутацию upsertPageComponent через GraphQL API
 * с токеном авторизации из localStorage.
 */

import { getGraphQLUrl } from '$lib/utils/config';

const UPSERT_MUTATION = `
  mutation UpsertPageComponent($pageId: ID!, $licenseId: ID!, $type: String!, $data: JSON!) {
    upsertPageComponent(pageId: $pageId, licenseId: $licenseId, type: $type, data: $data) {
      id
      type
      data
      isActive
    }
  }
`;

const UPDATE_LICENSE_MUTATION = `
  mutation UpdateLicense($id: ID!, $headerData: JSON, $footerData: JSON) {
    updateLicense(id: $id, headerData: $headerData, footerData: $footerData) {
      id
      headerData
      footerData
    }
  }
`;

export interface EditContext {
	pageId: string;
	licenseId: string;
}

/**
 * Сохраняет обновлённые данные компонента через GraphQL мутацию.
 *
 * @param context - pageId и licenseId для идентификации компонента
 * @param type - тип компонента (например, "Hero", "Text")
 * @param data - полный объект данных компонента (все поля, включая изменённое)
 * @throws Error если запрос завершился с ошибкой
 */
export async function saveComponentData(
	context: EditContext,
	type: string,
	data: Record<string, unknown>
): Promise<void> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const apiUrl = getGraphQLUrl();

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: UPSERT_MUTATION,
			variables: {
				pageId: context.pageId,
				licenseId: context.licenseId,
				type,
				data
			}
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors?.length) {
		const msg = result.errors[0]?.message ?? 'GraphQL error';
		throw new Error(msg);
	}
}

/**
 * Сохраняет данные хэдера или футера (глобальные для всего сайта).
 */
export async function saveLayoutData(
	context: EditContext,
	type: 'Header' | 'Footer',
	data: Record<string, unknown>
): Promise<void> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const apiUrl = getGraphQLUrl();

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: UPDATE_LICENSE_MUTATION,
			variables: {
				id: context.licenseId,
				headerData: type === 'Header' ? data : undefined,
				footerData: type === 'Footer' ? data : undefined
			}
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors?.length) {
		const msg = result.errors[0]?.message ?? 'GraphQL error';
		throw new Error(msg);
	}
}

const LIST_BUCKET_FILES_QUERY = `
  query ListBucketFiles($folder: String, $maxKeys: Int) {
    listBucketFiles(folder: $folder, maxKeys: $maxKeys) {
      key
      url
      size
      lastModified
    }
  }
`;

export interface BucketFile {
	key: string;
	url: string;
	size: number | null;
	lastModified: string | null;
}

/**
 * Загружает список файлов из бакета для текущего лицензиата.
 *
 * @param folder  - папка внутри бакета (например «bg»). По умолчанию «bg».
 * @param maxKeys - максимальное количество файлов (до 200). По умолчанию 100.
 */
export async function listBucketFiles(
	folder = 'bg',
	maxKeys = 100
): Promise<BucketFile[]> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;

	if (!token) {
		throw new Error('Не авторизован');
	}

	const apiUrl = getGraphQLUrl();

	const response = await fetch(apiUrl, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: LIST_BUCKET_FILES_QUERY,
			variables: { folder, maxKeys }
		})
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}

	const result = await response.json();

	if (result.errors?.length) {
		const msg = result.errors[0]?.message ?? 'GraphQL error';
		throw new Error(msg);
	}

	return (result.data?.listBucketFiles ?? []) as BucketFile[];
}

