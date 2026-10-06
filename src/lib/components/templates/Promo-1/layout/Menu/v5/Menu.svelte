<script lang="ts">
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { createMenuMotion } from '../motion.svelte';
	import type { CatalogItem } from '../../catalogItems';
	import type { ServiceItem } from '../../serviceItems';
	import '../../../theme.css';

	// Скошенные объёмные вкладки. Геометрия — у варианта, палитра — у системы.
	let {
		links = [],
		visibleCatalogItems = [],
		visibleServiceItems = [],
		disabledRubrics = [],
		disabledServices = [],
		isEditable = false,
		onToggleRubric,
		onToggleService
	}: {
		links: { href: string; label: string }[];
		visibleCatalogItems: CatalogItem[];
		visibleServiceItems: ServiceItem[];
		disabledRubrics: string[];
		disabledServices: string[];
		isEditable?: boolean;
		onToggleRubric: (href: string, currentEnabled: boolean, e: Event) => void;
		onToggleService: (href: string, currentEnabled: boolean, e: Event) => void;
	} = $props();

	type MenuKind = 'catalog' | 'services';
	type ToggleHandler = (href: string, enabled: boolean, e: Event) => void;
	const uid = $props.id();
	let tabSizes = $state<Record<number, { width: number; height: number }>>({});

	function measureTab(node: HTMLElement, index: number) {
		const measure = () => {
			const width = node.offsetWidth;
			const height = node.offsetHeight;
			if (tabSizes[index]?.width !== width || tabSizes[index]?.height !== height) {
				tabSizes[index] = { width, height };
			}
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		return { destroy: () => observer.disconnect() };
	}

	function tabGeometry(index: number) {
		const { width = 160, height = 52 } = tabSizes[index] ?? {};
		const slant = height * 0.55;
		const left = index === 0 ? 0 : slant;
		const right = width + left;
		const end = right + slant;
		// Один контур: вертикальный край первой вкладки и одинаковая
		// округлённая диагональ справа. Размер измерен, угол не растягивается
		// вместе с длиной подписи и масштабом шрифта.
		const path =
			index === 0
				? `M 12 0 H ${right - 10} C ${right} 0 ${right + 4} 4 ${right + 10} 14 L ${end - 2} ${height - 5} Q ${end + 1} ${height} ${end - 5} ${height} H 0 V 12 Q 0 0 12 0 Z`
				: `M 0 0 H ${right - 10} C ${right} 0 ${right + 4} 4 ${right + 10} 14 L ${end - 2} ${height - 5} Q ${end + 1} ${height} ${end - 5} ${height} H ${slant} Z`;
		return { width: end, height, slant, left, path };
	}

	const motion = createMenuMotion();
	let rootEl = $state<HTMLElement | null>(null);
	let openMenu = $state<MenuKind | null>(null);
	let openedBy = $state<'hover' | 'intent' | null>(null);
	let hoverSuppressed = false;
	let triggerEls = $state<Partial<Record<MenuKind, HTMLButtonElement>>>({});

	function kindOf(link: { href: string; label: string }): MenuKind | null {
		if (link.href === '/catalog' || link.label === 'Каталог') return 'catalog';
		if (link.href === '/services' || link.label === 'Услуги') return 'services';
		return null;
	}

	function matches(href: string) {
		return (
			$page.url.pathname === href || (href !== '/' && $page.url.pathname.startsWith(`${href}/`))
		);
	}

	function isCurrent(link: { href: string; label: string }) {
		const kind = kindOf(link);
		if (matches(link.href)) return true;
		return kind === 'catalog'
			? visibleCatalogItems.some((item) => matches(item.href))
			: kind === 'services' && visibleServiceItems.some((item) => matches(item.href));
	}

	function close(refocus: MenuKind | null = null) {
		openMenu = null;
		openedBy = null;
		hoverSuppressed = true;
		if (refocus) triggerEls[refocus]?.focus();
	}

	function toggle(kind: MenuKind) {
		if (openMenu === kind && openedBy === 'intent') return close();
		openMenu = kind;
		openedBy = 'intent';
	}

	function enter(kind: MenuKind | null, event: PointerEvent) {
		if (event.pointerType !== 'mouse' || openedBy === 'intent' || hoverSuppressed) return;
		openMenu = kind;
		openedBy = kind ? 'hover' : null;
	}

	function leave() {
		hoverSuppressed = false;
		if (openedBy !== 'hover' || rootEl?.contains(document.activeElement)) return;
		openMenu = null;
		openedBy = null;
	}

	async function onTriggerKeydown(event: KeyboardEvent, kind: MenuKind) {
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		event.preventDefault();
		openMenu = kind;
		openedBy = 'intent';
		await tick();
		const items = rootEl?.querySelectorAll<HTMLAnchorElement>(
			`[data-panel="${kind}"] a:not([aria-disabled="true"])`
		);
		(event.key === 'ArrowUp' ? items?.[items.length - 1] : items?.[0])?.focus();
	}

	function onFocusOut(event: FocusEvent) {
		if (event.relatedTarget instanceof Node && !rootEl?.contains(event.relatedTarget)) close();
	}

	$effect(() => {
		if (!openMenu) return;
		const opened = openMenu;
		const onPointerDown = (event: PointerEvent) => {
			if (rootEl && !rootEl.contains(event.target as Node)) close();
		};
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				close(opened);
			}
		};
		window.addEventListener('pointerdown', onPointerDown);
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('keydown', onKey);
		};
	});

	$effect(() => {
		$page.url.pathname;
		openMenu = null;
		openedBy = null;
		hoverSuppressed = false;
	});
