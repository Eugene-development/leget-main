import { getContext } from 'svelte';
import type { TransitionConfig } from 'svelte/transition';
import { PROMO_MOTION_CONTEXT, type PromoMotionContext } from './promo';

/** State transitions stay functional, including in portalled dialogs. */
export function withPromoMotion<N extends Element, P>(
	transition: (
		node: N,
		params?: P,
		options?: { direction: 'in' | 'out' | 'both' }
	) => TransitionConfig
) {
	const motion = getContext<PromoMotionContext | undefined>(PROMO_MOTION_CONTEXT);
	return (node: N, params?: P, options?: { direction: 'in' | 'out' | 'both' }) => {
		const config = transition(node, params, options);
		const reduced =
			typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
		return motion?.supported && (!motion.enabled || motion.editable || reduced)
			? { ...config, duration: 0, delay: 0 }
			: config;
	};
}
