import type { ComponentMap } from '../../types';
import MaterialsHero from '../pages/materials/Hero.svelte';
import MaterialsCategories from '../pages/materials/Categories.svelte';
import MaterialsHowWeWork from '../pages/materials/HowWeWork.svelte';
import MaterialsCTA from '../pages/materials/CTA.svelte';

export default {
	Hero: MaterialsHero,
	Categories: MaterialsCategories,
	HowWeWork: MaterialsHowWeWork,
	CTA: MaterialsCTA
} satisfies ComponentMap;