</script>

{#snippet panel(kind: MenuKind)}
	{@const items = kind === 'catalog' ? visibleCatalogItems : visibleServiceItems}
	{@const disabled = kind === 'catalog' ? disabledRubrics : disabledServices}
	{@const onToggle: ToggleHandler = kind === 'catalog' ? onToggleRubric : onToggleService}
	<div class="panel-bridge" aria-hidden="true"></div>
	<div
		id="{uid}-{kind}"
		data-panel={kind}
		class="ribbon-panel p1-overlay p1-border"
		transition:fly={{ y: -6, duration: motion.enterDuration }}
	>
		{#each items as item (item.href)}
			{@const unavailable = item.comingSoon === true}
			{@const enabled = !unavailable && !disabled.includes(item.href)}
			<div class="panel-row p1-line" class:unavailable={unavailable || (isEditable && !enabled)}>
				<a
					href={unavailable ? undefined : item.href}
					role={unavailable ? 'link' : undefined}
					class="panel-link p1-title p1-accent-hover"
					aria-disabled={unavailable || (isEditable && !enabled)}
					aria-current={matches(item.href) ? 'page' : undefined}
					tabindex={unavailable || (isEditable && !enabled) ? -1 : undefined}
					data-goal-ignore="Переход в раздел меню, не форма обращения"
					onclick={(event) => {
						if (unavailable || (isEditable && !enabled)) event.preventDefault();
						else close();
					}}
				>
					<span class="panel-label">{item.label}</span>
					{#if item.desc}<span class="p1-note p1-muted">{item.desc}</span>{/if}
					{#if unavailable}<span class="p1-note p1-muted">Скоро</span>
					{:else if isEditable && !enabled}<span class="p1-note p1-muted">Скрыто на сайте</span
						>{/if}
				</a>
				{#if isEditable && !unavailable}
					<button
						type="button"
						class="visibility-toggle"
						class:enabled
						role="switch"
						aria-checked={enabled}
						aria-label="Показывать раздел «{item.label}»"
						data-goal-ignore="Настройка видимости раздела сайта"
						onclick={(event) => onToggle(item.href, enabled, event)}><span></span></button
					>
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

<nav
	bind:this={rootEl}
	data-p1-theme="light"
	class="ribbon-menu"
	aria-label="Основная навигация"
	onfocusout={onFocusOut}
>
	{#each links as link, index (`${link.href}-${index}`)}
		{@const kind = kindOf(link)}
		{@const shape = tabGeometry(index)}
		<div
			class="ribbon-item"
			class:current={isCurrent(link)}
			class:expanded={kind !== null && openMenu === kind}
			class:terminal={index === links.length - 1}
			use:measureTab={index}
			style:--tab-content-offset="{index === 0 ? 0 : shape.slant / 2}px"
			role="group"
			onpointerenter={(event) => enter(kind, event)}
			onpointerleave={leave}
		>
			<svg
				class="tab-background"
				style:left="{-shape.left}px"
				style:width="calc(100% + {shape.left + shape.slant}px)"
				style:z-index={links.length - index}
				viewBox="0 0 {shape.width} {shape.height}"
				preserveAspectRatio="none"
				aria-hidden="true"
			>
				<defs>
					<linearGradient id="{uid}-tab-{index}" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" class="tab-highlight" />
						<stop offset="0.45" class="tab-fill" />
						<stop offset="1" class="tab-depth" />
					</linearGradient>
				</defs>
				<path d={shape.path} fill="url(#{uid}-tab-{index})" />
			</svg>
			{#if kind}
				<button
					bind:this={triggerEls[kind]}
					type="button"
					class="ribbon-tab"
					aria-expanded={openMenu === kind}
					aria-controls="{uid}-{kind}"
					data-goal-ignore="Раскрытие навигации сайта, не форма обращения"
					onclick={() => toggle(kind)}
					onkeydown={(event) => onTriggerKeydown(event, kind)}
				>
					<span class="tab-content">
						<span>{link.label}</span>
						<svg
							class="chevron"
							class:rotated={openMenu === kind}
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg
						>
					</span>
				</button>
				{#if openMenu === kind}{@render panel(kind)}{/if}
			{:else}
				<a href={link.href} class="ribbon-tab" aria-current={isCurrent(link) ? 'page' : undefined}
					><span class="tab-content">{link.label}</span></a
				>
			{/if}
		</div>
	{/each}
</nav>

<style>
	.ribbon-menu {
		--tab-fill: var(--ds-accent-surface);
		--tab-ink: var(--ds-on-accent);
		--tab-shade: color-mix(in srgb, var(--ds-scrim) 30%, transparent);
		position: relative;
		display: flex;
		align-items: stretch;
		padding: 0 1.8rem 0.55rem 0;
		isolation: isolate;
		font-family: var(--ds-font-body);
	}
	.ribbon-menu::before {
		content: '';
		position: absolute;
		inset: 0 -0.75rem 0 0;
		z-index: -1;
		border-radius: var(--ds-radius-xl) var(--ds-radius-sm) 0 0;
		background: linear-gradient(var(--ds-surface-raised) 60%, var(--ds-ink-200));
		box-shadow:
			0 1px 0 var(--ds-surface-raised),
			0 3px 0 var(--ds-ink-200),
			0 5px 0 var(--ds-surface-raised);
	}
	.ribbon-item {
		position: relative;
		flex: 1 1 auto;
		isolation: auto;
	}
	.ribbon-item.terminal {
		--tab-fill: color-mix(in srgb, var(--ds-accent-surface) 25%, var(--ds-cat-2-700));
	}
	.ribbon-item.current {
		--tab-fill: var(--ds-surface-raised);
		--tab-ink: var(--ds-ink-600);
	}

	.ribbon-tab {
		position: relative;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 3.25rem;
		padding: 0.75rem clamp(0.8rem, 1.35vw, 1.75rem);
		width: 100%;
		border: 0;
		background: transparent;
		color: var(--tab-ink);
		font-size: var(--text-sm);
		font-weight: 500;
		line-height: 1.25;
		text-transform: uppercase;
		white-space: nowrap;
		text-decoration: none;
		cursor: pointer;
	}
	.tab-content {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		translate: var(--tab-content-offset) 0;
	}
	.tab-background {
		position: absolute;
		top: 0;
		height: 100%;
		overflow: visible;
		pointer-events: none;
		filter: drop-shadow(3px 2px 3px var(--tab-shade));
		transition: filter var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}
	.tab-highlight {
		stop-color: color-mix(in srgb, var(--tab-fill) 90%, var(--ds-surface-raised));
	}
	.tab-fill {
		stop-color: var(--tab-fill);
	}
	.tab-depth {
		stop-color: color-mix(in srgb, var(--tab-fill) 88%, var(--ds-scrim));
	}
	.ribbon-item:has(.ribbon-tab:hover) .tab-background,
	.expanded .tab-background {
		filter: drop-shadow(3px 2px 3px var(--tab-shade)) brightness(1.08);
	}
	.ribbon-tab:focus-visible {
		outline: 2px solid var(--tab-ink);
		outline-offset: -5px;
		border-radius: var(--ds-radius-md);
	}
	.chevron {
		flex-shrink: 0;
		transition: transform var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}
	.chevron.rotated {
		transform: rotate(180deg);
	}
	.panel-bridge {
		position: absolute;
		top: 100%;
		z-index: 40;
		left: 0;
		width: 100%;
		height: 1rem;
	}
	.ribbon-panel {
		position: absolute;
		top: calc(100% + 0.8rem);
		z-index: 50;
		left: 50%;
		translate: -50% 0;
		width: 22rem;
		max-height: min(36rem, calc(100dvh - 10rem));
		overflow-y: auto;
		overscroll-behavior: contain;
		border-width: 1px;
		border-radius: var(--ds-radius-lg);
		scrollbar-color: var(--ds-ink-400) var(--ds-surface-raised);
		scrollbar-width: thin;
	}
	.panel-row {
		display: flex;
		align-items: center;
	}
	.panel-row + .panel-row {
		border-top-width: 1px;
	}
	.panel-row.unavailable {
		opacity: 0.5;
	}
	.panel-link {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.8rem 1rem;
		text-decoration: none;
	}
	.panel-label {
		font-size: var(--text-lg);
		font-weight: 600;
	}
	.panel-link:focus-visible,
	.visibility-toggle:focus-visible {
		outline: 2px solid var(--ds-accent-surface);
		outline-offset: -3px;
	}
	.visibility-toggle {
		width: 2.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		margin-right: 1rem;
		padding: 2px;
		border-radius: var(--ds-radius-full);
		background: var(--ds-ink-300);
		cursor: pointer;
	}
	.visibility-toggle.enabled {
		background: var(--ds-accent-surface);
	}
	.visibility-toggle span {
		display: block;
		height: 1rem;
		width: 1rem;
		border-radius: var(--ds-radius-full);
		background: var(--ds-surface-raised);
		transition: transform var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}
	.visibility-toggle.enabled span {
		transform: translateX(1rem);
	}
	@media (max-width: 1199px) {
		.ribbon-tab {
			padding-inline: 0.85rem;
			font-size: var(--ds-font-label-size);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.tab-background,
		.chevron,
		.visibility-toggle span {
			transition: none;
		}
	}
</style>
