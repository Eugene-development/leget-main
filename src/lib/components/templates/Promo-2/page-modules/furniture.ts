import type { ComponentMap } from '../../types';
import FurnitureHero from '../pages/furniture/Hero.svelte';
import FurnitureIntro from '../pages/furniture/FurnitureIntro.svelte';
import BrandsSection from '../pages/furniture/BrandsSection.svelte';
import FurnitureCTA from '../pages/furniture/FurnitureCTA.svelte';

export default {
	Hero: FurnitureHero,
	FurnitureIntro: FurnitureIntro,
	BrandsSection: BrandsSection,
	FurnitureCTA: FurnitureCTA
} satisfies ComponentMap;
