import type { ComponentMap } from '../../types';
import StylesHero from '../pages/styles/Hero.svelte';
import StylesGrid from '../pages/styles/StylesGrid.svelte';
import StylesCTA from '../pages/styles/StylesCTA.svelte';

export default {
	Hero: StylesHero,
	StylesGrid: StylesGrid,
	StylesCTA: StylesCTA
} satisfies ComponentMap;
