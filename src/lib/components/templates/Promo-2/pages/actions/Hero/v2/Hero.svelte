<script lang="ts">
	// Артикул: 2.8.1.2 — см. docs/architecture/component-articles-map.md
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

<section class="actions-hero ah-editorial" data-p1-theme={blockTheme(data)} id="promo-hero">
	<div class="ah-shell">
		<div class="ah-editorial-grid">
			<div class="ah-editorial-copy">
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
				<HeroStats bind:data {editContext} {isEditable} />
			</div>
			<div class="ah-editorial-media">
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
				<div class="ah-editorial-offer">
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
				</div>
			</div>
		</div>
	</div>
</section>
