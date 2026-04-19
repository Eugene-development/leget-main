// Promo-2 template components
// Add component exports here as they are created

import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components (optional)
export const Header: Component<{ data: Record<string, unknown> }> | undefined = undefined;
export const Footer: Component<{ data: Record<string, unknown> }> | undefined = undefined;

// Page-specific component maps
import AboutLeaderSection from './pages/about/LeaderSection.svelte';

// Page-specific overrides keyed by page slug
export const pageOverrides: Record<string, ComponentMap> = {
	'/about': {
		LeaderSection: AboutLeaderSection
	}
};
