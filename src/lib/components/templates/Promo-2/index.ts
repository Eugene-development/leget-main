import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components (optional)
export const Header: Component<{ data: Record<string, unknown> }> | undefined = undefined;
export const Footer: Component<{ data: Record<string, unknown> }> | undefined = undefined;

// Home page components
import HomeHero         from './pages/home/Hero.svelte';
import HomeGallery      from './pages/home/Gallery.svelte';
import HomeTestimonials from './pages/home/Testimonials.svelte';
import HomeText         from './pages/home/Text.svelte';
import HomeCTA          from './pages/home/CTA.svelte';

// About page components
import AboutHero          from './pages/about/Hero.svelte';
import AboutText          from './pages/about/Text.svelte';
import AboutLeaderSection from './pages/about/LeaderSection.svelte';

// Contact page components
import ContactFormComponent from './pages/contact/ContactForm.svelte';
import MapComponent         from './pages/contact/Map.svelte';

// Page-specific overrides keyed by page slug
export const pageOverrides: Record<string, ComponentMap> = {
	'/': {
		Hero:         HomeHero,
		Gallery:      HomeGallery,
		Testimonials: HomeTestimonials,
		Text:         HomeText,
		CTA:          HomeCTA,
	},
	'/about': {
		Hero:          AboutHero,
		Text:          AboutText,
		LeaderSection: AboutLeaderSection,
	},
	'/contact': {
		ContactForm: ContactFormComponent,
		Map:         MapComponent,
	},
};
