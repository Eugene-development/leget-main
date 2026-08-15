export const FONT_PRESETS = ['editorial', 'modern', 'classic'] as const;
export const RADIUS_PRESETS = ['sharp', 'balanced', 'soft'] as const;

export type FontPreset = (typeof FONT_PRESETS)[number];
export type RadiusPreset = (typeof RADIUS_PRESETS)[number];

export interface SiteAppearance {
	primaryColor: string;
	accentColor: string;
	surfaceColor: string;
	textColor: string;
	fontPreset: FontPreset;
	radiusPreset: RadiusPreset;
}

export const DEFAULT_SITE_APPEARANCE: SiteAppearance = {
	primaryColor: '#2c2c2c',
	accentColor: '#8b3f35',
	surfaceColor: '#faf9f7',
	textColor: '#1a1a1a',
	fontPreset: 'editorial',
	radiusPreset: 'balanced'
};

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type Rgb = { red: number; green: number; blue: number };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function color(value: unknown, fallback: string): string {
	return typeof value === 'string' && HEX_COLOR.test(value) ? value.toLowerCase() : fallback;
}

function preset<T extends readonly string[]>(
	value: unknown,
	allowed: T,
	fallback: T[number]
): T[number] {
	return typeof value === 'string' && allowed.includes(value) ? (value as T[number]) : fallback;
}

export function normalizeSiteAppearance(value: unknown): SiteAppearance {
	const source = isRecord(value) ? value : {};

	return {
		primaryColor: color(source.primaryColor, DEFAULT_SITE_APPEARANCE.primaryColor),
		accentColor: color(source.accentColor, DEFAULT_SITE_APPEARANCE.accentColor),
		surfaceColor: color(source.surfaceColor, DEFAULT_SITE_APPEARANCE.surfaceColor),
		textColor: color(source.textColor, DEFAULT_SITE_APPEARANCE.textColor),
		fontPreset: preset(source.fontPreset, FONT_PRESETS, DEFAULT_SITE_APPEARANCE.fontPreset),
		radiusPreset: preset(source.radiusPreset, RADIUS_PRESETS, DEFAULT_SITE_APPEARANCE.radiusPreset)
	};
}

export function hasSiteAppearance(value: unknown): boolean {
	return isRecord(value);
}

const FONT_VALUES: Record<FontPreset, { heading: string; body: string }> = {
	editorial: {
		heading: "'Cormorant Garamond', 'Georgia', serif",
		body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
	},
	modern: {
		heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
		body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
	},
	classic: {
		heading: "'Georgia', 'Times New Roman', serif",
		body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
	}
};

const RADIUS_VALUES: Record<RadiusPreset, string[]> = {
	sharp: ['0px', '2px', '3px', '4px', '6px', '8px', '12px', '16px'],
	balanced: ['2px', '4px', '6px', '8px', '12px', '16px', '24px', '32px'],
	soft: ['4px', '8px', '10px', '12px', '16px', '24px', '32px', '40px']
};

function rgb(value: string): Rgb {
	return {
		red: Number.parseInt(value.slice(1, 3), 16),
		green: Number.parseInt(value.slice(3, 5), 16),
		blue: Number.parseInt(value.slice(5, 7), 16)
	};
}

