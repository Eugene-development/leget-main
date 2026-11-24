import type { ComponentMap } from '../../types';
import CareersHero from '../pages/careers/Hero.svelte';
import CareersPerks from '../pages/careers/CareersPerks.svelte';
import CareersVacancies from '../pages/careers/CareersVacancies.svelte';
import CareersForm from '../pages/careers/CareersForm.svelte';

export default {
	Hero: CareersHero,
	CareersPerks: CareersPerks,
	CareersVacancies: CareersVacancies,
	CareersForm: CareersForm
} satisfies ComponentMap;
