<script lang="ts">
	// Артикул: 2.8.1.3 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { blockTheme } from '$lib/utils/block-theme';
	import type { EditContext } from '$lib/utils/page-edit';
	import HeroField from '../HeroField.svelte';
	import HeroLink from '../HeroLink.svelte';
	import HeroStats from '../HeroStats.svelte';
	import '../../../../../Promo-1/theme.css';
	import '../hero.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
</script>

<section class="actions-hero ah-poster" data-p1-theme={blockTheme(data)} id="promo-hero">
	<div class="ah-shell">
		<div class="ah-poster-heading">
			<h1 class="ah-title">
				<HeroField
					bind:data
					{editContext}
					{isEditable}
					field="title"
					label="Заголовок"
					fallback="Скидки & акции"
				/>
			</h1>
			<p class="ah-label">
				<HeroField
					bind:data
					{editContext}
					{isEditable}
					field="label"
					label="Подпись"
					fallback="Специальные предложения"
				/>
			</p>
		</div>
		<div class="ah-poster-grid">
			<div class="ah-poster-offer">
				<div class="ah-offer">
					<span class="ah-note">Скидки до</span>
					<div class="ah-discount">
						<HeroField
							bind:data
							{editContext}
							{isEditable}
							field="discountBadge"
							label="Бейдж скидки"
							fallback="−30%"
						/>
					</div>
				</div>
				{#if data?.description || isEditable}<div class="ah-description">
						<HeroField
							bind:data
							{editContext}
							{isEditable}
							field="description"
							label="Описание"
							fallback=""
							multiline
						/>
					</div>{/if}
				<div class="ah-action"><HeroLink bind:data {editContext} {isEditable} /></div>
			</div>
			<div class="ah-poster-media">
				<ImageFallback
					imagePath={['image']}
					src={String(
						data?.image ?? 'https://storage.yandexcloud.net/zovtop/bg/promosfvmwklfvmk.jpg'
					)}
					alt={String(data?.title ?? 'Акции на мебель')}
					class="ah-photo"
					loading="eager"
					fetchpriority="high"
				/>
			</div>
		</div>
		<div class="ah-poster-footer">
			<HeroStats bind:data {editContext} {isEditable} /><a class="ah-browse" href="#actions-cards"
				>Смотреть акции <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"
					><path
						d="M12 4v16m-6-6 6 6 6-6"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/></svg
				></a
			>
		</div>
	</div>
</section>
