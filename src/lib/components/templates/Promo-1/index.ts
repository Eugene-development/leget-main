import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components
import Header from './layout/Header.svelte';
import Footer from './layout/Footer.svelte';
export { Header, Footer };

// Home page components
import HomeHero       from './pages/home/Hero.svelte';
import HomeHeroMain   from './pages/home/HeroMain.svelte';
import HomeFeatures   from './pages/home/Features.svelte';
import HomeText       from './pages/home/Text.svelte';
import HomeCTA        from './pages/home/CTA.svelte';
import HomeMessage    from './pages/home/Message.svelte';
import HomePromoOffer from './pages/home/PromoOffer.svelte';
import HomeEquipment  from './pages/home/Equipment.svelte';
import HomeStage      from './pages/home/Stage.svelte';
import HomeIncentives from './pages/home/Incentives.svelte';
import HomeDirection  from './pages/home/Direction.svelte';
import HomeBrands     from './pages/home/Brands.svelte';

// About page components
import AboutHero       from './pages/about/Hero.svelte';
import AboutText       from './pages/about/Text.svelte';
import AboutStatistics from './pages/about/Statistics.svelte';

// Contact page components
import ContactForm from './pages/contact/ContactForm.svelte';

// Page-specific overrides keyed by page slug
export const pageOverrides: Record<string, ComponentMap> = {
	'/': {
		Hero:       HomeHero,
		HeroMain:   HomeHeroMain,
		Features:   HomeFeatures,
		Text:       HomeText,
		CTA:        HomeCTA,
		Message:    HomeMessage,
		PromoOffer: HomePromoOffer,
		Equipment:  HomeEquipment,
		Stage:      HomeStage,
		Incentives: HomeIncentives,
		Direction:  HomeDirection,
		Brands:     HomeBrands,
	},
	'/about': {
		Hero:       AboutHero,
		Text:       AboutText,
		Statistics: AboutStatistics,
	},
	'/contact': {
		ContactForm,
	},
};
