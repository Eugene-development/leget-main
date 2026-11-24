import type { ComponentMap } from '../../types';
import ShowroomsHero from '../pages/showrooms/Hero.svelte';
import ShowroomsMap from '../pages/showrooms/ShowroomsMap.svelte';
import ShowroomsCTA from '../pages/showrooms/ShowroomsCTA.svelte';

export default {
	Hero: ShowroomsHero,
	ShowroomsMap: ShowroomsMap,
	ShowroomsCTA: ShowroomsCTA
} satisfies ComponentMap;
