import { blend, readable } from '$lib/design-systems/contrast';

export function normalizeHeaderButtonColor(value: unknown): string | null {
	return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim())
		? value.trim().toLowerCase()
		: null;
}
/** Independent header CTA, with a stable foreground across the whole gradient and hover. */
export function headerButtonPalette(value: string) {
	const seed = normalizeHeaderButtonColor(value);
	if (!seed) throw new Error('Invalid header button color');
	const on = '#ffffff';
	const safe = (color: string) => readable(color, on, 4.5);
	const stops = [seed, blend(seed, '#000000', 0.12), blend(seed, on, 0.08)].map(safe);
	const hover = stops.map((color) => safe(blend(color, '#000000', 0.08)));
	return {
		start: stops[0],
		mid: stops[1],
		end: stops[2],
		'hover-start': hover[0],
		'hover-mid': hover[1],
		'hover-end': hover[2],
		on,
		shadow: seed,
		outline: readable(seed, '#ffffff', 3),
		glint: 'rgb(0 0 0 / 0.2)'
	};
}
export function headerButtonStyle(value: unknown): string {
	const color = normalizeHeaderButtonColor(value);
	return color
		? Object.entries(headerButtonPalette(color))
				.map(([key, v]) => `--ds-header-action-${key}: ${v}`)
				.join('; ')
		: '';
}
