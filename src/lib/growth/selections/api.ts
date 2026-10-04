export type SelectionItem = {
	kind: 'project' | 'material';
	id: string;
	title: string;
	path: string;
};
export type SelectionComment = { id: string; author: string; body: string; created_at: string };
export type Selection = {
	title: string;
	token: string;
	expires_at: string;
	items: SelectionItem[];
	comments: SelectionComment[];
	can_manage: boolean;
};

export async function growthRequest<T>(path: string, payload?: unknown): Promise<T> {
	const response = await fetch(`/growth/api/${path}`, {
		method: payload === undefined ? 'GET' : 'POST',
		headers: {
			Accept: 'application/json',
			...(payload === undefined ? {} : { 'Content-Type': 'application/json' })
		},
		body: payload === undefined ? undefined : JSON.stringify(payload),
		signal: AbortSignal.timeout(20000)
	});
	const data = await response.json().catch(() => null);
	if (!response.ok || !data)
		throw new Error(
			response.status === 429
				? 'Слишком много попыток. Повторите через минуту.'
				: data?.message || 'Не удалось выполнить действие. Повторите попытку.'
		);
	return data as T;
}
