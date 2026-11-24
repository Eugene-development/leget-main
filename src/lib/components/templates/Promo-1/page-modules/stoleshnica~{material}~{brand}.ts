import type { ComponentMap } from '../../types';
import StoleshnicaSidebar from '../pages/stoleshnica/StoleshnicaSidebar.svelte';
import StoleshnicaBrandHero from '../pages/stoleshnica/StoleshnicaBrandHero.svelte';
import BrandAbout from '../pages/_shared/BrandAbout.svelte';
import StoleshnicaBrands from '../pages/stoleshnica/StoleshnicaBrands.svelte';
import StoleshnicaServices from '../pages/stoleshnica/StoleshnicaServices.svelte';

export default {
	StoleshnicaSidebar,
	StoleshnicaBrandHero,
	BrandAbout,
	StoleshnicaBrands,
	StoleshnicaServices
} satisfies ComponentMap;
