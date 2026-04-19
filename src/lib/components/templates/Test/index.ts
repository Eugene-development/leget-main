import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components (shared across all pages)
import Header from './layout/Header.svelte';
import Footer from './layout/Footer.svelte';

// Page-specific component maps
import HomeHero from './pages/home/Hero.svelte';
import HomeText from './pages/home/Text.svelte';

import AboutHero from './pages/about/Hero.svelte';

// Layout components available to all templates
export { Header, Footer };

// Page-specific overrides keyed by page slug
export const pageOverrides: Record<string, ComponentMap> = {
	'/': {
		Hero: HomeHero,
		Text: HomeText
	},
	'/about': {
		Hero: AboutHero
	}
};
