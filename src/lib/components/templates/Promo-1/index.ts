import type { Component } from 'svelte';

type ComponentMap = Record<string, Component<{ data: Record<string, unknown> }>>;

// Layout components (optional)
export const Header: Component<{ data: Record<string, unknown> }> | undefined = undefined;
export const Footer: Component<{ data: Record<string, unknown> }> | undefined = undefined;

// Page-specific component maps
import AboutStatistics from './pages/about/Statistics.svelte';

// Page-specific overrides keyed by page slug
export const pageOverrides: Record<string, ComponentMap> = {
	'/about': {
		Statistics: AboutStatistics
	}
};
