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
