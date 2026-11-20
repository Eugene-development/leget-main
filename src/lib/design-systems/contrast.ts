import { GRADIENT_SURFACES } from '$lib/design-systems/gradient-surfaces';
/** Pure, shared contrast contract: no DOM reads and no tenant state. */
export type RGB = [number, number, number];
export function hex(channels: RGB): string {
	return `#${channels
		.map((v) =>
			Math.round(Math.max(0, Math.min(255, v)))
				.toString(16)
				.padStart(2, '0')
		)
		.join('')}`;
}
export function channels(value: string): RGB {
	return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as RGB;
}
export function blend(first: string, second: string, amount: number): string {
	const a = channels(first),
		b = channels(second);
	return hex(a.map((v, i) => v + (b[i] - v) * amount) as RGB);
}
export function luminance(value: string): number {
	return channels(value)
		.map((v) => {
			const c = v / 255;
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		})
		.reduce((total, c, i) => total + c * [0.2126, 0.7152, 0.0722][i], 0);
}
export function contrast(first: string, second: string): number {
	const a = luminance(first),
		b = luminance(second);
	return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export function foreground(background: string): string {
	return contrast('#000000', background) >= contrast('#ffffff', background) ? '#000000' : '#ffffff';
}
/** The closest RGB blend to the seed that meets the requested contrast. */
export function readable(seed: string, background: string, target: number): string {
	if (contrast(seed, background) >= target) return seed;
	for (let step = 1; step <= 100; step++) {
		for (const endpoint of [
			foreground(background),
			foreground(background) === '#000000' ? '#ffffff' : '#000000'
		]) {
			const candidate = blend(seed, endpoint, step / 100);
			if (contrast(candidate, background) >= target) return candidate;
		}
	}
	return foreground(background);
}
export const PALETTE_ROLES = [
	'text',
	'fill',
	'hover',
	'active',
	'on',
	'on-hover',
	'on-active'
] as const;
export function surfacePalette(background: string, seed: string) {
	const fill = readable(seed, background, 3);
	const endpoint = foreground(background);
	const on = foreground(fill);
	// A stable foreground prevents a white-to-black color transition from passing
	// through unreadable gray while the fill animates between interactive states.
	const stateFill = (amount: number) => {
		for (const direction of [endpoint, endpoint === '#ffffff' ? '#000000' : '#ffffff']) {
			const candidate = readable(blend(fill, direction, amount), background, 3);
			if (contrast(on, candidate) >= 4.5) return candidate;
		}
		return fill;
	};
	const hover = stateFill(0.1);
	const active = stateFill(0.2);
	return {
		text: readable(seed, background, 4.5),
		fill,
		hover,
		active,
		on,
		'on-hover': on,
		'on-active': on
	};
}
export const SURFACES: Record<string, string> = {
	light: '--ds-light-surface',
	'light-alt': '--ds-light-surface-alt',
	'light-card': '--ds-light-card',
	dark: '--ds-dark-surface',
	'dark-alt': '--ds-dark-surface-alt',
	'dark-card': '--ds-dark-card',
	'dark-card-hover': '--ds-dark-card-hover',
	'light-card-hover': '--ds-light-card-hover',
	surface: '--ds-color-surface',
	warm: '--ds-color-surface-warm',
	card: '--ds-color-surface-card',
	muted: '--ds-color-surface-muted',
	primary: '--ds-color-primary',
	secondary: '--ds-color-secondary',
	'accent-light': '--ds-color-accent-light',
	'accent-400': '--ds-color-accent-400',
	'accent-surface': '--ds-accent-surface',
	'accent-surface-deep': '--ds-accent-surface-deep',
	'accent-ink-wash': '--ds-accent-ink-wash',
	'primary-light': '--ds-color-primary-light',
	'ink-900': '--ds-ink-900',
	'ink-950': '--ds-ink-950',
	'surface-800': '--ds-color-surface-800',
	'surface-900': '--ds-color-surface-900',
	'accent-500': '--ds-color-accent-500',
	'brand-600': '--ds-brand-600',
	'link-600': '--ds-link-600',
	accent: '--ds-color-accent',
	brand: '--ds-brand-500',
	link: '--ds-link-500',
	white: '#ffffff',
	black: '#000000'
};
// Every numeric canvas is independent, including light cards nested in dark sections.
for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800])
	SURFACES[`ink-${step}`] = `--ds-ink-${step}`;
