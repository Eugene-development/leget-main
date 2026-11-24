import type { ComponentMap } from '../../types';
import VacanciesHero from '../pages/vacancies/Hero.svelte';
import VacanciesList from '../pages/vacancies/VacanciesList.svelte';
import VacanciesForm from '../pages/vacancies/Form.svelte';

export default {
	Hero: VacanciesHero,
	VacanciesList: VacanciesList,
	Form: VacanciesForm
} satisfies ComponentMap;
