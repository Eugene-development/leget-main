/** Management API. Never return upstream bodies: they can contain account information. */
export class MetrikaError extends Error {
	constructor(
		public status: number,
		message: string
	) {
		super(message);
	}
}
export interface MetrikaCounter {
	id: number;
	name: string;
	permission: string;
	status?: string;
	site?: string;
	site2?: { site?: string };
	mirrors?: string[];
	mirrors2?: { site?: string }[];
}
export interface MetrikaGoal {
	id: number;
	name: string;
	type: string;
	status?: string;
	conditions?: { type: string; url: string }[];
}
export interface PublishableGoal {
	eventName: string;
	name: string;
}
export type GoalRemoteState = { state: 'created' | 'missing' | 'conflict'; id?: number };

export function metrikaGoalName(definition: PublishableGoal): string {
	const suffix = ` · ${definition.eventName}`;
	return `${definition.name.slice(0, Math.max(0, 255 - suffix.length))}${suffix}`;
}

export function counterHost(value: string): string {
	try {
		return new URL(value.includes('://') ? value : `https://${value}`).hostname
			.toLowerCase()
			.replace(/\.$/, '');
	} catch {
		return '';
	}
}
export function counterBelongsTo(counter: MetrikaCounter, domain: string): boolean {
	const host = counterHost(domain);
	return (
		!!host &&
		counter.status !== 'Deleted' &&
		['own', 'edit'].includes(counter.permission) &&
		[
			counter.site,
			counter.site2?.site,
			...(counter.mirrors ?? []),
			...(counter.mirrors2 ?? []).map((item) => item.site)
		].some((site) => typeof site === 'string' && counterHost(site) === host)
	);
}
export function remoteGoalState(
	goals: MetrikaGoal[],
	definition: PublishableGoal
): GoalRemoteState {
	const active = goals.filter((goal) => goal.status?.toLowerCase() !== 'deleted');
	const exact = active.find(
		(goal) =>
			goal.type === 'action' &&
			goal.conditions?.length === 1 &&
			goal.conditions[0].type === 'exact' &&
			goal.conditions[0].url === definition.eventName
	);
	if (exact) return { state: 'created', id: exact.id };
	const conflict = active.find(
		(goal) =>
			goal.name === metrikaGoalName(definition) ||
			goal.conditions?.some((condition) => condition.url === definition.eventName)
	);
	return conflict ? { state: 'conflict', id: conflict.id } : { state: 'missing' };
}
export function validCounterId(value: unknown): value is string {
	return (
		typeof value === 'string' &&
		/^[1-9]\d{0,15}$/.test(value) &&
		Number.isSafeInteger(Number(value))
	);
}

export class MetrikaApi {
	constructor(
		private token: string,
		private request: typeof fetch = fetch
	) {}
	private async call(path: string, body?: unknown): Promise<Record<string, unknown>> {
		if (!this.token.trim())
			throw new MetrikaError(503, 'Токен Метрики ещё не настроен на сервере.');
		let response: Response;
		try {
			response = await this.request(`https://api-metrika.yandex.net/management/v1/${path}`, {
				method: body ? 'POST' : 'GET',
				redirect: 'error',
				signal: AbortSignal.timeout(12000),
				headers: {
					Authorization: `OAuth ${this.token.trim()}`,
					Accept: 'application/json',
					...(body ? { 'Content-Type': 'application/json' } : {})
				},
				...(body ? { body: JSON.stringify(body) } : {})
			});
		} catch {
			throw new MetrikaError(
				502,
				'Метрика не ответила. Обновите статусы перед повторной попыткой.'
			);
		}
		if (!response.ok) {
			const messages: Record<number, string> = {
				401: 'Токен Метрики недействителен или отозван.',
				403: 'Недостаточно прав: нужны metrika:write и полный доступ к счётчику.',
				404: 'Счётчик Метрики не найден.',
				429: 'Достигнут лимит запросов Метрики. Повторите позже.',
				400: 'Метрика отклонила цель. Проверьте настройки и лимит целей счётчика.'
			};
			throw new MetrikaError(
				response.status === 429 ? 429 : 502,
				messages[response.status] ??
					'Не удалось выполнить запрос к Метрике. Обновите статусы перед повтором.'
			);
		}
		try {
			const result = await response.json();
			if (!result || typeof result !== 'object' || result.errors) throw new Error();
			return result;
		} catch {
			throw new MetrikaError(502, 'Метрика вернула некорректный ответ.');
		}
	}
	async counters(domain: string): Promise<{ id: string; name: string }[]> {
		const result: { id: string; name: string }[] = [];
		for (let offset = 1; offset <= 100000; offset += 1000) {
			const data = await this.call(
				`counters?permission=own,edit&field=mirrors&per_page=1000&offset=${offset}&search_string=${encodeURIComponent(counterHost(domain))}`
			);
			if (!Array.isArray(data.counters))
				throw new MetrikaError(502, 'Метрика не вернула список счётчиков.');
			const counters = data.counters as MetrikaCounter[];
			result.push(
				...counters
					.filter((counter) => counterBelongsTo(counter, domain))
					.map((counter) => ({ id: String(counter.id), name: counter.name }))
			);
			if (counters.length < 1000) break;
		}
		return result;
	}
	async verifyCounter(id: string, domain: string): Promise<void> {
		if (!validCounterId(id)) throw new MetrikaError(400, 'Укажите корректный номер счётчика.');
		const data = await this.call(`counter/${id}?field=mirrors`);
		const counter = data.counter as MetrikaCounter | undefined;
		if (!counter || String(counter.id) !== id || !counterBelongsTo(counter, domain))
			throw new MetrikaError(
				403,
				'Счётчик должен иметь полный доступ и содержать домен этого сайта в основном адресе или зеркалах.'
			);
	}
	async goals(id: string): Promise<MetrikaGoal[]> {
		const data = await this.call(`counter/${id}/goals`);
		if (!Array.isArray(data.goals)) throw new MetrikaError(502, 'Метрика не вернула список целей.');
		return data.goals as MetrikaGoal[];
	}
	async create(
		id: string,
		definition: PublishableGoal
	): Promise<{ id: number; outcome: 'created' | 'existing' }> {
		const state = remoteGoalState(await this.goals(id), definition);
		if (state.state === 'created') return { id: state.id!, outcome: 'existing' };
		if (state.state === 'conflict')
			throw new MetrikaError(
				409,
				'В Метрике найдена цель с другим условием. Проверьте её вручную; существующая цель не изменена.'
			);
		try {
			const result = await this.call(`counter/${id}/goals`, {
				goal: {
					name: metrikaGoalName(definition),
					type: 'action',
					conditions: [{ type: 'exact', url: definition.eventName }]
				}
			});
			const goal = result.goal as MetrikaGoal | undefined;
			if (
				!goal ||
				!Number.isSafeInteger(goal.id) ||
				remoteGoalState([goal], definition).state !== 'created'
			)
				throw new MetrikaError(502, 'Создание цели не подтверждено. Обновите статусы.');
			return { id: goal.id, outcome: 'created' };
		} catch (error) {
			// A response may be lost after the write. Reconcile; never blindly retry POST.
			try {
				const state = remoteGoalState(await this.goals(id), definition);
				if (state.state === 'created') return { id: state.id!, outcome: 'existing' };
			} catch {
				/* Preserve the sanitized original error. */
			}
			throw error;
		}
	}
}
