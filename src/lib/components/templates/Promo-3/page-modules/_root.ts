import type { ComponentMap } from '../../types';
import HomeHero from '../pages/home/Hero.svelte';
import HomeCategories from '../pages/home/Categories.svelte';
import HomeBanner from '../pages/home/Banner.svelte';
import HomeCollections from '../pages/home/Collections.svelte';
import HomeAdvantages from '../pages/home/Advantages.svelte';
import HomeCTA from '../pages/home/CTA.svelte';

export default {
	Hero: HomeHero,
	Categories: HomeCategories,
	Banner: HomeBanner,
	Collections: HomeCollections,
	Advantages: HomeAdvantages,
	CTA: HomeCTA
} satisfies ComponentMap;
