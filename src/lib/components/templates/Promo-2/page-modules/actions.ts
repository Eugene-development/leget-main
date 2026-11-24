import type { ComponentMap } from '../../types';
import ActionsHero from '../pages/actions/Hero/index.svelte';
import ActionsTimer from '../pages/actions/ActionsTimer.svelte';
import ActionsCards from '../pages/actions/ActionsCards.svelte';
import ActionsBanner from '../pages/actions/ActionsBanner.svelte';
import ActionsSteps from '../pages/actions/ActionsSteps.svelte';
import ActionsCTA from '../pages/actions/ActionsCTA.svelte';

export default {
	Hero: ActionsHero,
	ActionsTimer: ActionsTimer,
	ActionsCards: ActionsCards,
	ActionsBanner: ActionsBanner,
	ActionsSteps: ActionsSteps,
	ActionsCTA: ActionsCTA
} satisfies ComponentMap;
