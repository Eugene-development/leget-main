const { GRADIENT_SURFACES } = loadServerModule(
	new URL('../src/lib/design-systems/gradient-surfaces.ts', import.meta.url),
	{}
);
import { loadServerModule } from './test-server-module.mjs';
import { format, resolveConfig } from 'prettier';
import { readFileSync, writeFileSync } from 'node:fs';
const seeds = [
	'ink',
	'scrim',
	'accent',
	'accent-surface',
	'primary',
	'secondary',
	'brand',
	'link',
	...Array.from({ length: 14 }, (_, i) => `cat-${i + 1}`)
];
const roles = ['text', 'fill', 'hover', 'active', 'on', 'on-hover', 'on-active'];
const root = ':where([data-site-template], [data-ds-contrast-root])';
const within = (selector) =>
	`${root}:is(${selector}):not(:where([data-ds-contrast-ignore], [data-ds-contrast-ignore] *)), ${root} :is(${selector}):not(:where([data-ds-contrast-ignore], [data-ds-contrast-ignore] *))`;
const declarations = (surface) =>
	[
		`--ds-copy: var(--ds-contrast-${surface}-copy);`,
		...seeds.flatMap((seed) =>
			roles.map((role) => `--ds-c-${seed}-${role}: var(--ds-contrast-${surface}-${seed}-${role});`)
		)
	]
		.map((x) => '\t' + x)
		.join('\n');
// Foreground aliases must move with a control, including nested editable copy and SVGs.
const foregroundDeclarations = (value) =>
	[`--ds-copy: ${value};`, ...seeds.map((seed) => `--ds-c-${seed}-text: ${value};`)].join('\n');
// Dense translucent panels still establish a surface (tooltips, counters, media labels).
// Low-opacity washes keep the surrounding context instead.
const denseSurface = (name) =>
	[name, ...[70, 75, 80, 85, 88, 90, 95].map((alpha) => `${name}/${alpha}`)]
		.map((name) => `.${name.replace('/', '\\/')}`)
		.join(', ');
const contexts = {
	surface: '.ds-surface, [data-ds-surface="surface"], .bg-surface',
	warm: '.bg-surface-warm, [data-ds-surface="warm"]',
	card: '.bg-surface-card, .bg-surface-raised, [data-ds-surface="card"]',
	muted: '.bg-surface-muted',
	accent: '.bg-accent',
	brand: '.bg-brand-500',
	'brand-600': '.bg-brand-600',
	link: '.bg-link-500',
	'link-600': '.bg-link-600',
	'accent-500': '.bg-accent-500',
	primary: '.bg-primary, [data-ds-surface="primary"]',
	'primary-light': '.bg-primary-light',
	'surface-800': '.bg-surface-800',
	'surface-900': '.bg-surface-900',
	'ink-900': '.bg-ink-900',
	'ink-950': '.bg-ink-950',
	white: '.bg-white, [data-ds-surface="white"]',
	black: '.bg-black, [data-ds-surface="black"]',
	light: '[data-p1-theme="light"], [data-ds-surface="light"]',
	dark: '[data-p1-theme="dark"], [data-ds-surface="dark"]'
};
contexts.dark += ', .bg-surface-inverse';
contexts['light-alt'] = '.bg-surface-paper';
const { SURFACES } = loadServerModule(
	new URL('../src/lib/design-systems/contrast.ts', import.meta.url),
	{}
);
for (const name of Object.keys(SURFACES)) if (!contexts[name]) contexts[name] = `.bg-${name}`;
contexts.card = '.bg-surface-card';
contexts.raised = '.bg-surface-raised';
for (const [surface, name] of [
	['ink-900', 'bg-ink-900'],
	['ink-950', 'bg-ink-950'],
	['scrim', 'bg-scrim'],
	['raised', 'bg-surface-raised']
])
	contexts[surface] = denseSurface(name);
