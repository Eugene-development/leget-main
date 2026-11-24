import type { ComponentMap } from '../../types';
import HomeHeroMain from '../pages/home/HeroMain/index.svelte';
import HomeMessage from '../pages/home/Message/index.svelte';
import HomePromoOffer from '../pages/home/PromoOffer/index.svelte';
import HomeEquipment from '../pages/home/Equipment/index.svelte';
import HomeStage from '../pages/home/Stage/index.svelte';
import HomeIncentives from '../pages/home/Incentives/index.svelte';
import HomeDirection from '../pages/home/Direction/index.svelte';
import HomePartnerOffers from '../pages/home/PartnerOffers/index.svelte';
import HomeBrands from '../pages/home/Brands/index.svelte';
import HomeFAQ from '../pages/home/HomeFAQ/index.svelte';

export default {
	HeroMain: HomeHeroMain,
	Message: HomeMessage,
	PromoOffer: HomePromoOffer,
	Equipment: HomeEquipment,
	Stage: HomeStage,
	Incentives: HomeIncentives,
	Direction: HomeDirection,
	PartnerOffers: HomePartnerOffers,
	Brands: HomeBrands,
	HomeFAQ
} satisfies ComponentMap;
