import type { ComponentMap } from '../../types';
import ActionsHero from '../pages/actions/Hero.svelte';
import ActionsCards from '../pages/actions/ActionsCards.svelte';
import ActionsCardsExtra from '../pages/actions/ActionsCardsExtra.svelte';
import ActionsBanner from '../pages/actions/ActionsBanner.svelte';
import ActionsCTA from '../pages/actions/ActionsCTA/index.svelte';

export default {
	Hero: ActionsHero,
	ActionsCards,
	ActionsCardsExtra,
	ActionsBanner,
	ActionsCTA
} satisfies ComponentMap;