for (const step of [50, 100, 200, 300, 400, 500, 600, 700])
	SURFACES[`surface-${step}`] = `--ds-color-surface-${step}`;
Object.assign(SURFACES, {
	raised: '--ds-surface-raised',
	scrim: '--ds-scrim',
	'light-overlay': '--ds-light-overlay',
	'dark-overlay': '--ds-dark-overlay',
	'light-field': '--ds-light-field',
	'dark-field': '--ds-dark-field'
});
Object.assign(SURFACES, {
	'light-title': '--ds-light-title',
	'dark-title': '--ds-dark-title',
	'university-cover': '--ds-university-accent'
});
SURFACES['favorite-badge'] = '--ds-favorite-badge';
for (const step of [50, 950]) SURFACES[`alt-petrol-${step}`] = `--ds-alt-petrol-${step}`;
// Opaque hover surfaces establish their own foreground just like static canvases.
for (const prefix of ['brand', 'link'])
	for (const step of [400, 700]) SURFACES[`${prefix}-${step}`] = `--ds-${prefix}-${step}`;
for (const [category, step] of [
	[1, 600],
	[2, 400],
	[6, 100]
])
	SURFACES[`cat-${category}-${step}`] = `--ds-cat-${category}-${step}`;
// Filled category badges/icons establish their own surface, even inside a light card.
for (let category = 1; category <= 14; category++)
	SURFACES[`cat-${category}-500`] = `--ds-cat-${category}-500`;
for (const prefix of ['brand', 'link'])
	for (const step of [50, 100]) SURFACES[`${prefix}-${step}`] = `--ds-${prefix}-${step}`;
for (const [cat, step] of [
	[1, 50],
	[1, 100],
	[2, 100],
	[4, 50],
	[7, 50]
])
	SURFACES[`cat-${cat}-${step}`] = `--ds-cat-${cat}-${step}`;
