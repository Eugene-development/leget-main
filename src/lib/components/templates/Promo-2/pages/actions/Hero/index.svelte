<script lang="ts">
	import { getContext } from 'svelte';
	import { PAGE_COMPONENT_DATA_CONTEXT, type PageComponentDataLookup } from '$lib/utils/page-component-data';
	import { usePromotionClock } from '$lib/promotions/clock.svelte';
	import { promotionDeadline, promotionIsActive, type PromotionSchedule } from '$lib/promotions/time';
	import HeroV1 from './v1/Hero.svelte';
	import HeroV2 from './v2/Hero.svelte';
	import HeroV3 from './v3/Hero.svelte';
	import HeroV4 from './v4/Hero.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import type { EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally — VersionSwitcher синхронизирует дальнейшие изменения.
	let selectedVersion = $state<'v1' | 'v2' | 'v3' | 'v4' | 'disabled'>(
		(data?.heroVersion as 'v1' | 'v2' | 'v3' | 'v4' | 'disabled') ?? 'v1'
	);

	// The headline is page navigation. The advertised discount belongs to the banner.
	const pageComponent = getContext<PageComponentDataLookup | undefined>(PAGE_COMPONENT_DATA_CONTEXT);
	const banner = $derived(pageComponent?.('ActionsBanner'));
	const cards = $derived(pageComponent?.('ActionsCards'));
	const cardList = $derived(Array.isArray(cards?.cards) ? cards.cards as PromotionSchedule[] : []);
	const now = usePromotionClock(() => [
		promotionDeadline(banner ?? {}),
		...cardList.map((card) => promotionDeadline(card))
	]);
	const showOffer = $derived(isEditable || !pageComponent || (
		banner && banner.actionsBannerVersion !== 'disabled' && promotionIsActive(banner, now())
	));
	const showStats = $derived(showOffer && (
		isEditable || !pageComponent ||
		(cards && cards.actionsCardsVersion !== 'disabled' && cardList.length > 0 &&
			cardList.every((card) => promotionIsActive(card, now())))
	));
</script>

{#if selectedVersion !== 'disabled' || isEditable}
	<div class="relative w-full" class:opacity-40={selectedVersion === 'disabled'}>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="Hero"
			versionKey="heroVersion"
			versions={['v1', 'v2', 'v3', 'v4']}
			themeVersions={['v2', 'v3', 'v4']}
			themeDefault="light"
			title="Акции — первый экран"
			bind:selectedVersion
		/>
		{#if selectedVersion === 'v4'}
			<HeroV4 bind:data {editContext} {isEditable} showOffer={Boolean(showOffer)} showStats={Boolean(showStats)} />
		{:else if selectedVersion === 'v3'}
			<HeroV3 bind:data {editContext} {isEditable} showOffer={Boolean(showOffer)} showStats={Boolean(showStats)} />
		{:else if selectedVersion === 'v2'}
			<HeroV2 bind:data {editContext} {isEditable} showOffer={Boolean(showOffer)} showStats={Boolean(showStats)} />
		{:else}
			<HeroV1 bind:data {editContext} {isEditable} showOffer={Boolean(showOffer)} showStats={Boolean(showStats)} />
		{/if}
	</div>
{/if}
