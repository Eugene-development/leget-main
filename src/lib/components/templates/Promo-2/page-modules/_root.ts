import type { ComponentMap } from '../../types';
import HomeHero from '../pages/home/Hero.svelte';
import HomeStyles from '../pages/home/Styles.svelte';
import HomeVideo from '../pages/home/Video.svelte';
import HomeAdvantages from '../pages/home/Advantages.svelte';
import HomeDetails from '../pages/home/Details.svelte';
import HomeCTA from '../pages/home/CTA.svelte';

export default {
	Hero: HomeHero,
	Styles: HomeStyles,
	Video: HomeVideo,
	Advantages: HomeAdvantages,
	Details: HomeDetails,
	CTA: HomeCTA
} satisfies ComponentMap;
