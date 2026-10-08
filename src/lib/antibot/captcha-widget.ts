import type { SmartCaptchaApi } from './smartcaptcha.js';

export type CaptchaState = 'loading' | 'ready' | 'verified' | 'expired' | 'error';

/** One widget owns its subscriptions; the SDK loader is shared by all forms. */
export function createCaptchaWidget(options: {
	container: HTMLElement;
	sitekey: string;
	load: () => Promise<SmartCaptchaApi | undefined>;
	onverify: (token: string) => void;
	onerror: (error: unknown) => void;
	onstate: (state: CaptchaState) => void;
}) {
	let disposed = false;
	let generation = 0;
	let widget: { api: SmartCaptchaApi; id: number } | undefined;
	let subscriptions: Array<() => void> = [];

	function clearWidget() {
		generation++;
		const previous = widget;
		widget = undefined;
		for (const unsubscribe of subscriptions.splice(0)) {
			try {
				unsubscribe();
			} catch {
				/* Continue cleaning up the remaining subscriptions. */
			}
		}
		try {
			previous?.api.destroy(previous.id);
		} catch {
			/* A broken SDK must not block retry/unmount. */
		}
		options.container.replaceChildren();
	}

	function fail(error: unknown) {
		clearWidget();
		options.onverify('');
		options.onstate('error');
		options.onerror(error);
	}

	async function retry() {
		if (disposed) return;
		clearWidget();
		const attempt = generation;
		const current = () => !disposed && generation === attempt;
		options.onverify('');
		options.onstate('loading');
		try {
			const api = await options.load();
			if (!current()) return;
			if (!api) throw new Error('SmartCaptcha API unavailable');
			options.onstate('ready');
			const id = api.render(options.container, {
				sitekey: options.sitekey,
				hl: 'ru',
				callback: (token) => {
					if (!current()) return;
					options.onverify(token);
					options.onstate(token ? 'verified' : 'ready');
				}
			});
			widget = { api, id };
			for (const event of ['network-error', 'javascript-error'] as const) {
				subscriptions.push(
					api.subscribe(id, event, (error) => {
						if (current()) fail(error ?? new Error(`SmartCaptcha ${event}`));
					})
				);
			}
			subscriptions.push(
				api.subscribe(id, 'token-expired', () => {
					if (!current()) return;
					options.onverify('');
					options.onstate('expired');
				})
			);
		} catch (error) {
			if (current()) fail(error);
		}
	}

	function reset() {
		if (disposed) return;
		options.onverify('');
		if (!widget) return;
		try {
			options.onstate('ready');
			widget.api.reset(widget.id);
		} catch (error) {
			fail(error);
		}
	}

	return {
		retry,
		reset,
		destroy() {
			disposed = true;
			clearWidget();
			options.onverify('');
		}
	};
}
