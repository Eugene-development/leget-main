import type { ComponentMap } from '../../types';
import SantehnikaSidebar from '../pages/santehnika/SantehnikaSidebar.svelte';
import SantehnikaBrandHero from '../pages/santehnika/SantehnikaBrandHero.svelte';
import BrandAbout from '../pages/_shared/BrandAbout.svelte';
import SantehnikaBenefits from '../pages/santehnika/SantehnikaBenefits.svelte';
import SantehnikaCTA from '../pages/santehnika/SantehnikaCTA.svelte';

export default {
	SantehnikaSidebar,
	SantehnikaBrandHero,
	BrandAbout,
	SantehnikaBenefits,
	SantehnikaCTA
} satisfies ComponentMap;