for (const [surface, name] of [
	['brand', 'bg-brand-500'],
	['brand-600', 'bg-brand-600'],
	['link', 'bg-link-500'],
	['link-600', 'bg-link-600']
])
	contexts[surface] = denseSurface(name);
const actionSelectors = [];
let css = `/* Generated selectors for the shared surface contrast contract.\n   Values belong to design-systems/*.css and siteAppearance; selectors preserve legacy markup. */\n\n${root} {\n${declarations('surface')}\n}\n`;
for (const [surface, selectors] of Object.entries(contexts)) {
	const selector = `:where(${selectors}, [data-ds-surface="${surface}"]):not(:is(button, a, [role="button"]))`;
	css += `\n${within(selector)} {\n${declarations(surface)}\n\tcolor: var(--ds-copy);\n}\n`;
}
css += `\n${root} {\n`;
for (const part of ['card', 'card-hover', 'alt', 'overlay', 'field'])
	for (const seed of seeds)
		for (const role of roles)
			css += `\t--ds-p1-${part}-${seed}-${role}: var(--ds-contrast-light-${part}-${seed}-${role});\n`;
css +=
	'\t--ds-p1-card-hover-copy: var(--ds-contrast-light-card-hover-copy);\n\t--ds-p1-card-copy: var(--ds-contrast-light-card-copy);\n\t--ds-p1-alt-copy: var(--ds-contrast-light-alt-copy);\n}\n';
