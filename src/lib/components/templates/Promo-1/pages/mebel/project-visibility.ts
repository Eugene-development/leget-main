import { projectRequest } from './project-request';

export async function setSharedProjectVisibility(
	id: string,
	licenseId: string,
	isVisible: boolean
) {
	const result = await projectRequest<{
		setSharedProjectVisibility: { id: string; isVisible: boolean };
	}>(
		`mutation SetSharedProjectVisibility($id: ID!, $licenseId: ID!, $isVisible: Boolean!) {
			setSharedProjectVisibility(id: $id, licenseId: $licenseId, isVisible: $isVisible) { id isVisible }
		}`,
		{ id, licenseId, isVisible },
		'Не удалось изменить видимость проекта. Проверьте права доступа и повторите попытку.'
	);
	if (
		result.setSharedProjectVisibility?.id !== id ||
		result.setSharedProjectVisibility.isVisible !== isVisible
	)
		throw new Error('Сервер не подтвердил изменение видимости. Повторите попытку.');
}
