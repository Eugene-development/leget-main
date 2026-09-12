import type { EditContext } from '$lib/utils/page-edit';
import { getGraphQLUrl } from '$lib/utils/config';

export type MoveDirection = 'up' | 'down';
export const COMPONENT_ORDER_CONTEXT = Symbol('component-order');
export interface ComponentOrderController {
	position(type: string, context: EditContext | null): { index: number; count: number } | null;
	readonly busy: boolean;
	move(type: string, direction: MoveDirection): Promise<void>;
}

export async function movePageComponent(
	context: EditContext,
	type: string,
	direction: MoveDirection
): Promise<string[]> {
	const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
	if (!token) throw new Error('Войдите в аккаунт, чтобы изменить порядок блоков.');
	const response = await fetch(getGraphQLUrl(), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			query: `mutation MovePageComponent($pageId: ID!, $licenseId: ID!, $type: String!, $direction: String!) {
				movePageComponent(pageId: $pageId, licenseId: $licenseId, type: $type, direction: $direction)
			}`,
			variables: { pageId: context.pageId, licenseId: context.licenseId, type, direction }
		})
	});
	if (!response.ok) throw new Error('Не удалось сохранить порядок блоков. Повторите попытку.');
	const result = await response.json();
	if (result.errors?.length || !Array.isArray(result.data?.movePageComponent)) {
		throw new Error('Не удалось сохранить порядок блоков. Повторите попытку.');
	}
	return result.data.movePageComponent;
}
