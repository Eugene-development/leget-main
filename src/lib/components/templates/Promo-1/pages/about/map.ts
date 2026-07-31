import type { ComponentMap } from '../../../types';
import Hero from './Hero.svelte';
import Text from './Text.svelte';
import Statistics from './Statistics.svelte';
import Mission from './Mission.svelte';
import Values from './Values.svelte';
import WhyUs from './WhyUs.svelte';
import AboutCTA from './AboutCTA.svelte';

/**
 * Блоки страницы «О компании» (Promo-1).
 *
 * Единственный источник карты: её читают и ../../index.ts (реестр шаблона для
 * catch-all маршрута), и src/routes/about (собственный маршрут страницы).
 * Не дублируй список в реестре — иначе карты разъедутся.
 */
export const aboutMap: ComponentMap = {
	Hero,
	Text,
	Statistics,
	Mission,
	Values,
	WhyUs,
	AboutCTA
};
