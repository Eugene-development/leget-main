const moscowOffset = 3 * 60 * 60 * 1000;
const day = 24 * 60 * 60 * 1000;
const formatter = new Intl.DateTimeFormat('ru-RU', {
	timeZone: 'Europe/Moscow',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});
const months = [
	'января',
	'февраля',
	'марта',
	'апреля',
	'мая',
	'июня',
	'июля',
	'августа',
	'сентября',
	'октября',
	'ноября',
	'декабря'
];

export type PromotionSchedule = {
	enabled?: unknown;
	expiresAt?: unknown;
	validUntil?: unknown;
	until?: unknown;
	deadline?: unknown;
};

/** Interpret datetime-local inputs as Moscow time on every device. */
export function parsePromotionTime(value: string): number | null {
	const local = value.length === 16 ? `${value}:00` : value;
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(local)) return null;
	const utc = Date.parse(`${local}Z`);
	if (!Number.isFinite(utc) || new Date(utc).toISOString().slice(0, 19) !== local) return null;
	return utc - moscowOffset;
}

function absoluteTime(value: unknown): number | null {
	if (
		typeof value !== 'string' ||
		!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
	)
		return null;
	if (parsePromotionTime(value.slice(0, 19)) === null) return null;
	const absolute = Date.parse(value);
	return Number.isFinite(absolute) ? absolute : null;
}

export function promotionDeadline(data: PromotionSchedule, timer = false): number | null {
	if ('expiresAt' in data) return absoluteTime(data.expiresAt);
	if (timer) {
		const deadline = data.deadline ?? '2026-12-31T00:00:00';
		return typeof deadline === 'string'
			? (absoluteTime(deadline) ?? parsePromotionTime(deadline))
			: null;
	}
	const text = data.validUntil ?? data.until;
	if (typeof text !== 'string') return null;
	const label = text.trim();
	const russian = /^(\d{1,2})\s+([а-я]+)\s+(\d{4})(?:\s+г\.?)?$/i.exec(label);
	const dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(label);
	const date = russian ?? dotted;
	const iso = date
		? `${date[3]}-${String(russian ? months.indexOf(date[2].toLowerCase()) + 1 : date[2]).padStart(2, '0')}-${date[1].padStart(2, '0')}`
		: label;
	const start = parsePromotionTime(`${iso}T00:00`);
	return start === null ? null : start + day;
}

export function promotionIsActive(data: PromotionSchedule, now: number, timer = false): boolean {
	const deadline = promotionDeadline(data, timer);
	return data.enabled !== false && (deadline === null || deadline > now);
}

export function promotionTimeInput(deadline: number | null): string {
	return deadline === null ? '' : new Date(deadline + moscowOffset).toISOString().slice(0, 16);
}

export function formatPromotionDeadline(deadline: number): string {
	return `${formatter.format(deadline)} мск`;
}
