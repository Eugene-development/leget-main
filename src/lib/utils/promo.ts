/**
 * Отображение промокодов: подписи статусов, форматирование сумм и дат.
 *
 * Словарь статусов дублирует `App\Enums\PromoCodeStatus::label()` в leget-api.
 * Копия, а не запрос: подпись нужна при первом рендере списка, и ходить
 * за ней в API на каждую строку было бы дороже, чем держать её здесь.
 * Расхождение видно сразу — незнакомый статус показывается как есть.
 */
export const STATUS_LABELS: Record<string, string> = {
	created: 'Создан',
	activated: 'Активирован',
	presented: 'Предъявлен',
	order_created: 'Оформлен заказ',
	deal_reported: 'Сделка заявлена',
	client_confirmed: 'Подтверждена клиентом',
	closed: 'Закрыта',
	disputed: 'Оспорена',
	cancelled: 'Отменён',
	refunded: 'Возврат',
	expired: 'Истёк'
};

/** Порядок для фильтров — совпадает с жизненным циклом, а не алфавитом. */
export const STATUS_ORDER = [
	'created',
	'activated',
	'presented',
	'order_created',
	'deal_reported',
	'client_confirmed',
	'closed',
	'disputed',
	'cancelled',
	'refunded',
	'expired'
];

export const CLIENT_RESPONSES: Record<string, string> = {
	confirmed: 'Подтверждаю',
	amount_wrong: 'Сумма неверна',
	discount_missing: 'Скидка не предоставлена',
	no_deal: 'Сделки не было',
	order_cancelled: 'Заказ отменён'
};

export function statusLabel(status: string | null | undefined): string {
	if (!status) return '—';
	return STATUS_LABELS[status] ?? status;
}

/**
 * Тон плашки статуса.
 *
 * Роли шкал, а не палитра: цвет принадлежит дизайн-системе, и жёсткий
 * `bg-red-500` сделал бы кабинет неперекрашиваемым.
 */
export function statusTone(status: string | null | undefined): string {
	switch (status) {
		case 'closed':
		case 'client_confirmed':
			return 'bg-cat-2-50 text-cat-2-700';
		case 'disputed':
		case 'cancelled':
		case 'refunded':
		case 'expired':
			return 'bg-cat-1-50 text-cat-1-700';
		case 'deal_reported':
			return 'bg-cat-4-50 text-cat-4-700';
		default:
			return 'bg-surface-muted text-ink-600';
	}
}

/**
 * Денежная сумма.
 *
 * Приходит строкой и строкой же форматируется: приводить её к числу ради
 * `toLocaleString` значило бы пропустить деньги через двоичную дробь.
 * Разряды расставляются по строке.
 */
export function money(value: string | number | null | undefined, currency = 'RUB'): string {
	if (value === null || value === undefined || value === '') return '—';

	const raw = String(value);
	const negative = raw.startsWith('-');
	const [whole, fraction = '00'] = raw.replace('-', '').split('.');
	const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	const sign = negative ? '−' : '';
	const symbol = currency === 'RUB' ? '₽' : currency;

	return `${sign}${grouped},${fraction.padEnd(2, '0').slice(0, 2)} ${symbol}`;
}

/** Размер скидки одной строкой — процент или сумма. */
export function discount(
	type: string | null | undefined,
	value: string | null | undefined,
	currency: string | null | undefined
): string {
	if (!value) return '—';
	if (type === 'percent') return `${String(value).replace(/\.00$/, '')} %`;
	return money(value, currency ?? 'RUB');
}

export function formatDate(value: string | null | undefined, withTime = true): string {
	if (!value) return '—';

	return new Intl.DateTimeFormat('ru-RU', {
		dateStyle: 'long',
		...(withTime ? { timeStyle: 'short' } : {}),
		timeZone: 'Europe/Moscow'
	}).format(new Date(value));
}

