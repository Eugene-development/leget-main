import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components
import Header from './layout/Header.svelte';
import Footer from './layout/Footer.svelte';
export { Header, Footer };

// Home page components
import HomeHero from './pages/home/Hero.svelte';
import HomeCategories from './pages/home/Categories.svelte';
import HomeBanner from './pages/home/Banner.svelte';
import HomeCollections from './pages/home/Collections.svelte';
import HomeAdvantages from './pages/home/Advantages.svelte';
import HomeCTA from './pages/home/CTA.svelte';

// About page components
import AboutHero from './pages/about/Hero.svelte';
import AboutMission from './pages/about/Mission.svelte';
import AboutValues from './pages/about/Values.svelte';
import AboutTimeline from './pages/about/Timeline.svelte';
import AboutTeam from './pages/about/Team.svelte';
import AboutBrands from './pages/about/Brands.svelte';
import AboutCTA from './pages/about/CTA.svelte';

// Brands page components
import BrandsHero from './pages/brands/Hero.svelte';
import BrandsList from './pages/brands/BrandsList.svelte';
import BrandsCTA from './pages/brands/CTA.svelte';

// Collections page components
import CollectionsHero from './pages/collections/Hero.svelte';
import CollectionsList from './pages/collections/CollectionsList.svelte';
import CollectionsCTA from './pages/collections/CTA.svelte';

// Contacts page components
import ContactsHero from './pages/contacts/Hero.svelte';
import ContactsSalons from './pages/contacts/Salons.svelte';
import ContactsCourier from './pages/contacts/Courier.svelte';
import ContactsForm from './pages/contacts/Form.svelte';

// Materials page components
import MaterialsHero from './pages/materials/Hero.svelte';
import MaterialsCategories from './pages/materials/Categories.svelte';
import MaterialsHowWeWork from './pages/materials/HowWeWork.svelte';
import MaterialsCTA from './pages/materials/CTA.svelte';

// Services page components
import ServicesHero from './pages/services/Hero.svelte';
import ServicesGrid from './pages/services/ServicesGrid.svelte';
import ServicesCTA from './pages/services/CTA.svelte';

// Vacancies page components
import VacanciesHero from './pages/vacancies/Hero.svelte';
import VacanciesList from './pages/vacancies/VacanciesList.svelte';
import VacanciesForm from './pages/vacancies/Form.svelte';

// Yandex Direct landing page components
import YandexDirectHero from './pages/yandex-direct/Hero.svelte';
import YandexDirectUSP from './pages/yandex-direct/USP.svelte';
import YandexDirectAdvantages from './pages/yandex-direct/Advantages.svelte';
import YandexDirectSteps from './pages/yandex-direct/Steps.svelte';
import YandexDirectSocialProof from './pages/yandex-direct/SocialProof.svelte';
import YandexDirectOffer from './pages/yandex-direct/Offer.svelte';
import YandexDirectCTA from './pages/yandex-direct/CTA.svelte';

// Page-specific overrides keyed by page slug
export const pageOverrides: Record<string, ComponentMap> = {
	'/': {
		Hero: HomeHero,
		Categories: HomeCategories,
		Banner: HomeBanner,
		Collections: HomeCollections,
		Advantages: HomeAdvantages,
		CTA: HomeCTA
	},
	'/about': {
		Hero: AboutHero,
		Mission: AboutMission,
		Values: AboutValues,
		Timeline: AboutTimeline,
		Team: AboutTeam,
		Brands: AboutBrands,
		CTA: AboutCTA
	},
	'/brands': {
		Hero: BrandsHero,
		BrandsList: BrandsList,
		CTA: BrandsCTA
	},
	'/collections': {
		Hero: CollectionsHero,
		CollectionsList: CollectionsList,
		CTA: CollectionsCTA
	},
	'/contacts': {
		Hero: ContactsHero,
		Salons: ContactsSalons,
		Courier: ContactsCourier,
		Form: ContactsForm
	},
	'/materials': {
		Hero: MaterialsHero,
		Categories: MaterialsCategories,
		HowWeWork: MaterialsHowWeWork,
		CTA: MaterialsCTA
	},
	'/services': {
		Hero: ServicesHero,
		ServicesGrid: ServicesGrid,
		CTA: ServicesCTA
	},
	'/vacancies': {
		Hero: VacanciesHero,
		VacanciesList: VacanciesList,
		Form: VacanciesForm
	},
	'/yandex-direct': {
		Hero: YandexDirectHero,
		USP: YandexDirectUSP,
		Advantages: YandexDirectAdvantages,
		Steps: YandexDirectSteps,
		SocialProof: YandexDirectSocialProof,
		Offer: YandexDirectOffer,
		CTA: YandexDirectCTA
	}
};