function luminance(value: string): number {
	const channels = Object.values(rgb(value)).map((channel) => {
		const normalized = channel / 255;
		return normalized <= 0.04045 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
	});
	return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(first: string, second: string): number {
	if (!isHexColor(first) || !isHexColor(second)) return 1;
	const firstLuminance = luminance(first);
	const secondLuminance = luminance(second);
	const lighter = Math.max(firstLuminance, secondLuminance);
	const darker = Math.min(firstLuminance, secondLuminance);
	return (lighter + 0.05) / (darker + 0.05);
}

function foreground(background: string, preferred: string, alternate: string): string {
	const candidates = [preferred, alternate, '#111111', '#ffffff'];
	return candidates.sort(
		(first, second) => contrastRatio(second, background) - contrastRatio(first, background)
	)[0];
}

function mix(first: string, second: string, firstPercent: number): string {
	return `color-mix(in srgb, ${first} ${firstPercent}%, ${second})`;
}

function scale(
	prefix: string,
	color: string,
	surface: string,
	text: string
): Array<[string, string]> {
	return [
		[`--ds-${prefix}-50`, mix(color, surface, 8)],
		[`--ds-${prefix}-100`, mix(color, surface, 16)],
		[`--ds-${prefix}-200`, mix(color, surface, 28)],
		[`--ds-${prefix}-300`, mix(color, surface, 44)],
		[`--ds-${prefix}-400`, mix(color, surface, 68)],
		[`--ds-${prefix}-500`, color],
		[`--ds-${prefix}-600`, mix(color, text, 84)],
		[`--ds-${prefix}-700`, mix(color, text, 68)],
		[`--ds-${prefix}-800`, mix(color, text, 48)],
		[`--ds-${prefix}-900`, mix(color, text, 30)],
		[`--ds-${prefix}-950`, mix(color, text, 16)]
	];
}

/**
 * Site-level overrides are deliberately limited to a short owner-facing layer.
 * Component versions still consume the complete design-system token contract;
 * this string only remaps the roles exposed on the settings page.
 */
export function siteAppearanceStyle(value: unknown): string {
	if (!hasSiteAppearance(value)) return '';

	const appearance = normalizeSiteAppearance(value);
	const fonts = FONT_VALUES[appearance.fontPreset];
	const radii = RADIUS_VALUES[appearance.radiusPreset];
	const surfaceAlt = mix(appearance.surfaceColor, appearance.textColor, 96);
	const surfaceMuted = mix(appearance.surfaceColor, appearance.textColor, 90);
	const border = mix(appearance.textColor, appearance.surfaceColor, 14);
	const line = mix(appearance.textColor, appearance.surfaceColor, 8);
	const darkSurface = appearance.textColor;
	const darkSurfaceAlt = mix(appearance.textColor, appearance.surfaceColor, 92);
	const lightForeground = foreground(
		appearance.primaryColor,
		appearance.surfaceColor,
		appearance.textColor
	);
	const accentForeground = foreground(
		appearance.accentColor,
		appearance.surfaceColor,
		appearance.textColor
	);
	const inkScale: Array<[string, string]> = [
		['--ds-ink-50', appearance.surfaceColor],
		['--ds-ink-100', surfaceAlt],
		['--ds-ink-200', surfaceMuted],
		['--ds-ink-300', mix(appearance.textColor, appearance.surfaceColor, 28)],
		['--ds-ink-400', mix(appearance.textColor, appearance.surfaceColor, 46)],
		['--ds-ink-500', mix(appearance.textColor, appearance.surfaceColor, 62)],
		['--ds-ink-600', mix(appearance.textColor, appearance.surfaceColor, 74)],
		['--ds-ink-700', mix(appearance.textColor, appearance.surfaceColor, 84)],
		['--ds-ink-800', mix(appearance.textColor, '#000000', 90)],
		['--ds-ink-900', appearance.textColor],
		['--ds-ink-950', mix(appearance.textColor, '#000000', 86)]
	];
	const brandScale = scale(
		'brand',
		appearance.accentColor,
		appearance.surfaceColor,
		appearance.textColor
	);
	const linkScale = scale(
		'link',
		appearance.accentColor,
		appearance.surfaceColor,
		appearance.textColor
	);
	const categoryScale = Array.from({ length: 14 }, (_, index) =>
		scale(`cat-${index + 1}`, appearance.accentColor, appearance.surfaceColor, appearance.textColor)
	).flat();

	const variables: Array<[string, string]> = [
		['--ds-color-primary', appearance.primaryColor],
		['--ds-color-primary-light', appearance.primaryColor],
		['--ds-color-secondary', appearance.accentColor],
		['--ds-color-secondary-light', mix(appearance.accentColor, appearance.surfaceColor, 72)],
		['--ds-color-accent', appearance.accentColor],
		['--ds-color-accent-light', mix(appearance.accentColor, appearance.surfaceColor, 72)],
		['--ds-color-surface', appearance.surfaceColor],
		['--ds-color-surface-warm', surfaceAlt],
		['--ds-color-surface-card', appearance.surfaceColor],
		['--ds-color-surface-muted', surfaceMuted],
		['--ds-color-text-primary', appearance.textColor],
		['--ds-color-text-secondary', appearance.textColor],
		['--ds-color-text-muted', appearance.textColor],
		['--ds-color-text-inverse', lightForeground],
		['--ds-color-border-light', border],
		['--ds-color-border-medium', mix(appearance.textColor, appearance.surfaceColor, 22)],
		['--ds-color-surface-50', appearance.surfaceColor],
		['--ds-color-surface-100', surfaceAlt],
		['--ds-color-surface-200', surfaceMuted],
		['--ds-color-surface-300', mix(appearance.textColor, appearance.surfaceColor, 24)],
		['--ds-color-surface-400', mix(appearance.textColor, appearance.surfaceColor, 42)],
		['--ds-color-surface-500', mix(appearance.textColor, appearance.surfaceColor, 58)],
		['--ds-color-surface-600', mix(appearance.textColor, appearance.surfaceColor, 70)],
		['--ds-color-surface-700', mix(appearance.textColor, appearance.surfaceColor, 82)],
		['--ds-color-surface-800', mix(appearance.textColor, '#000000', 90)],
		['--ds-color-surface-900', darkSurface],
		['--ds-color-accent-300', mix(appearance.accentColor, appearance.surfaceColor, 44)],
		['--ds-color-accent-400', mix(appearance.accentColor, appearance.surfaceColor, 68)],
		['--ds-color-accent-500', appearance.accentColor],
		['--ds-color-accent-600', mix(appearance.accentColor, appearance.textColor, 84)],
		['--ds-light-surface', appearance.surfaceColor],
		['--ds-light-surface-alt', surfaceAlt],
		['--ds-light-surface-paper', surfaceAlt],
		['--ds-light-card', appearance.surfaceColor],
		['--ds-light-card-hover', surfaceAlt],
		['--ds-light-title', appearance.textColor],
		['--ds-light-body', appearance.textColor],
		['--ds-light-muted', appearance.textColor],
		['--ds-light-border', border],
		['--ds-light-line', line],
		['--ds-light-rail', mix(appearance.textColor, appearance.surfaceColor, 28)],
		['--ds-light-accent', appearance.accentColor],
		['--ds-dark-surface', darkSurface],
		['--ds-dark-surface-alt', darkSurfaceAlt],
		['--ds-dark-surface-paper', darkSurfaceAlt],
		['--ds-dark-card', mix(appearance.surfaceColor, 'transparent', 7)],
		['--ds-dark-card-hover', mix(appearance.surfaceColor, 'transparent', 11)],
		['--ds-dark-title', foreground(darkSurface, appearance.surfaceColor, '#ffffff')],
		['--ds-dark-body', foreground(darkSurface, appearance.surfaceColor, '#ffffff')],
		['--ds-dark-muted', foreground(darkSurface, appearance.surfaceColor, '#ffffff')],
		['--ds-dark-border', mix(appearance.surfaceColor, 'transparent', 16)],
		['--ds-dark-line', mix(appearance.surfaceColor, 'transparent', 9)],
		['--ds-dark-rail', mix(appearance.surfaceColor, 'transparent', 25)],
		['--ds-dark-accent', appearance.accentColor],
		['--ds-on-dark', foreground(darkSurface, appearance.surfaceColor, '#ffffff')],
		['--ds-on-accent', accentForeground],
		['--ds-on-accent-muted', accentForeground],
		['--ds-surface-raised', appearance.surfaceColor],
		['--ds-scrim', foreground(appearance.surfaceColor, appearance.textColor, '#000000')],
		['--ds-accent-surface', appearance.accentColor],
		['--ds-accent-surface-deep', mix(appearance.accentColor, appearance.textColor, 72)],
		['--ds-accent-ink', mix(appearance.accentColor, appearance.textColor, 58)],
		['--ds-accent-ink-wash', mix(appearance.accentColor, appearance.surfaceColor, 14)],
		['--ds-font-heading', fonts.heading],
		['--ds-font-body', fonts.body],
		['--ds-font-heading-sub', fonts.body],
		['--ds-font-label', fonts.body],
		['--ds-font-numeric', fonts.body],
		['--ds-radius-xs', radii[0]],
		['--ds-radius-sm', radii[1]],
		['--ds-radius-md', radii[2]],
		['--ds-radius-lg', radii[3]],
		['--ds-radius-xl', radii[4]],
		['--ds-radius-2xl', radii[5]],
		['--ds-radius-3xl', radii[6]],
		['--ds-radius-4xl', radii[7]],
		...inkScale,
		...brandScale,
		...linkScale,
		...categoryScale
	];

	return variables.map(([name, token]) => `${name}: ${token}`).join('; ');
}

export function isHexColor(value: string): boolean {
	return HEX_COLOR.test(value);
}
