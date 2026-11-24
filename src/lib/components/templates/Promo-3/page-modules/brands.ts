import type { ComponentMap } from '../../types';
import BrandsHero from '../pages/brands/Hero.svelte';
import BrandsList from '../pages/brands/BrandsList.svelte';
import BrandsCTA from '../pages/brands/CTA.svelte';

export default {
	Hero: BrandsHero,
	BrandsList: BrandsList,
	CTA: BrandsCTA
} satisfies ComponentMap;
