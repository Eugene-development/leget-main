export type Row = Record<string, any>;
export type Field = {
	key: string;
	label: string;
	type?: string;
	required?: boolean;
	options?: { value: string; label: string }[];
	min?: string;
	max?: string;
	step?: string;
	help?: string;
	search?: (query: string) => Promise<{ value: string; label: string }[]>;
};
const attempts = new Map<string, string>();
export async function crmRequest(
	base: string,
	path: string,
	body?: Row | FormData,
	options: { signal?: AbortSignal } = {}
): Promise<Row> {
	const signature =
		body instanceof FormData
			? `${path}:${JSON.stringify([...body.entries()].map(([k, v]) => [k, typeof v === 'string' ? v : [v.name, v.size, v.lastModified]]))}`
			: `${path}:${JSON.stringify(body)}`;
	let payload: BodyInit | undefined;
	if (body) {
		if (!attempts.has(signature)) attempts.set(signature, crypto.randomUUID());
		const key = attempts.get(signature)!;
		if (body instanceof FormData) {
			body.set('request_key', key);
			payload = body;
		} else payload = JSON.stringify({ ...body, request_key: key });
	}
	let response: Response;
	try {
		response = await fetch(`${base}/api/${path}`, {
			method: body ? 'POST' : 'GET',
			headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
			body: payload,
			signal: options.signal
		});
	} catch (error) {
		if (options.signal?.aborted) throw error;
		throw new Error('Связь прервалась. Повторите действие — повтор не создаст дубль.');
	}
	const result = await response.json().catch(() => ({}));
	if (!response.ok)
		throw new Error(
			result.errors
				? Object.values(result.errors).flat().join(' ')
				: result.message || `Не удалось выполнить действие (${response.status}).`
		);
	if (body) attempts.delete(signature);
	return result;
}
export const money = (v: unknown) =>
	new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(Number(v || 0));
export const date = (v: unknown) =>
	v
		? new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeZone: 'Europe/Moscow' }).format(
				new Date(String(v).replace(' ', 'T'))
			)
		: '—';
export const labels: Record<string, string> = {
	'glass-mirrors': 'Стекло и Зеркала',
	new: 'Новая',
	processed: 'В работе',
	completed: 'Завершена',
	cancelled: 'Нецелевая',
	pending: 'Ожидает решения',
	approved: 'Одобрен',
	rejected: 'Отклонён',
	revoked: 'Отозван',
	online: 'Сайт',
	call: 'Звонок',
	visit: 'Личное обращение',
	email: 'Email',
	referral: 'Рекомендация',
	other: 'Другой',
	manual: 'Вручную',
	person: 'Физическое лицо',
	organization: 'Организация',
	contract: 'Договор',
	act: 'Акт',
	planned: 'Запланировано',
	working: 'В работе',
	payment: 'Платёж',
	refund: 'Возврат',
	contact: 'Обратная связь',
	consultation: 'Консультация',
	subscription: 'Подписка',
	warranty: 'Гарантия',
	vacancy: 'Вакансия',
	'manager-access': 'Доступ менеджера'
};
export const options = (items: Record<string, string>) =>
	Object.entries(items).map(([value, label]) => ({ value, label }));

export const dateTime = (v: unknown) =>
	v
		? new Intl.DateTimeFormat('ru-RU', {
				dateStyle: 'medium',
				timeStyle: 'short',
				timeZone: 'Europe/Moscow'
			}).format(new Date(String(v)))
		: '—';
export function dateTimeInput(v: unknown): string {
	if (!v) return '';
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: 'Europe/Moscow',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hourCycle: 'h23'
	}).formatToParts(new Date(String(v)));
	const data = Object.fromEntries(parts.map((p) => [p.type, p.value]));
	return `${data.year}-${data.month}-${data.day}T${data.hour}:${data.minute}`;
}