css += `${root} { --ds-p1-overlay-copy: var(--ds-contrast-light-overlay-copy); --ds-p1-field-copy: var(--ds-contrast-light-field-copy); }`;
// A theme boundary resets its card/alternate aliases; nested cards then resolve locally.
for (const theme of ['light', 'dark']) {
	css += `\n${within(`[data-p1-theme="${theme}"]`)} {\n`;
	for (const part of ['card', 'card-hover', 'alt', 'overlay', 'field'])
		for (const seed of seeds)
			for (const role of roles)
				css += `\t--ds-p1-${part}-${seed}-${role}: var(--ds-contrast-${theme}-${part}-${seed}-${role});\n`;
	css += `\t--ds-p1-overlay-copy: var(--ds-contrast-${theme}-overlay-copy);\n\t--ds-p1-field-copy: var(--ds-contrast-${theme}-field-copy);\n\t--ds-p1-card-hover-copy: var(--ds-contrast-${theme}-card-hover-copy);\n\t--ds-p1-card-copy: var(--ds-contrast-${theme}-card-copy);\n\t--ds-p1-alt-copy: var(--ds-contrast-${theme}-alt-copy);\n}\n`;
}
for (const [part, selectors] of [
	['overlay', '.p1-overlay, .p1-liquid-glass'],
	['field', '.p1-field'],
	['card', '.p1-card'],
	['card-hover', '.p1-card:hover'],
	['alt', '.p1-surface-alt, .p1-surface-paper']
]) {
	css += `\n${within(selectors)} {\n\t--ds-copy: var(--ds-p1-${part}-copy);\n`;
	for (const seed of seeds)
		for (const role of roles)
			css += `\t--ds-c-${seed}-${role}: var(--ds-p1-${part}-${seed}-${role});\n`;
	css += '}\n';
}
// Explicit content surfaces take precedence over fallback utilities under media.
for (const surface of Object.keys(SURFACES)) {
	css += `\n${within(`[data-ds-surface="${surface}"][data-ds-surface]`)} {\n${declarations(surface)}\n}\n`;
}
css += `${within('.p1-field, .p1-field::placeholder')} { color: var(--ds-copy) !important; opacity: 1; }`;
// Overlay/field copy follows the same local theme as its background.
for (const theme of ['light', 'dark']) {
	const scope =
		theme === 'light'
			? `${root}, ${within('[data-p1-theme="light"]')}`
			: within('[data-p1-theme="dark"]');
	css += `${scope} { --ds-p1-overlay-copy: var(--ds-contrast-${theme}-overlay-copy); --ds-p1-field-copy: var(--ds-contrast-${theme}-field-copy); }\n`;
}
css += `${within('.ds-accent')} { -webkit-text-fill-color: currentColor !important; }\n`;
// Catalog accents retain their source identity on both themes and nested surfaces.
const rubrics = {
	mebel: 'brand',
	stoleshnica: 'cat-1',
	'bytovaya-tehnika': 'cat-4',
	dveri: 'cat-4',
	okna: 'cat-4',
	santehnika: 'cat-5',
	furnitura: 'cat-9'
};
const surfaces = [
	'light',
	'light-alt',
	'light-card',
	'dark',
	'dark-alt',
	'dark-card',
	'surface',
	'warm',
	'card',
	'muted',
	'primary',
	'primary-light',
	'ink-900',
	'ink-950',
	'surface-800',
	'surface-900',
	'dark-card-hover',
	'light-card-hover',
	'accent',
	'accent-500',
	'brand',
	'brand-600',
	'link',
	'link-600',
	'white',
	'black'
];
for (const [rubric, seed] of Object.entries(rubrics)) {
	css += `\n[data-catalog-rubric="${rubric}"] {\n`;
	for (const surface of surfaces)
		for (const role of roles)
			css += `\t--ds-contrast-${surface}-link-${role}: var(--ds-contrast-${surface}-${seed}-${role});\n`;
	css += '}\n';
}
for (const [rubric, seed] of Object.entries(rubrics)) {
	css += `[data-catalog-rubric="${rubric}"] {`;
	for (const shade of [50, 100, 500, 600])
		css += `--ds-contrast-link${shade === 500 ? '' : '-' + shade}-copy: var(--ds-contrast-source-${seed}-${shade}-copy);`;
	css += '}\n';
}
css += `${within(':is(.bg-brand-50,.bg-brand-100,.bg-link-50,.bg-link-100,.bg-brand-500,.bg-link-500):not(:is(button,a,[role="button"]))')} { color: var(--ds-copy) !important; }\n`;
// Existing utility names are semantic adapters, not a second color system.
for (const seed of seeds) {
	const names =
		seed === 'ink'
			? ['ink-700', 'ink-800', 'ink-900', 'ink-950']
			: seed === 'accent'
				? ['accent', 'accent-ink', 'alt-petrol-accent', 'primary-accent', 'action']
				: seed === 'brand'
					? ['brand']
					: seed === 'link'
						? ['link']
						: seed === 'primary'
							? ['primary', 'action-primary']
							: seed === 'secondary'
								? ['secondary']
								: [seed];
	const textNames = names;
	const textSelectors = textNames.flatMap((n) => [
		`.text-${n}`,
		`[class^="text-${n}/"]`,
		`[class*=" text-${n}/"]`,
		...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].flatMap((step) => [
			`.text-${n}-${step}`,
			`[class^="text-${n}-${step}/"]`,
			`[class*=" text-${n}-${step}/"]`
		])
	]);
	if (seed === 'accent') textSelectors.push('.ds-accent');
	if (seed === 'link') textSelectors.push('.p1-accent');
	for (const state of ['hover', 'focus', 'focus-visible', 'active']) {
		const selectors = textNames.map((n) => `[class*="${state}:text-${n}"]:${state}`);
		if (selectors.length)
			css += `\n${within(selectors.join(', '))} { color: var(--ds-c-${seed}-text) !important; }\n`;
	}
	const gradients = names.map(
		(n) => `.bg-clip-text:is([class^="from-${n}-"], [class*=" from-${n}-"])`
	);
	css += `\n${within(gradients.join(', '))} { background-image: none !important; color: var(--ds-c-${seed}-text) !important; -webkit-text-fill-color: currentColor !important; }\n`;

	if (textSelectors.length)
		css += `\n${within(textSelectors.join(', '))} {\n\tcolor: var(--ds-c-${seed}-text) !important;\n}\n`;
	const fills = names.flatMap((n) => [
		`.bg-${n}`,
		`[class^="bg-${n}/"]`,
		`[class*=" bg-${n}/"]`,
		...[300, 400, 500, 600, 700].map((step) => `.bg-${n}-${step}`),
		`[class^="from-${n}-"]`,
		`[class*=" from-${n}-"]`
	]);
	const selector = `:is(button, a, [role="button"]):is(${fills.join(', ')})${seed === 'accent' ? ', .ds-action' : seed === 'primary' ? ', .ds-action-primary' : ''}`;
	actionSelectors.push(selector);
	css += `\n${within(selector)} {\n\t--ds-control-fill: var(--ds-c-${seed}-fill);\n\t--ds-control-hover: var(--ds-c-${seed}-hover);\n\t--ds-control-active: var(--ds-c-${seed}-active);\n\t--ds-control-on: var(--ds-c-${seed}-on);\n\t--ds-control-on-hover: var(--ds-c-${seed}-on-hover);\n\t--ds-control-on-active: var(--ds-c-${seed}-on-active);\n\t--ds-control-focus: var(--ds-c-${seed}-text);\n}\n`;
}
// Neutral links/buttons can sit on a different canvas than their outer section.
for (const surface of [
	'surface',
	'warm',
	'muted',
	'primary-light',
	'black',
	...Array.from({ length: 10 }, (_, i) => `surface-${i === 0 ? 50 : i * 100}`)
]) {
	const selectors = contexts[surface];
	if (!selectors) continue;
	css += `${within(`:is(button, a, [role="button"]):is(${selectors})`)} {${declarations(surface)}color: var(--ds-copy) !important;}\n`;
}
const controls = `:is(${actionSelectors.join(', ')})`;
css += `\n${within(controls)} {\n\tbackground-color: var(--ds-control-fill) !important;\n\tbackground-image: none !important; filter: none !important;\n\tcolor: var(--ds-control-on) !important;\n\tborder-color: var(--ds-control-fill) !important;\n}\n${within(`${controls}:hover:not(:disabled)`)} {\n\tbackground-color: var(--ds-control-hover) !important;\n\tcolor: var(--ds-control-on-hover) !important;\n}\n${within(`${controls}:active:not(:disabled)`)} {\n\tbackground-color: var(--ds-control-active) !important;\n\tcolor: var(--ds-control-on-active) !important;\n}\n${within(`${controls}:focus-visible`)} {\n\toutline: 2px solid var(--ds-control-focus);\n\toutline-offset: 3px;\n}\n`;
css += `\n${within('.ds-outline')} { background: transparent !important; border-color: var(--ds-c-accent-text) !important; color: var(--ds-c-accent-text) !important; }\n${within('.ds-outline:hover')} { background: var(--ds-c-accent-hover) !important; color: var(--ds-c-accent-on-hover) !important; }\n${within('.ds-outline:active')} { background: var(--ds-c-accent-active) !important; color: var(--ds-c-accent-on-active) !important; }\n${within('.ds-outline:focus-visible')} { outline: 2px solid var(--ds-c-accent-text); outline-offset: 3px; }\n`;
for (const [state, foreground] of [
	['', 'var(--ds-c-accent-text)'],
	[':hover', 'var(--ds-c-accent-on-hover)'],
	[':active', 'var(--ds-c-accent-on-active)']
]) {
	// The default outline color already uses --ds-c-accent-text: do not alias it to itself.
	if (state) css += `${within(`.ds-outline${state}`)} {${foregroundDeclarations(foreground)}}\n`;
}
// Quiet controls keep their authored borders; contrast adaptation must not add one.
for (const [classes, fill, on] of [
	['.bg-white', 'var(--ds-contrast-black-copy)', 'var(--ds-contrast-white-copy)'],
	['.bg-surface-card', 'var(--ds-color-surface-card)', 'var(--ds-contrast-card-copy)'],
	['.bg-on-dark', 'var(--ds-on-dark)', 'var(--ds-dark-surface)']
]) {
	const quiet = `:is(button, a, [role="button"]):is(${classes}):not(.ds-action):not(.ds-action-primary)`;
	css += `\n${within(quiet)} { background: ${fill} !important; color: ${on} !important; ${foregroundDeclarations(on)} }\n${within(`${quiet}:hover:not(:disabled)`)} { background: var(--ds-c-accent-hover) !important; color: var(--ds-c-accent-on-hover) !important; ${foregroundDeclarations('var(--ds-c-accent-on-hover)')} }\n${within(`${quiet}:focus-visible`)} { outline: 2px solid var(--ds-c-accent-text); outline-offset: 3px; }\n`;
}
for (const step of [50, 100, 200]) {
	const selector = `:is(button,a,[role="button"]).bg-ink-${step}`;
	css += `${within(selector)} { background-color: var(--ds-ink-${step}) !important; color: var(--ds-contrast-ink-${step}-copy) !important; ${foregroundDeclarations(`var(--ds-contrast-ink-${step}-copy)`)} }\n`;
	css += `${within(`${selector}:hover:not(:disabled)`)} { background-color: var(--ds-ink-${step}) !important; color: var(--ds-contrast-ink-${step}-copy) !important; ${foregroundDeclarations(`var(--ds-contrast-ink-${step}-copy)`)} }\n`;
}
const raisedControl =
	':is(button,a,[role="button"]).bg-surface-raised:not(.ds-action):not(.ds-action-primary)';