export const SEEDS: Record<string, string> = {
	ink: '--ds-ink-900',
	scrim: '--ds-scrim',
	accent: '--ds-color-accent',
	'accent-surface': '--ds-accent-surface',
	primary: '--ds-color-primary',
	secondary: '--ds-color-secondary',
	brand: '--ds-brand-500',
	link: '--ds-link-500',
	...Object.fromEntries(
		Array.from({ length: 14 }, (_, i) => [`cat-${i + 1}`, `--ds-cat-${i + 1}-500`])
	)
};
/** Resolve only the color syntax authored by our design systems; fail on unknown syntax. */
export function resolveColor(
	value: string,
	tokens: Record<string, string>,
	backdrop = '#ffffff',
	depth = 0
): string {
	if (depth > 12) throw new Error(`Circular color token: ${value}`);
	value = value.trim();
	const resolve = (v: string) => resolveColor(v, tokens, backdrop, depth + 1);
	if (value.startsWith('--')) {
		let source = tokens[value];
		if (!source && /cat-\d+-500$/.test(value)) {
			for (const step of [600, 400, 700, 300])
				source ??= tokens[value.replace(/500$/, String(step))];
		}
		if (!source) throw new Error(`Missing color: ${value}`);
		return resolve(source);
	}
	if (/^#[\da-f]{6}$/i.test(value)) return value.toLowerCase();
	if (/^#[\da-f]{3}$/i.test(value))
		return `#${value
			.slice(1)
			.split('')
			.map((v) => v + v)
			.join('')}`;
	const variable = value.match(/^var\((--[\w-]+)\)$/);
	if (variable) return resolve(variable[1]);
	if (value === 'transparent') return backdrop;
	const rgb = value.match(/^rgba?\(([^)]+)\)$/);
	if (rgb) {
		const parts = rgb[1]
			.replace(/[,/]/g, ' ')
			.trim()
			.split(/\s+/)
			.map((part, index) =>
				part.endsWith('%') ? parseFloat(part) * (index === 3 ? 0.01 : 2.55) : Number(part)
			);
		if (![3, 4].includes(parts.length) || !parts.every(Number.isFinite)) {
			throw new Error(`Invalid RGB color: ${value}`);
		}
		const color = hex(parts.slice(0, 3) as RGB);
		return parts.length === 4 ? blend(backdrop, color, parts[3]) : color;
	}
	const oklch = value.match(/^oklch\(([\d.]+)(%)? ([\d.]+) ([\d.]+)\)$/);
	if (oklch) {
		const L = Number(oklch[1]) / (oklch[2] ? 100 : 1),
			C = Number(oklch[3]),
			h = (Number(oklch[4]) * Math.PI) / 180;
		const a = C * Math.cos(h),
			b = C * Math.sin(h);
		const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
		const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
		const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
		return hex(
			[
				4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
				-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
				-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
			].map(
				(v) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(v, 0) ** (1 / 2.4) - 0.055)
			) as RGB
		);
	}
	const mix = value.match(/^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)$/s);
	if (mix) return blend(resolve(mix[3]), resolve(mix[1]), Number(mix[2]) / 100);
	throw new Error(`Unsupported design-system color: ${value}`);
}
export function contrastDeclarations(tokens: Record<string, string>): Array<[string, string]> {
	const declarations: Array<[string, string]> = [];
	const cache = new Map<string, ReturnType<typeof surfacePalette>>();
	for (const prefix of ['brand', 'link', 'cat-1', 'cat-4', 'cat-5', 'cat-9'])
		for (const step of [50, 100, 500, 600]) {
			const source = resolveColor(`--ds-${prefix}-${step}`, tokens);
			declarations.push([`--ds-contrast-source-${prefix}-${step}-copy`, foreground(source)]);
		}

	for (const [surface, source] of Object.entries(SURFACES)) {
		const backdrop = resolveColor(
			surface.startsWith('dark') ? '--ds-dark-surface' : '--ds-color-surface',
			tokens
		);
		const background = resolveColor(source, tokens, backdrop);
		declarations.push([`--ds-contrast-${surface}-copy`, foreground(background)]);
		for (const [seed, color] of Object.entries(SEEDS)) {
			const seedColor = resolveColor(color, tokens);
			const key = `${background}:${seedColor}`;
			const palette = cache.get(key) ?? surfacePalette(background, seedColor);
			cache.set(key, palette);
			for (const role of PALETTE_ROLES)
				declarations.push([`--ds-contrast-${surface}-${seed}-${role}`, palette[role]]);
		}
	}
	declarations.push(...gradientDeclarations(tokens));
	return declarations;
}

