import type { ComponentMap } from '../../types';
import AboutHero from '../pages/about/Hero.svelte';
import AboutMission from '../pages/about/Mission.svelte';
import AboutValues from '../pages/about/Values.svelte';
import AboutTimeline from '../pages/about/Timeline.svelte';
import AboutTeam from '../pages/about/Team.svelte';
import AboutBrands from '../pages/about/Brands.svelte';
import AboutCTA from '../pages/about/CTA.svelte';

export default {
	Hero: AboutHero,
	Mission: AboutMission,
	Values: AboutValues,
	Timeline: AboutTimeline,
	Team: AboutTeam,
	Brands: AboutBrands,
	CTA: AboutCTA
} satisfies ComponentMap;