css += `${within(raisedControl)} { background:var(--ds-surface-raised) !important; color:var(--ds-contrast-raised-copy) !important; ${foregroundDeclarations('var(--ds-contrast-raised-copy)')} }\n`;
css += `${within(`${raisedControl}:hover:not(:disabled, .p1-hover-on-dark)`)} { background:var(--ds-surface-raised) !important; color:var(--ds-contrast-raised-copy) !important; ${foregroundDeclarations('var(--ds-contrast-raised-copy)')} }\n`;
// Explicit text-color utilities inside a filled control must inherit the button pair.
css += `\n${within(`${controls} :is(.text-primary, .text-white, .text-on-dark, .text-on-accent, .text-inverse, .text-on-primary-accent, span, strong, em, b, i, p)`)} {\n\tcolor: inherit !important; -webkit-text-fill-color: currentColor !important;\n}\n`;
// Theme-aware neutral copy: semantic roles and legacy utilities. Content swatches are excluded.
const copy = '.ds-copy, .text-on-primary';
css += `\n${within(copy)} {\n\tcolor: var(--ds-copy) !important;\n}\n`;
const surfacesForCopy =
	Object.entries(contexts)
		.map(([name, selectors]) => `${selectors}, [data-ds-surface="${name}"]`)
		.join(', ') +
	', [data-ds-gradient], [class*="bg-linear-to-"][class*="from-"], [class*="bg-gradient-to-"][class*="from-"]';