/** A single readable foreground for the whole ramp, not just one sampled point. */
/** Luminance is convex along an sRGB segment; its maximum is at an endpoint. */
function gradientBounds(stops: string[]) {
	const linear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
	const slope = (c: number) =>
		c <= 0.04045 ? 1 / 12.92 : (2.4 / 1.055) * ((c + 0.055) / 1.055) ** 1.4;
	const weights = [0.2126, 0.7152, 0.0722];
	const values = stops.map(luminance);
	let min = Math.min(...values),
		max = Math.max(...values);
	for (let i = 1; i < stops.length; i++) {
		const a = channels(stops[i - 1]).map((v) => v / 255),
			b = channels(stops[i]).map((v) => v / 255),
			d = b.map((v, k) => v - a[k]);
		const derivative = (t: number) =>
			d.reduce((sum, v, k) => sum + weights[k] * v * slope(a[k] + v * t), 0);
		if (derivative(0) >= 0 || derivative(1) <= 0) continue;
		let lo = 0,
			hi = 1;
		for (let n = 0; n < 32; n++) {
			const t = (lo + hi) / 2;
			if (derivative(t) < 0) lo = t;
			else hi = t;
		}
		const t = (lo + hi) / 2;
		min = Math.min(
			min,
			a.reduce((sum, v, k) => sum + weights[k] * linear(v + d[k] * t), 0)
		);
	}
	return { min, max };
}
function rampContrast(color: string, bounds: { min: number; max: number }) {
	const y = luminance(color);
	if (y >= bounds.min && y <= bounds.max) return 1;
	return y < bounds.min ? (bounds.min + 0.05) / (y + 0.05) : (y + 0.05) / (bounds.max + 0.05);
}
export function gradientPalette(colors: string[], dark = false) {
	const copy = dark ? '#ffffff' : foreground(colors[colors.length - 1]);
	// A dark ramp leaves room for translucent highlights and badges behind light copy.
	const target = dark ? 5.5 : 4.6;
	const ink = foreground(copy);
	const source = colors.map((color) => readable(color, copy, target));
	let stops = source,
		bounds = gradientBounds(stops);
	// Endpoint-only tests miss the luminance dip between different hues.
	for (let step = 1; rampContrast(copy, bounds) < target && step <= 100; step++) {
		stops = source.map((color) => blend(color, ink, step / 100));
		bounds = gradientBounds(stops);
	}
	const stateFill = (amount: number) => {
		for (let step = 0; step <= 100; step++) {
			const fill = blend(blend(copy, stops[stops.length - 1], amount), copy, step / 100);
			if (rampContrast(fill, bounds) >= 3.05 && contrast(fill, ink) >= 4.5) return fill;
		}
		return copy;
	};
	return {
		start: stops[0],
		via: stops.length > 2 ? stops[1] : blend(stops[0], stops[1], 0.5),
		end: stops[stops.length - 1],
		copy,
		wash: `color-mix(in srgb, ${ink} 12%, transparent)`,
		fill: copy,
		hover: stateFill(0.1),
		active: stateFill(0.2),
		on: ink
	};
}

export function gradientToken(name: string) {
	if (name === 'on-accent' || name === 'on-dark' || name === 'surface-raised')
		return `--ds-${name}`;
	if (name === 'accent-panel' || name === 'accent-panel-deep') return `--ds-${name}`;
	if (/^(brand|link|ink|cat)-/.test(name)) return `--ds-${name}`;
	if (/^surface-/.test(name)) return `--ds-color-${name}`;
	return `--ds-color-${name}`;
}
function gradientDeclarations(tokens: Record<string, string>): Array<[string, string]> {
	const result: Array<[string, string]> = [];
	const cache = new Map<string, ReturnType<typeof gradientPalette>>();
	const rubrics: Record<string, string> = {
		mebel: 'brand',
		stoleshnica: 'cat-1',
		'bytovaya-tehnika': 'cat-4',
		dveri: 'cat-4',
		okna: 'cat-4',
		santehnika: 'cat-5',
		furnitura: 'cat-9'
	};
	for (const [id, stops] of Object.entries(GRADIENT_SURFACES)) {
		for (const [rubric, source] of Object.entries({ '': '', ...rubrics })) {
			if (rubric && !stops.some((s) => s.startsWith('link-'))) continue;
			const colors = stops.map((name) =>
				resolveColor(gradientToken(rubric ? name.replace(/^link-/, source + '-') : name), tokens)
			);
			const key = colors.join(',');
			const palette = cache.get(key) ?? gradientPalette(colors);
			cache.set(key, palette);
			const darkKey = `dark:${key}`;
			const dark = cache.get(darkKey) ?? gradientPalette(colors, true);
			cache.set(darkKey, dark);
			const prefix = `--ds-gradient-${rubric ? rubric + '-' : ''}${id}`;
			for (const [role, color] of Object.entries(palette))
				result.push([`${prefix}-${role}`, color]);
			for (const [role, color] of Object.entries(dark))
				result.push([`${prefix}-dark-${role}`, color]);
		}
	}
	return result;
}
