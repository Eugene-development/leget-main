import type { ComponentMap } from '../../../types';
import GuaranteesHero from './Hero.svelte';
import GuaranteeTerms from './GuaranteeTerms.svelte';
import WhatsCovered from './WhatsCovered.svelte';
import HowToApply from './HowToApply.svelte';
import GuaranteesCTA from './GuaranteesCTA.svelte';

/** Блоки страницы «Гарантии» (Promo-1). Источник один — см. about/map.ts. */
export const guaranteesMap: ComponentMap = {
	GuaranteesHero,
	GuaranteeTerms,
	WhatsCovered,
	HowToApply,
	GuaranteesCTA
};
