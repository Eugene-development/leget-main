import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components
import Banner from './layout/Banner/index.svelte';
import Header from './layout/Header.svelte';
import Footer from './layout/Footer/index.svelte';
export { Banner, Header, Footer };

// 404 page components
import NotFound from './pages/404/NotFound.svelte';

// Home page components
import HomeHeroMain   from './pages/home/HeroMain/index.svelte';
import HomeMessage    from './pages/home/Message/index.svelte';
import HomePromoOffer from './pages/home/PromoOffer/index.svelte';
import HomeEquipment  from './pages/home/Equipment/index.svelte';
import HomeStage      from './pages/home/Stage/index.svelte';
import HomeIncentives from './pages/home/Incentives/index.svelte';
import HomeDirection  from './pages/home/Direction/index.svelte';
import HomeBrands     from './pages/home/Brands/index.svelte';

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

// Services components
import ConsultationHero from './pages/services/consultation/ConsultationHero.svelte';
import ConsultationFeatures from './pages/services/consultation/ConsultationFeatures.svelte';
import ConsultationWhy from './pages/services/consultation/ConsultationWhy.svelte';

import ConsultationCTA from './pages/services/consultation/ConsultationCTA.svelte';

import DesignProjectHero from './pages/services/design-project/DesignProjectHero.svelte';
import DesignProjectFeatures from './pages/services/design-project/DesignProjectFeatures.svelte';
import DesignProjectWhy from './pages/services/design-project/DesignProjectWhy.svelte';
import DesignProjectCTA from './pages/services/design-project/DesignProjectCTA.svelte';

import MeasurementHero from './pages/services/measurement/MeasurementHero.svelte';
import MeasurementFeatures from './pages/services/measurement/MeasurementFeatures.svelte';
import MeasurementWhy from './pages/services/measurement/MeasurementWhy.svelte';
import MeasurementCTA from './pages/services/measurement/MeasurementCTA.svelte';

import FurnitureProjectHero from './pages/services/furniture-project/FurnitureProjectHero.svelte';
import FurnitureProjectFeatures from './pages/services/furniture-project/FurnitureProjectFeatures.svelte';
import FurnitureProjectWhy from './pages/services/furniture-project/FurnitureProjectWhy.svelte';
import FurnitureProjectCTA from './pages/services/furniture-project/FurnitureProjectCTA.svelte';

import AssemblyHero from './pages/services/assembly/AssemblyHero.svelte';
import AssemblyFeatures from './pages/services/assembly/AssemblyFeatures.svelte';
import AssemblyWhy from './pages/services/assembly/AssemblyWhy.svelte';
import AssemblyCTA from './pages/services/assembly/AssemblyCTA.svelte';

// Contacts page components
import ContactsHero      from './pages/contacts/Hero/index.svelte';
import ContactChannels   from './pages/contacts/ContactChannels.svelte';
import ContactAddress    from './pages/contacts/ContactAddress.svelte';
import ContactMessengers from './pages/contacts/ContactMessengers.svelte';
import ContactCTA        from './pages/contacts/ContactCTA/index.svelte';

// Actions page components
import ActionsHero        from './pages/actions/Hero.svelte';
import ActionsCards       from './pages/actions/ActionsCards.svelte';
import ActionsCardsExtra  from './pages/actions/ActionsCardsExtra.svelte';
import ActionsBanner      from './pages/actions/ActionsBanner.svelte';
import ActionsCTA         from './pages/actions/ActionsCTA/index.svelte';

// Partnership page components
import PartnershipHero     from './pages/partnership/Hero.svelte';
import WhoWeInvite         from './pages/partnership/WhoWeInvite.svelte';
import ForManufacturers    from './pages/partnership/ForManufacturers.svelte';
import PartnershipBenefits from './pages/partnership/Benefits.svelte';
import HowToStart          from './pages/partnership/HowToStart.svelte';
import PartnershipCTA      from './pages/partnership/PartnershipCTA.svelte';

// Testimonials page components
import TestimonialsHero from './pages/testimonials/Hero.svelte';
import TestimonialsSummary from './pages/testimonials/TestimonialsSummary.svelte';
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

// Mebel page components
import MebelHero      from './pages/mebel/MebelHero.svelte';
import MebelBenefits  from './pages/mebel/MebelBenefits.svelte';
import MebelSolutions from './pages/mebel/MebelSolutions.svelte';
import MebelProcess   from './pages/mebel/MebelProcess.svelte';
import MebelCTA       from './pages/mebel/MebelCTA.svelte';
import MebelSidebar   from './pages/mebel/MebelSidebar.svelte';
import MebelCategoryHero from './pages/mebel/MebelCategoryHero.svelte';
import MebelProjectsGrid from './pages/mebel/MebelProjectsGrid.svelte';
import MebelProjectHero from './pages/mebel/MebelProjectHero.svelte';
import MebelProjectDescription from './pages/mebel/MebelProjectDescription.svelte';
import MebelProjectSimilar from './pages/mebel/MebelProjectSimilar.svelte';

// Stoleshnica page components
import StoleshnicaHero      from './pages/stoleshnica/StoleshnicaHero.svelte';
import StoleshnicaMaterials from './pages/stoleshnica/StoleshnicaMaterials.svelte';
import StoleshnicaBenefits  from './pages/stoleshnica/StoleshnicaBenefits.svelte';
import StoleshnicaSolutions from './pages/stoleshnica/StoleshnicaSolutions.svelte';
import StoleshnicaServices  from './pages/stoleshnica/StoleshnicaServices.svelte';
import StoleshnicaCTA       from './pages/stoleshnica/StoleshnicaCTA.svelte';
import StoleshnicaSidebar   from './pages/stoleshnica/StoleshnicaSidebar.svelte';

