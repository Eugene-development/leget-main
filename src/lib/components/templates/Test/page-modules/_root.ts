import type { ComponentMap } from '../../types';
import HomeHero from '../pages/home/Hero.svelte';
import HomeText from '../pages/home/Text.svelte';

export default {
	Hero: HomeHero,
	Text: HomeText
} satisfies ComponentMap;
