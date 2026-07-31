import type { ComponentMap } from '../../../types';
import Hero from './Hero.svelte';
import TestimonialsSummary from './TestimonialsSummary.svelte';
import TestimonialsGrid from './TestimonialsGrid.svelte';

/** Блоки страницы «Отзывы» (Promo-1). Источник один — см. about/map.ts. */
export const testimonialsMap: ComponentMap = {
	Hero,
	TestimonialsSummary,
	TestimonialsGrid
};
