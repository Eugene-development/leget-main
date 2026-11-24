import type { ComponentMap } from '../../types';
import AboutHero from '../pages/about/Hero.svelte';
import AboutText from '../pages/about/Text/index.svelte';
import AboutStatistics from '../pages/about/Statistics.svelte';
import AboutMission from '../pages/about/Mission/index.svelte';
import AboutValues from '../pages/about/Values.svelte';
import AboutWhyUs from '../pages/about/WhyUs.svelte';
import AboutCTA from '../pages/about/AboutCTA.svelte';

export default {
	Hero: AboutHero,
	Text: AboutText,
	Statistics: AboutStatistics,
	Mission: AboutMission,
	Values: AboutValues,
	WhyUs: AboutWhyUs,
	AboutCTA
} satisfies ComponentMap;
