import type { ComponentMap } from '../../types';
import InstallmentHero from '../pages/installment/Hero.svelte';
import InstallmentPlans from '../pages/installment/InstallmentPlans.svelte';
import InstallmentRequirements from '../pages/installment/InstallmentRequirements.svelte';
import InstallmentSteps from '../pages/installment/InstallmentSteps.svelte';
import InstallmentBanks from '../pages/installment/InstallmentBanks.svelte';
import InstallmentFAQ from '../pages/installment/InstallmentFAQ.svelte';
import InstallmentCTA from '../pages/installment/InstallmentCTA.svelte';

export default {
	InstallmentHero: InstallmentHero,
	InstallmentPlans,
	InstallmentRequirements,
	InstallmentSteps,
	InstallmentBanks,
	InstallmentFAQ,
	InstallmentCTA
} satisfies ComponentMap;
