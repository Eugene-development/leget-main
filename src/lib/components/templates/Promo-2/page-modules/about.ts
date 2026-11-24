import type { ComponentMap } from '../../types';
import AboutHero from '../pages/about/Hero.svelte';
import AboutLeaderSection from '../pages/about/LeaderSection.svelte';
import AboutMission from '../pages/about/Mission.svelte';
import AboutFactory from '../pages/about/Factory.svelte';
import AboutPrinciples from '../pages/about/Principles.svelte';
import AboutCTA from '../pages/about/AboutCTA.svelte';

export default {
	Hero: AboutHero,
	LeaderSection: AboutLeaderSection,
	Mission: AboutMission,
	Factory: AboutFactory,
	Principles: AboutPrinciples,
	AboutCTA: AboutCTA
} satisfies ComponentMap;
