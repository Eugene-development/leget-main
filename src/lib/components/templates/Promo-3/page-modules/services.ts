import type { ComponentMap } from '../../types';
import ServicesHero from '../pages/services/Hero.svelte';
import ServicesGrid from '../pages/services/ServicesGrid.svelte';
import ServicesCTA from '../pages/services/CTA.svelte';

export default {
	Hero: ServicesHero,
	ServicesGrid: ServicesGrid,
	CTA: ServicesCTA
} satisfies ComponentMap;
