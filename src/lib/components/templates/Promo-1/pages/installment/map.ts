import type { ComponentMap } from '../../../types';
import InstallmentHero from './Hero.svelte';
import InstallmentPlans from './InstallmentPlans.svelte';
import InstallmentRequirements from './InstallmentRequirements.svelte';
import InstallmentSteps from './InstallmentSteps.svelte';
import InstallmentBanks from './InstallmentBanks.svelte';
import InstallmentFAQ from './InstallmentFAQ.svelte';
import InstallmentCTA from './InstallmentCTA.svelte';

/** Блоки страницы «Рассрочка» (Promo-1). Источник один — см. about/map.ts. */
export const installmentMap: ComponentMap = {
	InstallmentHero,
	InstallmentPlans,
	InstallmentRequirements,
	InstallmentSteps,
	InstallmentBanks,
	InstallmentFAQ,
	InstallmentCTA
};
