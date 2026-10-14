import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import type { MotionProfile } from './promo';

gsap.registerPlugin(CustomEase);

type Role = 'title' | 'body' | 'card' | 'image' | 'rule' | 'number';
const cards =
	'.grid > article, .grid > li, .grid > a, .grid > div, .space-y-4 > div, .space-y-6 > div, .faq-item, details, .stage-card, .p1-stage-step, .p1-stage-row, .ledger-row, .tile, .uni-note, .ms-item, .ab-card, .ct-card-enter, .gt-card, .it-card, .tm-card, .vc-card';
const rules =
	'.ab-rule, .ct-rule, .gt-rule, .it-rule, .tm-rule, .vc-rule, .nf-rule, .ph-rule, .wi-rule, .pca-rule, .p1-stage-rule, .contact-route__progress';

/** Content remains visible until a short, once-per-element entrance actually starts. */
export function animatePromoBlock(
	root: HTMLElement,
	profile: MotionProfile,
	setPaused: (paused: boolean) => void
) {
	const media = gsap.matchMedia();
	media.add(
		'(prefers-reduced-motion: no-preference)',
		() => {
			const styles = getComputedStyle(root);
			const seconds = (token: string) => {
				const value = styles.getPropertyValue(token).trim();
				return (parseFloat(value) || 0) / (value.endsWith('ms') ? 1000 : 1);
			};
			const duration = seconds('--ds-motion-duration-fast');
			const detail = seconds('--ds-motion-duration-ui-slow');
			const step = seconds('--ds-motion-stagger-step');
			const lift =
				(parseFloat(styles.getPropertyValue('--ds-motion-lift')) || 0) *
				(matchMedia('(max-width: 767px)').matches ? 0.45 : 0.8);
			const curve = styles.getPropertyValue('--ds-motion-ease').match(/cubic-bezier\(([^)]+)\)/);
			const ease = curve ? CustomEase.create('', curve[1]) : 'power3.out';
			const context = gsap.context(() => {}, root);
			const known = new WeakSet<HTMLElement>();
			const roles = new WeakMap<HTMLElement, { role: Role; index: number }>();
			const restoreNumbers: Array<() => void> = [];
			let frame = 0;
			let interacted = false;
			let inViewport = true;

			const eligible = (element: HTMLElement) => {
				if (
					element.closest(
						'[role="dialog"], [aria-hidden="true"], .component-controls-overlay, .editable-field-controls, .pointer-events-none'
					)
				)
					return false;
				const rect = element.getBoundingClientRect();
				const css = getComputedStyle(element);
				return (
					rect.width > 0 &&
					rect.height > 0 &&
					css.visibility !== 'hidden' &&
					css.position !== 'fixed'
				);
			};
			const select = (selector: string) =>
				Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(eligible);
			const outermost = (elements: HTMLElement[]) =>
				elements.filter(
					(element) => !elements.some((other) => other !== element && other.contains(element))
				);

			function countUp(element: HTMLElement) {
				const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
				const texts: Node[] = [];
				let current: Node | null;
				while ((current = walker.nextNode())) {
					if (current.nodeValue?.trim()) texts.push(current);
				}
				if (texts.length !== 1) return;
				const text = texts[0];
				const original = text.nodeValue ?? '';
				const match = original.trim().match(/^(\d[\d\s]*(?:[.,]\d+)?)([%+]?)$/);
				if (!match) return;
				const value = Number(match[1].replace(/\s/g, '').replace(',', '.'));
				if (!Number.isFinite(value) || value < 2) return;
				const precision = match[1].split(/[.,]/)[1]?.length ?? 0;
				const counter = { value: 0 };
				let last = original;
				const restore = () => {
					if (text.nodeValue === last) text.nodeValue = original;
				};
				restoreNumbers.push(restore);
				gsap.to(counter, {
					value,
					duration: detail,
					ease,
					onUpdate() {
						last =
							counter.value.toLocaleString('ru-RU', {
								useGrouping: /\s/.test(match[1]),
								maximumFractionDigits: precision
							}) + match[2];
						text.nodeValue = last;
					},
					onComplete: restore
				});
			}

			function play(element: HTMLElement) {
				if (interacted || document.hidden || root.contains(document.activeElement)) return;
				const { role, index } = roles.get(element)!;
				context.add(() => {
					if (role === 'number') {
						countUp(element);
						return;
					}
					const vars: gsap.TweenVars = {
						duration: role === 'body' ? detail : duration,
						ease,
						clearProps: 'transform,translate,rotate,scale,opacity,clipPath',
						delay: Math.min(index * step, detail * 0.5)
					};
					if (role === 'rule') {
						vars.scaleX = 0.15;
						vars.transformOrigin = 'left center';
						vars.clearProps = 'transform,translate,rotate,scale,transformOrigin';
					} else if (role === 'image') {
						vars.scale = profile === 'hero' ? 1.035 : 1.025;
						vars.clearProps = 'transform,translate,rotate,scale,clipPath';
						if (profile === 'gallery') vars.clipPath = 'inset(0 0 8% 0)';
					} else {
						vars.opacity = profile === 'form' || profile === 'faq' ? 0.65 : 0.35;
						if (profile === 'steps' || profile === 'sidebar')
							vars.x = (index % 2 ? 1 : -1) * lift * (profile === 'sidebar' ? 0.25 : 0.55);
						else if (profile === 'brands') vars.scale = 0.94;
						else if (profile === 'cards') {
							vars.y = lift * 0.4;
							vars.scale = 0.985;
						} else if (profile === 'gallery') {
							vars.y = lift * 0.25;
						} else vars.y = lift * (profile === 'form' || profile === 'faq' ? 0.15 : 0.45);
					}
					gsap.from(element, vars);
				});
			}

			const observer =
				typeof IntersectionObserver === 'undefined'
					? null
					: new IntersectionObserver(
							(entries) => {
								for (const entry of entries) {
									if (!entry.isIntersecting) continue;
									observer?.unobserve(entry.target);
									play(entry.target as HTMLElement);
								}
							},
							{ threshold: 0.01, rootMargin: '0px 0px -5% 0px' }
						);

			function add(elements: HTMLElement[], role: Role) {
				elements.forEach((element, index) => {
					if (known.has(element)) return;
					known.add(element);
					roles.set(element, { role, index });
					if (observer) observer.observe(element);
					else play(element);
				});
			}

			function discover() {
				// Delayed network-fed lists join the same lifecycle without replaying existing items.
				const groups = outermost(
					select(cards).filter(
						(el) =>
							el.querySelector('h3, img, button, a, .tabular-nums') ||
							el.matches(
								'.stage-card, .p1-stage-step, .p1-stage-row, .ledger-row, .tile, .uni-note, .ms-item'
							)
					)
				);
				const outsideGroups = (el: HTMLElement) => !groups.some((group) => group.contains(el));
				add(select('h1, h2').filter(outsideGroups), 'title');
				if (profile === 'sidebar') add(select('.ms-nav a, .ms-item, .ms-fab'), 'card');
				else if (profile === 'model')
					add(select('p, button').filter(outsideGroups).slice(0, 4), 'body');
				else {
					add(groups, 'card');
					add(
						select('p')
							.filter(outsideGroups)
							.filter((el) => !el.closest('form, [role="tabpanel"]'))
							.slice(0, 6),
						'body'
					);
					if (profile === 'hero' || profile === 'gallery' || profile === 'editorial')
						add(
							select('img.object-cover')
								.filter((el) => !el.closest('form'))
								.slice(0, 12),
							'image'
						);
					if (profile === 'form')
						add(outermost(select('form, .contact-route__phone-wrap')), 'body');
				}
				// Structural lines may be aria-hidden; they are intentionally animated as decoration.
				add(
					Array.from(root.querySelectorAll<HTMLElement>(rules)).filter(
						(el) => el.getBoundingClientRect().width > 0
					),
					'rule'
				);
				if (profile === 'statistics') add(select('.tabular-nums'), 'number');
				if (!groups.length && !root.querySelector('h1, h2'))
					add(select('section > div, article, aside').slice(0, 2), 'body');
			}

			const finish = () => {
				interacted = true;
				observer?.disconnect();
				context.getTweens().forEach((tween: gsap.core.Tween) => tween.progress(1));
			};
			const visibility = () => {
				setPaused(document.hidden || !inViewport);
				if (document.hidden) finish();
			};
			const regions = Array.from(root.querySelectorAll<HTMLElement>('section, aside')).filter(
				(el) => !el.closest('[role="dialog"]')
			);
			const visibleRegions = new Set<Element>();
			const viewportObserver =
				typeof IntersectionObserver === 'undefined'
					? null
					: new IntersectionObserver((entries) => {
							entries.forEach((entry) =>
								entry.isIntersecting
									? visibleRegions.add(entry.target)
									: visibleRegions.delete(entry.target)
							);
							inViewport = visibleRegions.size > 0;
							visibility();
						});
			regions.forEach((region) => viewportObserver?.observe(region));
			const mutations = new MutationObserver(() => {
				cancelAnimationFrame(frame);
				frame = requestAnimationFrame(discover);
			});
			mutations.observe(root, { childList: true, subtree: true });
			root.addEventListener('focusin', finish);
			root.addEventListener('pointerdown', finish, { passive: true });
			document.addEventListener('visibilitychange', visibility);
			discover();
			visibility();
			return () => {
				cancelAnimationFrame(frame);
				observer?.disconnect();
				viewportObserver?.disconnect();
				mutations.disconnect();
				root.removeEventListener('focusin', finish);
				root.removeEventListener('pointerdown', finish);
				document.removeEventListener('visibilitychange', visibility);
				context.revert();
				restoreNumbers.forEach((restore) => restore());
			};
		},
		root
	);
	return () => {
		media.revert();
		setPaused(false);
	};
}
