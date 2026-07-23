<script lang="ts">
	import type { Component } from 'svelte';
	import { auth } from '$lib/stores/auth';
	import { browser } from '$app/environment';
	import { deleteComponentData, type EditContext } from '$lib/utils/page-edit';
	import { invalidateAll } from '$app/navigation';
	import EditModal from '$lib/components/EditModal.svelte';
	import { fly, fade } from 'svelte/transition';

	// Template registries — each template exports its own component map
	import * as TestTemplate from './templates/Test';
	import * as Promo1Template from './templates/Promo-1';
	import * as Promo2Template from './templates/Promo-2';
	import * as Promo3Template from './templates/Promo-3';

	type ComponentMap = Record<
		string,
		Component<{
			data: Record<string, unknown>;
			editContext?: EditContext | null;
			isEditable?: boolean;
		}>
	>;

	interface TemplateModule {
		Banner?: Component<{
			data: Record<string, unknown>;
			editContext?: EditContext | null;
			isEditable?: boolean;
		}>;
		Header?: Component<{
			data: Record<string, unknown>;
			editContext?: EditContext | null;
			isEditable?: boolean;
		}>;
		Footer?: Component<{
			data: Record<string, unknown>;
			editContext?: EditContext | null;
			isEditable?: boolean;
		}>;
		pageOverrides?: Record<string, ComponentMap>;
	}

	interface PageComponent {
		id?: string | null;
		type: string;
		data: Record<string, unknown>;
	}

	let {
		templateId = null,
		slug = null,
		components = [],
		headerData = null,
		footerData = null,
		editContext = null
	}: {
		templateId: number | null;
		slug: string | null;
		components: PageComponent[];
		headerData: Record<string, unknown> | null;
		footerData: Record<string, unknown> | null;
		editContext: EditContext | null;
	} = $props();

	// Локальное состояние-зеркало headerData. Нужно для мгновенной реактивности:
	// Header обновляет disabledRubrics/disabledServices через handleToggleRubric и
	// присваивает `data = updatedData`. Чтобы Footer увидел это изменение без
	// перезагрузки, прокидываем в Header через bind:, а Footer читает из того же
	// стейта. $effect синхронизирует зеркало с внешним пропсом на случай обновления
	// данных с сервера (например, invalidateAll после сброса блока).
	let headerDataState = $state<Record<string, unknown>>({});
	$effect(() => {
		headerDataState = headerData ?? {};
	});

	const componentsWithSwitcher = new Set([
		'HeroMain',
		'Message',
		'PromoOffer',
		'Equipment',
		'Stage',
		'Incentives',
		'Brands',
		'ActionsCards',
		'KitchensGallery',
		'WardrobesGallery',
		'DesignersTracks',
		'ActionsSteps',
		'DesignersBenefits',
		'KitchenStyles',
		'DesignersSteps'
	]);

	let isResetting = $state(false);
	let showConfirmModal = $state(false);
	let activeResetId = $state<string | null>(null);
	let activeResetType = $state<string>('');

	function handleResetComponent(id: string, type: string) {
		if (!editContext) return;
		activeResetId = id;
		activeResetType = type;
		showConfirmModal = true;
	}

	async function confirmReset() {
		if (!editContext || !activeResetId || isResetting) return;
		isResetting = true;
		try {
			await deleteComponentData(editContext, activeResetId);
			showConfirmModal = false;
			activeResetId = null;
			await invalidateAll();
		} catch (err) {
			console.error(`Ошибка при сбросе контента блока:`, err);
			alert(err instanceof Error ? err.message : 'Не удалось сбросить контент');
		} finally {
			isResetting = false;
		}
	}

	// Инициализируем auth в браузере
	$effect(() => {
		if (browser) {
			auth.init();
		}
	});

	let previousAuth = $state<boolean | null>(null);
	$effect(() => {
		if (browser) {
			if (previousAuth !== null && previousAuth !== $auth.isAuthenticated) {
				invalidateAll();
			}
			previousAuth = $auth.isAuthenticated;
		}
	});

	const isEditable = $derived(
		browser && $auth.isAuthenticated && (editContext !== null || slug !== null) // Allow editing if we have a slug as fallback
	);

	/**
	 * Map templateId (from License) to a template module.
	 * null / undefined → fallback to Test template.
	 */
	function resolveTemplate(id: number | null): TemplateModule {
		switch (id) {
			case 1:
				return Promo1Template as unknown as TemplateModule;
			case 2:
				return Promo2Template as unknown as TemplateModule;
			case 3:
				return Promo3Template as unknown as TemplateModule;
			default:
				return TestTemplate as unknown as TemplateModule;
		}
	}

	/**
	 * Resolve page-specific component map by slug.
	 */
	function resolveComponentMap(tmpl: TemplateModule, pageSlug: string | null): ComponentMap {
		if (!pageSlug || !tmpl.pageOverrides) return {};

		// 1. Exact match
		if (tmpl.pageOverrides[pageSlug]) {
			return tmpl.pageOverrides[pageSlug];
		}

		// 2. Pattern matching (dynamic routes)
		const cleanSlug = pageSlug.startsWith('/') ? pageSlug : '/' + pageSlug;

		// /mebel/{category}/{project}
		if (cleanSlug.match(/^\/mebel\/[^\/]+\/[^\/]+$/)) {
			return tmpl.pageOverrides['/mebel/{category}/{project}'] || {};
		}

		// /mebel/{category}
		if (cleanSlug.match(/^\/mebel\/[^\/]+$/)) {
			return tmpl.pageOverrides['/mebel/{category}'] || {};
		}

		return {};
	}

	const template = $derived(resolveTemplate(templateId));
	const componentMap = $derived(resolveComponentMap(template, slug));

	// Layout components come from the template module directly (layout/)
	const Banner = $derived(template.Banner ?? null);
	const Header = $derived(template.Header ?? null);
	const Footer = $derived(template.Footer ?? null);

	// Footer (Promo-1) — теперь page-компонент на глобальной странице '__global__':
	// ищем его среди компонентов. Если есть — рендерим из него (с настоящим id/`_componentId`),
	// иначе fallback на старый footerData (для шаблонов без компонентного футера).
	const footerComponent = $derived(components.find((c) => c.type === 'Footer') ?? null);
	// Апсёрт футера всегда идёт на глобальную страницу, независимо от текущей.
	const footerEditContext = $derived(
		editContext ? { ...editContext, pageId: 'slug:__global__', slug: '__global__' } : null
	);
	// Компоненты текущей страницы без футера — он рендерится отдельно (внизу).
	const pageComponents = $derived(components.filter((c) => c.type !== 'Footer'));
