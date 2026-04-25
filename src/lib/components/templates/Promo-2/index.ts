import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components
import Header from './layout/Header.svelte';
import Footer from './layout/Footer.svelte';
export { Header, Footer };

// Home page components
import HomeHero       from './pages/home/Hero.svelte';
import HomeStyles     from './pages/home/Styles.svelte';
import HomeAdvantages from './pages/home/Advantages.svelte';
import HomeDetails    from './pages/home/Details.svelte';
import HomeCTA        from './pages/home/CTA.svelte';

// About page components
import AboutHero          from './pages/about/Hero.svelte';
import AboutLeaderSection from './pages/about/LeaderSection.svelte';
import AboutMission       from './pages/about/Mission.svelte';
import AboutFactory       from './pages/about/Factory.svelte';
import AboutVideo         from './pages/about/Video.svelte';
import AboutPrinciples    from './pages/about/Principles.svelte';
import AboutCTA           from './pages/about/AboutCTA.svelte';

// Contact page components
import ContactFormComponent from './pages/contact/ContactForm.svelte';
import MapComponent         from './pages/contact/Map.svelte';

// Actions page components
import ActionsHero   from './pages/actions/Hero.svelte';
import ActionsTimer  from './pages/actions/ActionsTimer.svelte';
import ActionsCards  from './pages/actions/ActionsCards.svelte';
import ActionsBanner from './pages/actions/ActionsBanner.svelte';
import ActionsSteps  from './pages/actions/ActionsSteps.svelte';
import ActionsCTA    from './pages/actions/ActionsCTA.svelte';

// News page components
import NewsHero  from './pages/news/Hero.svelte';
import NewsList  from './pages/news/NewsList.svelte';
import NewsCTA   from './pages/news/NewsCTA.svelte';

// Styles page components
import StylesHero from './pages/styles/Hero.svelte';
import StylesGrid from './pages/styles/StylesGrid.svelte';
import StylesCTA  from './pages/styles/StylesCTA.svelte';

// Facades page components
import FacadesHero    from './pages/facades/Hero.svelte';
import FacadesCatalog from './pages/facades/FacadesCatalog.svelte';
import FacadesCTA     from './pages/facades/FacadesCTA.svelte';

// Furniture page components
import FurnitureHero    from './pages/furniture/Hero.svelte';
import FurnitureIntro   from './pages/furniture/FurnitureIntro.svelte';
import BrandsSection    from './pages/furniture/BrandsSection.svelte';
import FurnitureCTA     from './pages/furniture/FurnitureCTA.svelte';

// Kitchens page components
import KitchensHero      from './pages/kitchens/Hero.svelte';
import KitchensGallery   from './pages/kitchens/KitchensGallery.svelte';
import ProductionCycle   from './pages/kitchens/ProductionCycle.svelte';
import KitchenStyles     from './pages/kitchens/KitchenStyles.svelte';
import KitchensCTA       from './pages/kitchens/KitchensCTA.svelte';

// Wardrobes page components
import WardrobesHero     from './pages/wardrobes/Hero.svelte';
import WardrobesGallery  from './pages/wardrobes/WardrobesGallery.svelte';
import WardrobeFeatures  from './pages/wardrobes/WardrobeFeatures.svelte';
import WardrobeTypes     from './pages/wardrobes/WardrobeTypes.svelte';
import WardrobesCTA      from './pages/wardrobes/WardrobesCTA.svelte';

// Showrooms page components
import ShowroomsHero     from './pages/showrooms/Hero.svelte';
import ShowroomsMap      from './pages/showrooms/ShowroomsMap.svelte';
import ShowroomsCTA      from './pages/showrooms/ShowroomsCTA.svelte';

// Careers page components
import CareersHero       from './pages/careers/Hero.svelte';
import CareersPerks      from './pages/careers/CareersPerks.svelte';
import CareersVacancies  from './pages/careers/CareersVacancies.svelte';
import CareersForm       from './pages/careers/CareersForm.svelte';

// Designers page components
import DesignersHero     from './pages/designers/Hero.svelte';
import DesignersBenefits from './pages/designers/DesignersBenefits.svelte';
import DesignersTracks   from './pages/designers/DesignersTracks.svelte';
import DesignersSteps    from './pages/designers/DesignersSteps.svelte';
import DesignersForm     from './pages/designers/DesignersForm.svelte';

// Page-specific overrides keyed by page slug
export const pageOverrides: Record<string, ComponentMap> = {
	'/': {
		Hero:         HomeHero,
		Styles:       HomeStyles,
		Advantages:   HomeAdvantages,
		Details:      HomeDetails,
		CTA:          HomeCTA,
	},
	'/about': {
		Hero:          AboutHero,
		LeaderSection: AboutLeaderSection,
		Mission:       AboutMission,
		Factory:       AboutFactory,
		Video:         AboutVideo,
		Principles:    AboutPrinciples,
		AboutCTA:      AboutCTA,
	},
	'/contact': {
		ContactForm: ContactFormComponent,
		Map:         MapComponent,
	},
	'/actions': {
		Hero:          ActionsHero,
		ActionsTimer:  ActionsTimer,
		ActionsCards:  ActionsCards,
		ActionsBanner: ActionsBanner,
		ActionsSteps:  ActionsSteps,
		ActionsCTA:    ActionsCTA,
	},
	'/news': {
		Hero:     NewsHero,
		NewsList: NewsList,
		NewsCTA:  NewsCTA,
	},
	'/styles': {
		Hero:       StylesHero,
		StylesGrid: StylesGrid,
		StylesCTA:  StylesCTA,
	},
	'/facades': {
		Hero:           FacadesHero,
		FacadesCatalog: FacadesCatalog,
		FacadesCTA:     FacadesCTA,
	},
	'/furniture': {
		Hero:           FurnitureHero,
		FurnitureIntro: FurnitureIntro,
		BrandsSection:  BrandsSection,
		FurnitureCTA:   FurnitureCTA,
	},
	'/kitchens': {
		Hero:            KitchensHero,
		KitchensGallery: KitchensGallery,
		ProductionCycle: ProductionCycle,
		KitchenStyles:   KitchenStyles,
		KitchensCTA:     KitchensCTA,
	},
	'/wardrobes': {
		Hero:             WardrobesHero,
		WardrobesGallery: WardrobesGallery,
		WardrobeFeatures: WardrobeFeatures,
		WardrobeTypes:    WardrobeTypes,
		WardrobesCTA:     WardrobesCTA,
	},
	'/showrooms': {
		Hero:         ShowroomsHero,
		ShowroomsMap: ShowroomsMap,
		ShowroomsCTA: ShowroomsCTA,
	},
	'/careers': {
		Hero:             CareersHero,
		CareersPerks:     CareersPerks,
		CareersVacancies: CareersVacancies,
		CareersForm:      CareersForm,
	},
	'/designers': {
		Hero:              DesignersHero,
		DesignersBenefits: DesignersBenefits,
		DesignersTracks:   DesignersTracks,
		DesignersSteps:    DesignersSteps,
		DesignersForm:     DesignersForm,
	},
};
