import type { ComponentMap } from '../../types';
import NewsHero from '../pages/news/Hero.svelte';
import NewsList from '../pages/news/NewsList.svelte';
import NewsCTA from '../pages/news/NewsCTA.svelte';

export default {
	Hero: NewsHero,
	NewsList: NewsList,
	NewsCTA: NewsCTA
} satisfies ComponentMap;
