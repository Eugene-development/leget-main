import type { ComponentMap } from '../../types';
import GuaranteesHero from '../pages/guarantees/Hero.svelte';
import GuaranteeTerms from '../pages/guarantees/GuaranteeTerms.svelte';
import WhatsCovered from '../pages/guarantees/WhatsCovered.svelte';
import HowToApply from '../pages/guarantees/HowToApply.svelte';
import GuaranteesCTA from '../pages/guarantees/GuaranteesCTA.svelte';

export default {
	GuaranteesHero: GuaranteesHero,
	GuaranteeTerms,
	WhatsCovered,
	HowToApply,
	GuaranteesCTA
} satisfies ComponentMap;
