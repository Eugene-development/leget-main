import assert from 'node:assert/strict';
import { test } from 'node:test';
import { gsap } from 'gsap';
import { loadServerModule } from './test-server-module.mjs';

// Use real GSAP tweens (including its internal from-start tweens), with a minimal
// page surface so pointer/focus/visibility cancellation can run deterministically.
for (const trigger of ['pointerdown', 'focusin', 'visibilitychange']) {
	for (const progress of [0, 0.5, 1]) {
		test(`${trigger} leaves text visible and settled at entrance progress ${progress}`, (t) => {
			const restores = [];
			let stop;
			t.after(() => {
				stop?.();
				gsap.ticker.sleep();
				restores.forEach((restore) => restore());
			});
			const root = new EventTarget();
			const page = new EventTarget();
			page.hidden = false;
			page.activeElement = null;
			root.contains = () => false;
			const title = {
				opacity: 1,
				clearProps: '',
				y: 0,
				closest: () => null,
				getBoundingClientRect: () => ({ width: 200, height: 50 })
			};
			root.querySelectorAll = (selector) => (selector === 'h1, h2' ? [title] : []);
			root.querySelector = () => title;
			const observers = [];
			class Observer {
				constructor(callback) {
					this.callback = callback;
					observers.push(this);
				}
				observe() {}
				unobserve() {}
				disconnect() {}
			}
			for (const [name, value] of Object.entries({
				document: page,
				getComputedStyle: () => ({
					visibility: 'visible',
					position: 'static',
					getPropertyValue: (token) => (token === '--ds-motion-lift' ? '40' : '1s')
				}),
				matchMedia: () => ({ matches: false }),
				IntersectionObserver: Observer,
				MutationObserver: class {
					observe() {}
					disconnect() {}
				},
				cancelAnimationFrame: () => {}
			})) {
				const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
				Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
				restores.push(() =>
					descriptor ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name]
				);
			}
			let cleanup;
			const { animatePromoBlock } = loadServerModule(
				new URL('../src/lib/motion/runtime.ts', import.meta.url),
				{
					gsap: {
						gsap: {
							...gsap,
							matchMedia: () => ({
								add: (_query, callback) => {
									cleanup = callback();
								},
								revert: () => cleanup?.()
							})
						}
					},
					'gsap/CustomEase': { CustomEase: { register() {} } }
				}
			);
			stop = animatePromoBlock(root, 'editorial', () => {});
			observers[0].callback([{ isIntersecting: true, target: title }]);
			const entrance = gsap.getTweensOf(title).find((tween) => !tween.data);
			assert.ok(entrance, 'the real entrance must be created');
			entrance.pause().progress(progress);
			if (trigger === 'visibilitychange') {
				page.hidden = true;
				page.dispatchEvent(new Event(trigger));
			} else root.dispatchEvent(new Event(trigger));
			assert.equal(title.opacity, 1);
			assert.equal(title.y, 0);
			root.dispatchEvent(new Event('pointerdown'));
			assert.equal(title.opacity, 1, 'subsequent clicks keep the final appearance');
			assert.equal(title.y, 0);
		});
	}
}
