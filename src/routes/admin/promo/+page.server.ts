import { fail } from '@sveltejs/kit';
import { promoApi, promoPost, query } from '$lib/server/promo-api';
import type { Paginated, PromoCard, PromoEventRow } from '$lib/utils/promo';
import type { Actions, PageServerLoad } from './$types';

/** Cookie админской сессии — та же, что у `/admin`, область `/admin`. */
const COOKIE_NAME = 'leget_admin_jwt';

/** Фильтры реестра. Тип явный: без него `data.filters ?? {}` схлопывается в `{}`. */
export interface PromoFilters {
	status: string | null;
	client_id: string | null;
	curator_id: string | null;
	partner_id: string | null;
	utm_source: string | null;
	from: string | null;
	to: string | null;
}

const EMPTY_FILTERS: PromoFilters = {
	status: null,
	client_id: null,
	curator_id: null,
	partner_id: null,
	utm_source: null,
	from: null,
	to: null
};

/** Строка отчёта по рекламным источникам — единственная выдача с yclid и UTM. */
export interface SourceRow {
	promo_code: string;
	source: string | null;
	campaign: string | null;
	campaign_id: string | null;
	ad_group_id: string | null;
	ad_id: string | null;
	keyword_id: string | null;
	yclid: string | null;
	client: string | null;
	curator: string | null;
	partner: string | null;
	reported_at: string | null;
	confirmed_at: string | null;
	closed_at: string | null;
	gross_amount: string | null;
	discount_amount: string | null;
	net_amount: string | null;
	status: string;
	timings: Record<string, number | null>;
}

export interface CuratorRow {
	curator: { id: number; name: string; email: string };
	closed_deals: number;
	deals_total: string;
	discount_total: string;
	net_total: string;
	commission_configured: boolean;
	commission_total: string | null;
	reversals: number;
}

export interface PartnerRow {
	partner_id: number | null;
	partner_name: string | null;
	deals: number;
	gross_total: string;
	discount_total: string;
	net_total: string;
}

/**
 * Реестр промокодов для платформы.
 *
 * Единственный интерфейс, показывающий рекламную аналитику. Право на него —
 * `promo.admin`; подтверждение сделки без ответа клиента и закрытие — отдельная
 * способность `promo.confirm`, которой нет ни у куратора, ни у партнёра.
 *
 * Открытие карточки пишется в журнал на стороне leget-api как просмотр
 * чувствительных данных: раскрытие рекламной аналитики — действие, а не чтение.
 */
export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = cookies.get(COOKIE_NAME);

	if (!token) {
		return {
			authenticated: false,
			promoCodes: null,
			summary: null,
			tab: 'registry',
			filters: EMPTY_FILTERS
		};
	}

	const tab = url.searchParams.get('tab') ?? 'registry';
	const openId = url.searchParams.get('open');

	const filters: PromoFilters = {
		status: url.searchParams.get('status'),
		client_id: url.searchParams.get('client_id'),
		curator_id: url.searchParams.get('curator_id'),
		partner_id: url.searchParams.get('partner_id'),
		utm_source: url.searchParams.get('utm_source'),
		from: url.searchParams.get('from'),
		to: url.searchParams.get('to')
	};

	// Вкладка решает, какой запрос делать: тянуть все три отчёта на каждой
	// загрузке значило бы платить за то, чего никто не открывал.
	if (tab === 'sources' || tab === 'curators' || tab === 'partners') {
		const result = await promoApi(
			`/admin/promo-codes/reports/${tab}${query({ from: filters.from, to: filters.to })}`,
			token
		);

		if (result.status === 401 || result.status === 403) {
			return { authenticated: false, promoCodes: null, summary: null, tab, filters };
		}

		return {
			authenticated: true,
			tab,
			filters,
			promoCodes: null,
			summary: null,
			sources: (result.data.rows as Paginated<SourceRow> | undefined) ?? null,
			curators: (result.data.curators as CuratorRow[] | undefined) ?? [],
			partners: (result.data.partners as PartnerRow[] | undefined) ?? [],
			rule: (result.data.rule as Record<string, unknown> | undefined) ?? null,
			apiError: result.ok ? null : result.message
		};
	}

	const list = await promoApi(
		`/admin/promo-codes${query({ ...filters, page: url.searchParams.get('page'), per_page: 50 })}`,
		token
	);

	if (list.status === 401 || list.status === 403) {
		cookies.delete(COOKIE_NAME, { path: '/admin' });
		return { authenticated: false, promoCodes: null, summary: null, tab, filters };
	}

	let selected: PromoCard | null = null;
	let history: PromoEventRow[] = [];

	if (openId) {
		const card = await promoApi(`/admin/promo-codes/${openId}`, token);
		if (card.ok) {
			selected = (card.data.promo_code ?? null) as PromoCard | null;
			history = (card.data.history ?? []) as PromoEventRow[];
		}
	}

	return {
		authenticated: true,
		tab,
		filters,
		selected,
		history,
		promoCodes: list.ok ? ((list.data.promo_codes ?? null) as Paginated<PromoCard> | null) : null,
		summary: list.ok ? ((list.data.summary ?? null) as Record<string, number> | null) : null,
		apiError: list.ok ? null : list.message
	};
};

export const actions = {
	/** Подтвердить сделку без ответа клиента. Основание обязательно. */
	confirm: async (event) => withReason(event, 'confirm', 'Не удалось подтвердить сделку.'),

	cancel: async (event) => withReason(event, 'cancel', 'Не удалось отменить промокод.'),

	refund: async (event) => withReason(event, 'refund', 'Не удалось оформить возврат.'),

	/** Закрыть сделку — платформа принимает её в аналитику и расчёт. */
	close: async ({ request, cookies }) => {
		const token = cookies.get(COOKIE_NAME);
		if (!token) return fail(401, { message: 'Сессия истекла.', action: 'close' });

		const form = await request.formData();
		const id = String(form.get('id') ?? '');

		const result = await promoPost(`/admin/promo-codes/${id}/close`, token, {});

		if (!result.ok) {
			return fail(result.status >= 400 ? result.status : 422, {
				message: result.message ?? 'Не удалось закрыть сделку.',
				id,
				action: 'close'
			});
		}

		return { success: true, id, action: 'close', message: null };
	}
} satisfies Actions;

async function withReason(
	{ request, cookies }: { request: Request; cookies: import('@sveltejs/kit').Cookies },
	action: 'confirm' | 'cancel' | 'refund',
	failure: string
) {
	const token = cookies.get(COOKIE_NAME);
	if (!token) return fail(401, { message: 'Сессия истекла.', action });

	const form = await request.formData();
	const id = String(form.get('id') ?? '');
	const reason = String(form.get('reason') ?? '').trim();

	// Правило продублировано здесь ради внятной ошибки поля: сервер откажет
	// и без этого, но доменной ошибкой вместо подсказки у поля.
	if (reason.length < 3) {
		return fail(422, { message: 'Основание обязательно.', id, action });
	}

	const result = await promoPost(`/admin/promo-codes/${id}/${action}`, token, { reason });

	if (!result.ok) {
		return fail(result.status >= 400 ? result.status : 422, {
			message: result.message ?? failure,
			id,
			action
		});
	}

	return { success: true, id, action, message: null };
}
