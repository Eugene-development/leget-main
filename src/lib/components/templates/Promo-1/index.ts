import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components
import Banner from './layout/Banner.svelte';
import Header from './layout/Header.svelte';
import Footer from './layout/Footer.svelte';
export { Banner, Header, Footer };

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
import AboutMission    from './pages/about/Mission.svelte';
import AboutValues     from './pages/about/Values.svelte';
import AboutWhyUs      from './pages/about/WhyUs.svelte';
import AboutCTA        from './pages/about/AboutCTA.svelte';

// Contact page components
import ContactForm from './pages/contact/ContactForm.svelte';

// Contacts page components
import ContactsHero      from './pages/contacts/Hero.svelte';
import ContactChannels   from './pages/contacts/ContactChannels.svelte';
import ContactAddress    from './pages/contacts/ContactAddress.svelte';
import ContactMessengers from './pages/contacts/ContactMessengers.svelte';
import ContactCTA        from './pages/contacts/ContactCTA.svelte';

// Actions page components
import ActionsHero        from './pages/actions/Hero.svelte';
import ActionsCards       from './pages/actions/ActionsCards.svelte';
import ActionsCardsExtra  from './pages/actions/ActionsCardsExtra.svelte';
import ActionsBanner      from './pages/actions/ActionsBanner.svelte';
import ActionsCTA         from './pages/actions/ActionsCTA.svelte';

// Partnership page components
import PartnershipHero     from './pages/partnership/Hero.svelte';
import WhoWeInvite         from './pages/partnership/WhoWeInvite.svelte';
import ForManufacturers    from './pages/partnership/ForManufacturers.svelte';
import PartnershipBenefits from './pages/partnership/Benefits.svelte';
import HowToStart          from './pages/partnership/HowToStart.svelte';
import PartnershipCTA      from './pages/partnership/PartnershipCTA.svelte';

// Testimonials page components
import TestimonialsHero from './pages/testimonials/Hero.svelte';
import TestimonialsGrid from './pages/testimonials/TestimonialsGrid.svelte';

// Installment page components
import InstallmentHero         from './pages/installment/Hero.svelte';
import InstallmentPlans        from './pages/installment/InstallmentPlans.svelte';
import InstallmentRequirements from './pages/installment/InstallmentRequirements.svelte';
import InstallmentSteps        from './pages/installment/InstallmentSteps.svelte';
import InstallmentBanks        from './pages/installment/InstallmentBanks.svelte';
import InstallmentFAQ          from './pages/installment/InstallmentFAQ.svelte';
import InstallmentCTA          from './pages/installment/InstallmentCTA.svelte';

// Guarantees page components
import GuaranteesHero from './pages/guarantees/Hero.svelte';
import GuaranteeTerms from './pages/guarantees/GuaranteeTerms.svelte';
import WhatsCovered   from './pages/guarantees/WhatsCovered.svelte';
import HowToApply     from './pages/guarantees/HowToApply.svelte';
import GuaranteesCTA  from './pages/guarantees/GuaranteesCTA.svelte';

// Yandex Direct landing page components
import YandexDirectHero        from './pages/yandex-direct/Hero.svelte';
import YandexDirectUSP         from './pages/yandex-direct/USP.svelte';
import YandexDirectAdvantages  from './pages/yandex-direct/Advantages.svelte';
import YandexDirectSteps       from './pages/yandex-direct/Steps.svelte';
import YandexDirectSocialProof from './pages/yandex-direct/SocialProof.svelte';
import YandexDirectOffer       from './pages/yandex-direct/Offer.svelte';
import YandexDirectCTA         from './pages/yandex-direct/CTA.svelte';

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
		Mission:    AboutMission,
		Values:     AboutValues,
		WhyUs:      AboutWhyUs,
		AboutCTA,
	},
	'/contact': {
		ContactForm,
	},
	'/contacts': {
		ContactsHero: ContactsHero,
		ContactChannels,
		ContactAddress,
		ContactMessengers,
		ContactCTA,
	},
	'/actions': {
		Hero:              ActionsHero,
		ActionsCards,
		ActionsCardsExtra,
		ActionsBanner,
		ActionsCTA,
	},
	'/partnership': {
		PartnershipHero:  PartnershipHero,
		WhoWeInvite,
		ForManufacturers,
		Benefits:         PartnershipBenefits,
		HowToStart,
		PartnershipCTA,
	},
	'/testimonials': {
		Hero:             TestimonialsHero,
		TestimonialsGrid,
	},
	'/installment': {
		InstallmentHero: InstallmentHero,
		InstallmentPlans,
		InstallmentRequirements,
		InstallmentSteps,
		InstallmentBanks,
		InstallmentFAQ,
		InstallmentCTA,
	},
	'/guarantees': {
		GuaranteesHero: GuaranteesHero,
		GuaranteeTerms,
		WhatsCovered,
		HowToApply,
		GuaranteesCTA,
	},
	'/yandex-direct': {
		Hero:        YandexDirectHero,
		USP:         YandexDirectUSP,
		Advantages:  YandexDirectAdvantages,
		Steps:       YandexDirectSteps,
		SocialProof: YandexDirectSocialProof,
		Offer:       YandexDirectOffer,
		CTA:         YandexDirectCTA,
	},
};
