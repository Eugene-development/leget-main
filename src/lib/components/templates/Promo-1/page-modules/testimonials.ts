import type { ComponentMap } from '../../types';
import TestimonialsHero from '../pages/testimonials/Hero.svelte';
import TestimonialsSummary from '../pages/testimonials/TestimonialsSummary.svelte';
import TestimonialsGrid from '../pages/testimonials/TestimonialsGrid.svelte';

export default {
	Hero: TestimonialsHero,
	TestimonialsSummary,
	TestimonialsGrid
} satisfies ComponentMap;