const neutral =
	'.text-on-accent-muted, .text-ink-200, .text-ink-300, .text-on-dark, .text-on-accent, [class^="text-on-dark/"], [class*=" text-on-dark/"], [class^="text-on-accent/"], [class*=" text-on-accent/"], .text-ink-400, .text-ink-500, .text-ink-600, .text-ink-700, .text-ink-800, .text-ink-900, .text-ink-950, .text-surface-200, .text-surface-300, .text-surface-400, .text-surface-500, .text-surface-600, .p1-title, .p1-body, .p1-muted, .p1-title-sub, .text-text-primary, .text-text-secondary, .text-text-muted, .text-white, [class^="text-white/"], [class*=" text-white/"], .text-inverse, [class^="text-inverse/"], [class*=" text-inverse/"]';
const legacyNeutral = [400, 500, 600, 700, 800, 900, 950]
	.map((step) => `.text-alt-petrol-${step}`)
	.join(', ');
css += `\n${within(`:where(${surfacesForCopy}) :is(${neutral}, ${legacyNeutral})`)} { color: var(--ds-copy) !important; }\n`;
// SVG paint utilities bypass color/currentColor. Map the template's paint roles
// to the same local foreground as copy, including inside cards and controls.
const neutralPaint = ['surface-300', 'surface-400', 'surface-500'];
for (const paint of ['fill', 'stroke']) {
	const neutralIcons = neutralPaint.map((name) => `svg.${paint}-${name}`).join(', ');
	css += `\n${within(neutralIcons)} { ${paint}: var(--ds-copy) !important; }\n`;
	const accent = `${paint}-accent-500`;
	const accentIcons = [
		`svg.${accent}`,
		`svg.hover\\:${accent}:hover`,
		`.group:is(:hover, :focus-visible, :focus-within) svg.group-hover\\:${accent}`
	];
	css += `\n${within(accentIcons.join(', '))} { ${paint}: var(--ds-c-accent-text) !important; }\n`;
}
css += `\n${within('.ds-outline :is(span, strong, em, b, i, p)')} { color: inherit !important; -webkit-text-fill-color: currentColor !important; }\n`;
// Action foreground wins over accent and copy adaptation, including hover classes.
css += `\n${within(controls)} { color: var(--ds-control-on) !important; }\n${within(`${controls}:hover:not(:disabled)`)} { color: var(--ds-control-on-hover) !important; }\n${within(`${controls}:active:not(:disabled)`)} { color: var(--ds-control-on-active) !important; }\n`;
// Descendants must resolve their foreground against the control, not the outer section.
// This includes EditableField/RichText wrappers and SVGs with legacy color utilities.
for (const [state, foreground] of [
	['', 'on'],
	[':hover:not(:disabled)', 'on-hover'],
	[':active:not(:disabled)', 'on-active']
]) {
	css += `${within(`${controls}${state}`)} {\n\t--ds-copy: var(--ds-control-${foreground});\n`;
	for (const seed of seeds) css += `\t--ds-c-${seed}-text: var(--ds-control-${foreground});\n`;
	css += '}\n';
}
css += `${within(':is(.bg-brand-50,.bg-brand-100,.bg-link-50,.bg-link-100,.bg-brand-500,.bg-link-500):not(:is(button,a,[role="button"]))')} { color: var(--ds-copy) !important; }\n`;
// Gradient canvases are painted and scoped as a whole, including mixed-color ramps.
const gradientRoles = ['start', 'via', 'end', 'copy', 'wash', 'fill', 'hover', 'active', 'on'];
const darkGradient = ':is([data-ds-gradient-tone="dark"], .text-on-dark:where([data-site-template="1"], [data-site-template="1"] *))';
const gradientAliases = (id, dark = false) =>
	gradientRoles.map((role) => {
		const token = `--ds-gradient-${id}-${role}`;
		const value = dark ? `var(--ds-gradient-${id}-dark-${role}, var(${token}))` : `var(${token})`;
		return `--ds-gradient-${role}:${value};`;
	}).join('');