</script>

{#if Banner}
	<Banner data={headerDataState} {editContext} {isEditable} />
{/if}

{#if Header}
	<Header bind:data={headerDataState} {editContext} {isEditable} />
{/if}

{#each pageComponents as element (element.type)}
	{@const Component = componentMap[element.type] ?? null}
	{#if Component}
		<div class="group/component relative">
			<Component bind:data={element.data} {editContext} {isEditable} />

			{#if isEditable && element.id && !componentsWithSwitcher.has(element.type)}
				<div
					class="pointer-events-none absolute top-6 right-6 z-40 opacity-0 transition-opacity duration-300 group-hover/component:opacity-100"
				>
					<button
						type="button"
						class="pointer-events-auto cursor-pointer rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-2.5 text-xs font-bold tracking-wider text-white uppercase shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-red-500/30 hover:bg-red-950/80 hover:text-red-200 active:scale-95"
						onclick={() => handleResetComponent(element.id!, element.type)}
						disabled={isResetting}
					>
						<span>{isResetting ? 'Сброс...' : 'Сброс'}</span>
					</button>
				</div>
			{/if}
		</div>
	{/if}
{/each}

{#if Footer}
	<Footer
		data={footerComponent
			? {
					// Компонентный футер: bridge-поля хэдера последними → живой хэдер перекрывает
					// возможные устаревшие копии из сохранённых данных компонента.
					...footerComponent.data,
					logoUrl: headerDataState.logoUrl,
					disabledRubrics: headerDataState.disabledRubrics,
					disabledServices: headerDataState.disabledServices
				}
			: {
					logoUrl: headerDataState.logoUrl,
					disabledRubrics: headerDataState.disabledRubrics,
					disabledServices: headerDataState.disabledServices,
					...footerData
				}}
		editContext={footerComponent ? footerEditContext : editContext}
		{isEditable}
	/>
{/if}

{#if isEditable}
	<EditModal />
{/if}

{#if showConfirmModal}
	<div
		class="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop click to close -->
		<button
			type="button"
			class="absolute inset-0 h-full w-full cursor-default border-none bg-transparent outline-none"
			onclick={() => (showConfirmModal = false)}
			aria-label="Закрыть"
		></button>

		<!-- Modal Card -->
		<div
			class="font-sans-premium relative z-10 flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-white/10 bg-slate-900/95 p-6 text-center shadow-2xl backdrop-blur-2xl"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<!-- Warning Icon Container with subtle red glow -->
			<div
				class="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
			>
				<svg class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			<!-- Typography -->
			<div class="flex flex-col gap-2">
				<h3 class="text-lg font-extrabold tracking-tight text-white uppercase">
					Сбросить изменения?
				</h3>
				<p class="text-xs leading-relaxed font-medium text-slate-400">
					Вы уверены, что хотите сбросить контент блока
					<span class="font-bold text-slate-200">"{activeResetType}"</span>
					к начальному состоянию? Все изменения будут безвозвратно удалены.
				</p>
			</div>

			<!-- Buttons Row -->
			<div class="mt-2 flex w-full items-center gap-3">
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all duration-300 hover:bg-white/10 active:scale-98"
					onclick={() => (showConfirmModal = false)}
				>
					Отмена
				</button>
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-3 text-xs font-bold tracking-wider text-white uppercase transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20 hover:brightness-110 active:scale-98"
					onclick={confirmReset}
					disabled={isResetting}
				>
					{isResetting ? 'Сброс...' : 'Да, сбросить'}
				</button>
			</div>
		</div>
	</div>
{/if}
