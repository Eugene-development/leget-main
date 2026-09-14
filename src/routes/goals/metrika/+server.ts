import { env } from '$env/dynamic/private';
import { isHttpError, json } from '@sveltejs/kit';
import { requireGoalsSite, siteTemplate } from '$lib/server/goals-access';
import { MetrikaApi, MetrikaError, remoteGoalState, validCounterId } from '$lib/server/metrika-api';
import { goalsForTemplate } from '$lib/yandex-direct/goals';
import type { RequestHandler } from './$types';

// A deployment runs one Node process; overlapping clicks share this counter lock.
const activeCounters = new Set<string>();
const rates = new Map<string, { start: number; count: number }>();
function limit(key: string) {
	const now = Date.now();
	for (const [id, entry] of rates) if (now - entry.start > 60000) rates.delete(id);
	const entry = rates.get(key) ?? { start: now, count: 0 };
	if (++entry.count > 120)
		throw new MetrikaError(429, 'Слишком много запросов. Повторите через минуту.');
	rates.set(key, entry);
}

export const POST: RequestHandler = async ({ request, url, cookies, getClientAddress }) => {
	const headers = { 'Cache-Control': 'private, no-store' };
	try {
		if (
			request.headers.get('origin') !== url.origin ||
			!request.headers.get('content-type')?.startsWith('application/json')
		)
			throw new MetrikaError(403, 'Запрос разрешён только со страницы целей этого сайта.');
		limit(`ip:${getClientAddress()}`);
		const { site, client, counterId } = await requireGoalsSite(cookies, url.hostname);
		limit(`site:${site.id}`);
		if (!env.YANDEX_METRIKA_OAUTH_TOKEN?.trim())
			throw new MetrikaError(503, 'Токен Метрики ещё не настроен на сервере.');
		const raw = await request.text();
		if (raw.length > 2048) throw new MetrikaError(400, 'Слишком большой запрос.');
		let input: Record<string, unknown>;
		try {
			input = JSON.parse(raw);
		} catch {
			throw new MetrikaError(400, 'Некорректный запрос.');
		}
		if (!input || !['status', 'connect', 'create'].includes(String(input.operation)))
			throw new MetrikaError(400, 'Неизвестная операция.');
		const api = new MetrikaApi(env.YANDEX_METRIKA_OAUTH_TOKEN);
		const definitions = goalsForTemplate(siteTemplate(site)).filter(
			(goal) => goal.status === 'implemented'
		);
		if (input.operation === 'status') {
			const counters = await api.counters(site.domain);
			let states: Record<string, ReturnType<typeof remoteGoalState>> = {};
			let counterError = '';
			if (counterId) {
				try {
					await api.verifyCounter(counterId, site.domain);
					const goals = await api.goals(counterId);
					states = Object.fromEntries(
						definitions.map((goal) => [goal.eventName, remoteGoalState(goals, goal)])
					);
				} catch (error) {
					counterError =
						error instanceof MetrikaError ? error.message : 'Не удалось проверить цели счётчика.';
				}
			}
			return json({ counters, counterId, states, counterError }, { headers });
		}
		if (input.operation === 'connect') {
			if (!validCounterId(input.counterId)) throw new MetrikaError(400, 'Выберите счётчик.');
			await api.verifyCounter(input.counterId, site.domain);
			await client.request(
				`mutation GoalsConnectCounter($id:ID!,$headerData:JSON) { updateLicense(id:$id,headerData:$headerData) { id } }`,
				{ id: site.id, headerData: { ...site.headerData, yandexMetrica: input.counterId } }
			);
			return json({ counterId: input.counterId }, { headers });
		}
		if (input.template !== siteTemplate(site))
			throw new MetrikaError(400, 'Создавать можно только цели шаблона текущего сайта.');
		const definition = definitions.find((goal) => goal.eventName === input.eventName);
		if (!definition) throw new MetrikaError(400, 'Цель отсутствует в рабочей карте шаблона.');
		if (!counterId || counterId !== input.counterId)
			throw new MetrikaError(409, 'Счётчик изменился. Обновите статусы.');
		if (activeCounters.has(counterId))
			throw new MetrikaError(
				409,
				'Для этого счётчика уже выполняется создание. Обновите статусы через несколько секунд.'
			);
		activeCounters.add(counterId);
		try {
			await api.verifyCounter(counterId, site.domain);
			return json(await api.create(counterId, definition), { headers });
		} finally {
			activeCounters.delete(counterId);
		}
	} catch (error) {
		if (isHttpError(error))
			return json({ message: error.body.message }, { status: error.status, headers });
		if (error instanceof MetrikaError)
			return json({ message: error.message }, { status: error.status, headers });
		return json(
			{ message: 'Операция не завершена. Обновите статусы перед повторной попыткой.' },
			{ status: 502, headers }
		);
	}
};
