import type { ComponentMap } from '../../types';
import KitchensHero from '../pages/kitchens/Hero.svelte';
import KitchensGallery from '../pages/kitchens/KitchensGallery.svelte';
import ProductionCycle from '../pages/kitchens/ProductionCycle.svelte';
import KitchenStyles from '../pages/kitchens/KitchenStyles.svelte';
import KitchensCTA from '../pages/kitchens/KitchensCTA.svelte';

export default {
	Hero: KitchensHero,
	KitchensGallery: KitchensGallery,
	ProductionCycle: ProductionCycle,
	KitchenStyles: KitchenStyles,
	KitchensCTA: KitchensCTA
} satisfies ComponentMap;
