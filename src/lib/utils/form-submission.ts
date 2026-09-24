/** One instance per form. A retry keeps its key; a changed payload gets a new key. */
export type FormResult = {
	success: true;
	id: string;
	status: string;
	mail_status: 'pending' | 'sending' | 'sent' | 'failed';
	message: string;
};
type Pending = { key: string; promise: Promise<FormResult> | null };
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
		const title = formHeading(event);
		if (title) body.set('form_title', title);
		if (!body.has('source_url') && typeof window !== 'undefined')
			body.set('source_url', window.location.href.slice(0, 500));
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
					const error = new Error(
						response.status === 429
							? 'Слишком много попыток. Подождите минуту.'
							: 'Не удалось отправить заявку. Проверьте данные и попробуйте ещё раз.'
					);
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
