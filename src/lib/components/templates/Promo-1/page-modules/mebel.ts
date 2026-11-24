import type { ComponentMap } from '../../types';
import MebelSidebar from '../pages/mebel/MebelSidebar.svelte';
import MebelHero from '../pages/mebel/MebelHero.svelte';
import MebelBenefits from '../pages/mebel/MebelBenefits/index.svelte';
import MebelSolutions from '../pages/mebel/MebelSolutions.svelte';
import MebelProcess from '../pages/mebel/MebelProcess/index.svelte';
import MebelLandingCTA from '../pages/mebel/MebelLandingCTA.svelte';

export default {
	MebelSidebar,
	MebelHero,
	MebelBenefits,
	MebelSolutions,
	MebelProcess,
	MebelCTA: MebelLandingCTA
} satisfies ComponentMap;
