import type { ComponentMap } from '../../types';
import FacadesHero from '../pages/facades/Hero.svelte';
import FacadesCatalog from '../pages/facades/FacadesCatalog/index.svelte';
import FacadesCTA from '../pages/facades/FacadesCTA.svelte';

export default {
	Hero: FacadesHero,
	FacadesCatalog: FacadesCatalog,
	FacadesCTA: FacadesCTA
} satisfies ComponentMap;
