import type { ComponentMap } from '../../types';
import PartnershipHero from '../pages/partnership/Hero.svelte';
import WhoWeInvite from '../pages/partnership/WhoWeInvite.svelte';
import ForManufacturers from '../pages/partnership/ForManufacturers.svelte';
import PartnershipBenefits from '../pages/partnership/Benefits.svelte';
import HowToStart from '../pages/partnership/HowToStart.svelte';
import PartnershipCTA from '../pages/partnership/PartnershipCTA.svelte';

export default {
	PartnershipHero: PartnershipHero,
	WhoWeInvite,
	ForManufacturers,
	Benefits: PartnershipBenefits,
	HowToStart,
	PartnershipCTA
} satisfies ComponentMap;
