import type { ComponentMap } from '../../types';
import WardrobesHero from '../pages/wardrobes/Hero.svelte';
import WardrobesGallery from '../pages/wardrobes/WardrobesGallery.svelte';
import WardrobeFeatures from '../pages/wardrobes/WardrobeFeatures.svelte';
import WardrobeTypes from '../pages/wardrobes/WardrobeTypes.svelte';
import WardrobesCTA from '../pages/wardrobes/WardrobesCTA.svelte';

export default {
	Hero: WardrobesHero,
	WardrobesGallery: WardrobesGallery,
	WardrobeFeatures: WardrobeFeatures,
	WardrobeTypes: WardrobeTypes,
	WardrobesCTA: WardrobesCTA
} satisfies ComponentMap;
