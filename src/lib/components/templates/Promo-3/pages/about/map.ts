import type { ComponentMap } from '../../../types';
import Hero from './Hero.svelte';
import Mission from './Mission.svelte';
import Values from './Values.svelte';
import Timeline from './Timeline.svelte';
import Team from './Team.svelte';
import Brands from './Brands.svelte';
import CTA from './CTA.svelte';

/** Блоки страницы «О компании» (Promo-3). Источник один — см. Promo-1/pages/about/map.ts. */
export const aboutMap: ComponentMap = {
	Hero,
	Mission,
	Values,
	Timeline,
	Team,
	Brands,
	CTA
};
