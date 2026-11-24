import type { ComponentMap } from '../../types';
import CollectionsHero from '../pages/collections/Hero.svelte';
import CollectionsList from '../pages/collections/CollectionsList.svelte';
import CollectionsCTA from '../pages/collections/CTA.svelte';

export default {
	Hero: CollectionsHero,
	CollectionsList: CollectionsList,
	CTA: CollectionsCTA
} satisfies ComponentMap;
