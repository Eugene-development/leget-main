import { getAuthToken } from '$lib/utils/auth-session';
import { getGraphQLUrl } from '$lib/utils/config';

export class ProjectRequestError extends Error {
	constructor(
		message: string,
		public fields: Record<string, string> = {}
	) {
		super(message);
	}
}

export async function projectRequest<T>(
	query: string,
	variables: Record<string, unknown>,
	failureMessage = 'Не удалось сохранить проект. Проверьте права доступа и повторите попытку.'
): Promise<T> {
	const token = getAuthToken();
	if (!token)
		throw new ProjectRequestError('Войдите в аккаунт владельца сайта и повторите действие.');
	let response: Response;
	try {
		response = await fetch(getGraphQLUrl(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
				'X-Forwarded-Host': window.location.hostname
			},
			body: JSON.stringify({ query, variables })
		});
	} catch {
		throw new ProjectRequestError(
			'Нет связи с сервером. Проверьте подключение и повторите попытку.'
		);
	}
	if (!response.ok)
		throw new ProjectRequestError('Сервер не смог обработать запрос. Повторите попытку.');
	let result;
	try {
		result = await response.json();
	} catch {
		throw new ProjectRequestError('Сервер вернул некорректный ответ. Повторите попытку.');
	}
	if (result.errors?.length) {
		const fields: Record<string, string> = {};
		for (const error of result.errors) {
			for (const [key, messages] of Object.entries(error.extensions?.validation ?? {})) {
				const field = key.replace(/^input\./, '').split('.')[0];
				fields[field] = Array.isArray(messages) ? String(messages[0]) : String(messages);
			}
		}
		throw new ProjectRequestError(
			Object.keys(fields).length ? 'Проверьте отмеченные поля.' : failureMessage,
			fields
		);
	}
	if (!result.data) throw new ProjectRequestError(failureMessage);
	return result.data;
}