for (const [id, stops] of Object.entries(GRADIENT_SURFACES)) {
	const classes =
		stops.length === 3
			? `.from-${stops[0]}.via-${stops[1]}.to-${stops[2]}`
			: `.from-${stops[0]}.to-${stops[1]}`;
	const selector = `:is(${classes}:not(.bg-clip-text):is([class*="bg-linear-to-"],[class*="bg-gradient-to-"]), [data-ds-gradient="${id}"]):not(:is(button,a,[role="button"]))`;
	css += `${within(selector)} {${gradientAliases(id)}`;
	css += `--ds-copy:var(--ds-gradient-copy);color:var(--ds-gradient-copy);background-image:linear-gradient(var(--ds-gradient-direction,to bottom right),var(--ds-gradient-start),var(--ds-gradient-via),var(--ds-gradient-end)) !important;`;
	for (const seed of seeds)
		for (const role of roles)
			css += `--ds-c-${seed}-${role}:var(--ds-gradient-${role === 'text' ? 'copy' : role.startsWith('on') ? 'on' : role});`;
	css += '}\n';
	css += `${within(selector + darkGradient)} {${gradientAliases(id, true)}}\n`;
	for (const rubric of Object.keys(rubrics))
		if (stops.some((s) => s.startsWith('link-'))) {
			const scoped = (surface) =>
				`[data-catalog-rubric="${rubric}"] :is(${surface}),[data-catalog-rubric="${rubric}"]:is(${surface})`;
			css += `${scoped(selector)} {${gradientAliases(`${rubric}-${id}`)}}\n`;
			css += `${scoped(selector + darkGradient)} {${gradientAliases(`${rubric}-${id}`, true)}}\n`;
		}
}
for (const [direction, cssDirection] of Object.entries({
	r: 'to right',
	l: 'to left',
	b: 'to bottom',
	t: 'to top',
	br: 'to bottom right',
	bl: 'to bottom left',
	tr: 'to top right',
	tl: 'to top left'
}))
	css += `${within(`.bg-linear-to-${direction},.bg-gradient-to-${direction}`)} {--ds-gradient-direction:${cssDirection};}\n`;
