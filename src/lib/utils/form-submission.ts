/** One instance per form. A retry keeps its key; a changed payload gets a new key. */
export type FormResult = {
	success: true;
	id: string;
	status: string;
	mail_status: 'pending' | 'sending' | 'sent' | 'failed';
	message: string;
};
type Pending = { key: string; promise: Promise<FormResult> | null };

/** Advertising identifiers only; never read contact fields, messages or credential URLs. */
export function formAttribution(): Record<string, string> {
	if (typeof window === 'undefined' || typeof document === 'undefined') return {};
	if (window.location.pathname.replace(/\/+$/, '') === '/reset-password') return {};
	const cookies = new Map(
		document.cookie.split(';').map((entry) => {
			const index = entry.indexOf('=');
			return [entry.slice(0, index).trim(), entry.slice(index + 1)];
		})
	);
	let first: Record<string, unknown> = {};
	try {
		const stored = JSON.parse(decodeURIComponent(cookies.get('leget_attr') ?? 'null'));
		if (stored?.first && typeof stored.first === 'object') first = stored.first;
	} catch {
		/* Attribution must never interrupt intake. */
	}
	const query = new URL(window.location.href).searchParams;
	const hasFirst = Object.keys(first).length > 0;
	const result: Record<string, string> = {};
	for (const field of ['utm_source', 'utm_medium', 'utm_campaign']) {
		const value = hasFirst ? first[field] : query.get(field);
		if (typeof value === 'string' && value.trim()) result[field] = value.trim().slice(0, 120);
	}
	const ids = {
		yclid: hasFirst ? first.yclid : query.get('yclid'),
		metrika_client_id: cookies.get('_ym_uid')
	};
	for (const [field, value] of Object.entries(ids)) {
		if (typeof value === 'string' && /^[0-9]{1,128}$/.test(value)) result[field] = value;
	}
	return result;
}

/** Recovery credentials must never become request attribution or a retry fingerprint. */
export function formSourceUrl(sourceUrl: string, currentUrl?: string): string {
	const isRecovery = (url: URL) => url.pathname.replace(/\/+$/, '') === '/reset-password';
	try {
		const current = currentUrl ? new URL(currentUrl) : undefined;
		if (current && isRecovery(current)) return `${current.origin}${current.pathname}`.slice(0, 500);
		const source = new URL(sourceUrl, currentUrl);
		if (isRecovery(source)) return `${source.origin}${source.pathname}`.slice(0, 500);
	} catch {
		// Keep ordinary attribution compatible with existing callers.
	}
	return sourceUrl.slice(0, 500);
}

/** Read the visible heading while the submit event still has its currentTarget. */
export function formHeading(event?: Event): string | undefined {
	if (typeof HTMLElement === 'undefined') return undefined;
	let element: HTMLElement | null =
		event?.currentTarget instanceof HTMLElement ? event.currentTarget : null;
	while (element && element !== document.body) {
		const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
		const text = heading?.textContent?.replace(/\s+/g, ' ').trim();
		if (text) return text.slice(0, 160);
		element = element.parentElement;
	}
	return undefined;
}

export function createFormSender(formId: string) {
	const pending = new Map<string, Pending>();
	let capturedAttribution: Record<string, string> | undefined;
	return async function sendForm(
		payload: FormData | Record<string, string | number | null | undefined>,
		endpoint = 'service-request',
		event?: Event
	): Promise<FormResult> {
		const body = payload instanceof FormData ? payload : new FormData();
		if (!(payload instanceof FormData)) {
			for (const [key, value] of Object.entries(payload)) {
				if (value !== null && value !== undefined) body.append(key, String(value));
			}
		}
		body.set('form_id', formId);
		if (!body.has('attribution')) {
			const attribution = (capturedAttribution ??= formAttribution());
			if (Object.keys(attribution).length) body.set('attribution', JSON.stringify(attribution));
		}
		const title = formHeading(event);
		if (title) body.set('form_title', title);
		const currentUrl = typeof window !== 'undefined' ? window.location.href : undefined;
		const sourceUrl = body.get('source_url');
		if (typeof sourceUrl === 'string') body.set('source_url', formSourceUrl(sourceUrl, currentUrl));
		else if (currentUrl) body.set('source_url', formSourceUrl(currentUrl, currentUrl));
		const signature: [string, string][] = [];
		for (const [key, value] of body.entries()) {
			if (key === 'captcha_token' || key === 'submission_key') continue;
			const item =
				typeof value === 'string'
					? value
					: Array.from(
							new Uint8Array(await crypto.subtle.digest('SHA-256', await value.arrayBuffer()))
						).join(',');
			signature.push([key, item]);
		}
		const fingerprint = JSON.stringify(signature.sort((a, b) => a[0].localeCompare(b[0])));
		let state = pending.get(fingerprint);
		if (!state) {
			state = { key: crypto.randomUUID(), promise: null };
			if (pending.size >= 20) pending.delete(pending.keys().next().value!);
			pending.set(fingerprint, state);
		}
		if (state.promise) return state.promise;
		body.set('submission_key', state.key);
		state.promise = (async () => {
			try {
				const target = endpoint.startsWith('crm-')
					? `${typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/crm') ? '/admin/crm' : '/crm'}/api/intake/${endpoint === 'crm-offline' ? 'offline' : 'apply'}`
					: `/forms/${endpoint}`;
				const response = await fetch(target, {
					method: 'POST',
					headers: { Accept: 'application/json' },
					body,
					signal: AbortSignal.timeout(45000)
				});
				const result = await response.json().catch(() => null);
				if (!response.ok || !result?.success || !result?.id) {
					const staleEstimate =
						response.status === 422 && Array.isArray(result?.errors?.estimate_version);
					const error = new Error(
						staleEstimate
							? 'Правила расчёта изменились. Рассчитайте стоимость ещё раз.'
							: response.status === 429
								? 'Слишком много попыток. Подождите минуту.'
								: 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.'
					);
					if (staleEstimate) Object.assign(error, { code: 'estimate_stale' });
					throw error;
				}
				pending.delete(fingerprint);
				return result as FormResult;
			} finally {
				state!.promise = null;
			}
		})();
		return state.promise;
	};
}