/** Интервал воронки в человеческом виде: секунды приходят из отчёта. */
export function duration(seconds: number | null | undefined): string {
	if (seconds === null || seconds === undefined) return '—';
	if (seconds < 60) return `${seconds} с`;
	if (seconds < 3600) return `${Math.round(seconds / 60)} мин`;
	if (seconds < 86_400) return `${Math.round(seconds / 3600)} ч`;
	return `${Math.round(seconds / 86_400)} дн`;
}

/**
 * Страница выдачи Laravel.
 *
 * Тип объявлен здесь, а не выводится из ответа: `promoApi` отдаёт
 * `Record<string, unknown>`, и без явного приведения страница не знает
 * даже про `data` и `total`.
 */
export interface Paginated<T> {
	data: T[];
	total: number;
	current_page: number;
	last_page: number;
	per_page: number;
}

/**
 * Карточка промокода в том виде, в каком её отдаёт leget-api.
 *
 * Поля намеренно необязательны: набор зависит от роли смотрящего —
 * клиенту не приходит `client`, партнёру не приходит рекламная аналитика,
 * и один тип на все четыре выдачи честнее четырёх почти одинаковых.
 */
export interface PromoDealCard {
	id: string;
	order_number: string;
	deal_date: string | null;
	gross_amount: string;
	discount_amount: string;
	net_amount: string;
	currency: string;
	category?: string | null;
	comment?: string | null;
	document_url?: string | null;
	reported_by_role?: string;
	on_behalf_of_partner?: boolean;
	behalf_reason?: string | null;
	client_response?: string | null;
	client_response_label?: string | null;
	client_comment?: string | null;
	confirmation_reason?: string | null;
	closed_at?: string | null;
}

export interface PromoParty {
	id?: number;
	name?: string | null;
	email?: string | null;
	phone?: string | null;
	company?: string | null;
}

export interface PromoCard {
	id: string;
	code: string;
	status: string;
	status_label: string;
	discount_type: string;
	discount_value: string;
	currency: string | null;
	minimum_order_amount: string | null;
	subject_type: string;
	subject_title: string;
	terms: string | null;
	starts_at: string | null;
	expires_at: string | null;
	created_at: string | null;
	activated_at: string | null;
	presented_at: string | null;
	deal_reported_at: string | null;
	client_confirmed_at: string | null;
	closed_at: string | null;
	client?: PromoParty | null;
	partner?: PromoParty | null;
	curator?: PromoParty | null;
	deal?: PromoDealCard | null;
	has_attribution?: boolean;
	attribution?: {
		id: string;
		visitor_id: string | null;
		first: Record<string, string | null>;
		last: Record<string, string | null>;
	} | null;
	timings?: Record<string, number | null>;
}

/** Запись журнала аудита в том виде, в каком её показывает интерфейс. */
export interface PromoEventRow {
	id: string;
	action: string;
	action_label: string;
	actor_id?: number | null;
	actor_role: string | null;
	from_status: string | null;
	to_status: string | null;
	changes?: Record<string, unknown> | null;
	reason: string | null;
	ip_address?: string | null;
	user_agent?: string | null;
	created_at: string | null;
}

/**
 * Результат form action кабинета.
 *
 * Тип объявлен руками, а не берётся из `ActionData` в `./$types`: в этом
 * проекте генерируемый `proxy+page.server.ts` идёт с `@ts-nocheck`, и
 * `AwaitedActions` схлопывается в `never` — `ActionData` резолвится в `null`
 * для ЛЮБОГО маршрута, не только промо. Существующие страницы обходят это
 * тем, что написаны без `lang="ts"`; здесь типы нужны, поэтому форма
 * описана явно.
 */
export interface PromoFormResult {
	success?: boolean;
	message?: string | null;
	/** Идентификатор строки, к которой относится ответ, — чтобы показать ошибку у неё. */
	id?: string;
	action?: string;
	[key: string]: unknown;
}