css += `${within('.ds-gradient-wash')} {background-color:var(--ds-gradient-wash) !important;}\n`;
// A background changed by hover/group-hover is a new local text surface.
// Use the authored target surface and its foreground as one state, including actions.
for (const [surface, selectors] of Object.entries(contexts)) {
	const names = [...new Set([...selectors.matchAll(/\.bg-([\w-]+)(?![\w-])/g)].map((m) => m[1]))];
	for (const name of names) {
		const direct = `.hover\\:bg-${name}:is(:hover, :focus-visible)`;
		const group = `.group:is(:hover, :focus-visible, :focus-within) .group-hover\\:bg-${name}`;
		const background = SURFACES[surface].startsWith('--')
			? `var(${SURFACES[surface]})`
			: SURFACES[surface];
		css += `${within(`${direct}, ${group}`)} {${declarations(surface)}\nbackground-color: ${background} !important; color: var(--ds-copy) !important;}\n`;
	}
}
// Promo-1 badges and buttons that use light copy need a darker shade of their own accent.
for (const [name, seed] of [
	['brand-500', 'brand'],
	['link-400', 'link'],
	['link-500', 'link'],
	...[1, 2, 3, 6, 8].map((n) => [`cat-${n}-500`, `cat-${n}`])
]) {
	const direct = `.p1-hover-on-dark.hover\\:bg-${name}:is(:hover, :focus-visible):not(:disabled)`;
	const group = `.group:is(:hover, :focus-visible, :focus-within) .p1-hover-on-dark.group-hover\\:bg-${name}`;
	const copy = 'var(--ds-contrast-black-copy)';
	css += `${within(`${direct}, ${group}`)} {
		background-color: var(--ds-contrast-white-${seed}-text) !important;
		color: ${copy} !important;
		${foregroundDeclarations(copy)}
	}\n`;
}
const target = new URL('../src/lib/styles/surface-contrast.css', import.meta.url);
css += `${root} .p1-field::placeholder { color: var(--ds-copy) !important; opacity: 1; }\n`;
const formatted = await format(css, {
	...(await resolveConfig(target.pathname)),
	plugins: [],
	parser: 'css'
});
if (process.argv.includes('--check')) {
	if (readFileSync(target, 'utf8') !== formatted)
		throw new Error('Stale surface contrast adapter; run npm run contrast:generate');
} else writeFileSync(target, formatted);
