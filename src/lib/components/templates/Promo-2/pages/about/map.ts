import type { ComponentMap } from '../../../types';
import Hero from './Hero.svelte';
import LeaderSection from './LeaderSection.svelte';
import Mission from './Mission.svelte';
import Factory from './Factory.svelte';
import Video from './Video.svelte';
import Principles from './Principles.svelte';
import AboutCTA from './AboutCTA.svelte';

/** Блоки страницы «О компании» (Promo-2). Источник один — см. Promo-1/pages/about/map.ts. */
export const aboutMap: ComponentMap = {
	Hero,
	LeaderSection,
	Mission,
	Factory,
	Video,
	Principles,
	AboutCTA
};
