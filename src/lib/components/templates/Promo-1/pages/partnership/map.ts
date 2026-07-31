import type { ComponentMap } from '../../../types';
import PartnershipHero from './Hero.svelte';
import WhoWeInvite from './WhoWeInvite.svelte';
import ForManufacturers from './ForManufacturers.svelte';
import Benefits from './Benefits.svelte';
import HowToStart from './HowToStart.svelte';
import PartnershipCTA from './PartnershipCTA.svelte';

/** Блоки страницы «Партнёрство» (Promo-1). Источник один — см. about/map.ts. */
export const partnershipMap: ComponentMap = {
	PartnershipHero,
	WhoWeInvite,
	ForManufacturers,
	Benefits,
	HowToStart,
	PartnershipCTA
};