// Bytovaya-tehnika page components
import ByttehnikaSidebar    from './pages/bytovaya-tehnika/ByttehnikaSidebar.svelte';
import ByttehnikaHero       from './pages/bytovaya-tehnika/ByttehnikaHero.svelte';
import ByttehnikaBrands     from './pages/bytovaya-tehnika/ByttehnikaBrands.svelte';
import ByttehnikaBenefits   from './pages/bytovaya-tehnika/ByttehnikaBenefits.svelte';
import ByttehnikaCategories from './pages/bytovaya-tehnika/ByttehnikaCategories.svelte';
import ByttehnikaComplex    from './pages/bytovaya-tehnika/ByttehnikaComplex.svelte';
import ByttehnikaCTA        from './pages/bytovaya-tehnika/ByttehnikaCTA.svelte';

// Santehnika page components
import SantehnikaSidebar    from './pages/santehnika/SantehnikaSidebar.svelte';
import SantehnikaHero       from './pages/santehnika/SantehnikaHero.svelte';
import SantehnikaBrands     from './pages/santehnika/SantehnikaBrands.svelte';
import SantehnikaSinkTypes  from './pages/santehnika/SantehnikaSinkTypes.svelte';
import SantehnikaCategories from './pages/santehnika/SantehnikaCategories.svelte';
import SantehnikaBenefits   from './pages/santehnika/SantehnikaBenefits.svelte';
import SantehnikaComplex    from './pages/santehnika/SantehnikaComplex.svelte';
import SantehnikaCTA        from './pages/santehnika/SantehnikaCTA.svelte';

// Furnitura page components
import FurnituraSidebar from './pages/furnitura/FurnituraSidebar.svelte';
import FurnituraHero    from './pages/furnitura/FurnituraHero.svelte';
import FurnituraShops   from './pages/furnitura/FurnituraShops.svelte';
import FurnituraCTA     from './pages/furnitura/FurnituraCTA.svelte';

// Plitka page components
import PliitkaSidebar    from './pages/plitka/PliitkaSidebar.svelte';
import PliitkaHero       from './pages/plitka/PliitkaHero.svelte';
import PliitkaBrands     from './pages/plitka/PliitkaBrands.svelte';
import PliitkaBenefits   from './pages/plitka/PliitkaBenefits.svelte';
import PliitkaCategories from './pages/plitka/PliitkaCategories.svelte';
import PliitkaComplex    from './pages/plitka/PliitkaComplex.svelte';
import PliitkaCTA        from './pages/plitka/PliitkaCTA.svelte';

// Page-specific overrides keyed by page slug
export const pageOverrides: Record<string, ComponentMap> = {
	// Страница 404. Рендерится и по прямому адресу /404, и как тело ошибки
	// в src/routes/+error.svelte — см. loadRenderPage().
	'/404': {
		NotFound,
	},
	'/': {
		HeroMain:   HomeHeroMain,
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
		TestimonialsSummary,
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
	'/consultation': {
		ConsultationHero,
		ConsultationFeatures,
		ConsultationWhy,
		ConsultationCTA,
	},
	'/design-project': {
		DesignProjectHero,
		DesignProjectFeatures,
		DesignProjectWhy,
		DesignProjectCTA,
	},
	'/measurement': {
		MeasurementHero,
		MeasurementFeatures,
		MeasurementWhy,
		MeasurementCTA,
	},
	'/furniture-project': {
		FurnitureProjectHero,
		FurnitureProjectFeatures,
		FurnitureProjectWhy,
		FurnitureProjectCTA,
	},
	'/assembly': {
		AssemblyHero,
		AssemblyFeatures,
		AssemblyWhy,
		AssemblyCTA,
	},
	'/mebel': {
		MebelSidebar,
		MebelHero,
		MebelBenefits,
		MebelSolutions,
		MebelProcess,
		MebelCTA,
	},
	'/mebel/{category}': {
		MebelSidebar,
		MebelCategoryHero,
		MebelProjectsGrid,
		MebelBenefits,
		MebelCTA,
	},
	'/mebel/{category}/{project}': {
		MebelSidebar,
		MebelProjectHero,
		MebelProjectDescription,
		MebelProjectSimilar,
		MebelCTA,
	},
	'/stoleshnica': {
		StoleshnicaSidebar,
		StoleshnicaHero,
		StoleshnicaMaterials,
		StoleshnicaBenefits,
		StoleshnicaSolutions,
		StoleshnicaServices,
		StoleshnicaCTA,
	},
	'/bytovaya-tehnika': {
		ByttehnikaSidebar,
		ByttehnikaHero,
		ByttehnikaBrands,
		ByttehnikaBenefits,
		ByttehnikaCategories,
		ByttehnikaComplex,
		ByttehnikaCTA,
	},
	'/santehnika': {
		SantehnikaSidebar,
		SantehnikaHero,
		SantehnikaBrands,
		SantehnikaSinkTypes,
		SantehnikaCategories,
		SantehnikaBenefits,
		SantehnikaComplex,
		SantehnikaCTA,
	},
	'/furnitura': {
		FurnituraSidebar,
		FurnituraHero,
		FurnituraShops,
		FurnituraCTA,
	},
	'/plitka': {
		PliitkaSidebar,
		PliitkaHero,
		PliitkaBrands,
		PliitkaBenefits,
		PliitkaCategories,
		PliitkaComplex,
		PliitkaCTA,
	},
};
