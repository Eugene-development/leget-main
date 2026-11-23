<script lang="ts">
	// Артикул: 1.1.6.4 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { editableText } from '$lib/utils/editable-text';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import {
		INCENTIVES_DEFAULT_GALLERY,
		INCENTIVES_DEFAULT_TEXT,
		INCENTIVES_DEFAULT_TITLE,
		resolveIncentivesGallery
	} from '../data';
	import '../../../../theme.css';

	const photoDirectory =
		'https://storage.yandexcloud.net/leget-main/templates/promo-1/incentives/v4';
	const photos = [
		{
			file: 'price-estimate.webp',
			alt: 'Образцы отделки, калькулятор и чертёж мебели на рабочем столе'
		},
		{
			file: 'timeline-installation.webp',
			alt: 'Монтажник устанавливает фасад выдвижного ящика'
		},
		{
			file: 'quality-joinery.webp',
			alt: 'Крупный план точного стыка дубовой столешницы и мебельных фасадов'
		},
		{
			file: 'service-consultation.webp',
			alt: 'Дизайнер обсуждает с клиентом эскиз кухни и образцы отделки'
		}
	];
	// Стартовые фотографии v4 подставляются при рендере. Данные галереи общие для всех версий.
	const stockPhotos = new Map(
		INCENTIVES_DEFAULT_GALLERY.map(({ src, alt }, index) => [
			src,
			{ ...photos[index], stockAlt: alt }
		])
	);
	const srcAliases = new Map(
		Array.from(stockPhotos, ([src, { file }]) => [src, `${photoDirectory}/${file}`])
	);

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'light'));
	const gallery = $derived(resolveIncentivesGallery(data?.gallery));

	function enableKeyboardScroll(viewer: HTMLElement) {
		const observer = new ResizeObserver(() => {
			if (viewer.scrollWidth > viewer.clientWidth) viewer.tabIndex = 0;
			else viewer.removeAttribute('tabindex');
		});
		observer.observe(viewer);
		return () => observer.disconnect();
	}

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}

	function saveGalleryLabel(index: number, label: string) {
		return saveField(
			'gallery',
			gallery.map((item, itemIndex) => (itemIndex === index ? { ...item, label } : item))
		);
	}
</script>

<section
	class="p1-surface benefits-spread py-section-2xs sm:py-section-xs"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="spread-intro">
			<EditableField
				fieldKey="Incentives.title"
				label="Заголовок"
				value={editableText(data?.title, INCENTIVES_DEFAULT_TITLE)}
				{isEditable}
				onSave={(value) => saveField('title', value)}
			>
				{#snippet children(value)}
					<h2 class="p1-title text-section-title text-balance lg:text-page-title">
						<RichText {value} />
					</h2>
				{/snippet}
			</EditableField>

			<div class="spread-copy">
				<EditableField
					legacyHtml
					fieldKey="Incentives.text"
					label="Текст"
					value={editableText(data?.text, INCENTIVES_DEFAULT_TEXT)}
					{isEditable}
					multiline
					onSave={(value) => saveField('text', value)}
					class="p1-body wrap-anywhere"
				>
					{#snippet children(value)}<RichText {value} legacyHtml />{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Incentives.ctaText"
					label="Текст кнопки"
					value={editableText(data?.ctaText, 'Получить консультацию')}
					{isEditable}
					onSave={(value) => saveField('ctaText', value)}
					class="justify-self-start"
				>
					{#snippet children(value)}
						{#if value.trim() || isEditable}
							<button
								type="button"
								data-metrika-goal="pages_home_incentives_v4_incentives_open_1"
								data-goal-label="Консультация (текст кнопки настраивается)"
								data-goal-action="open"
								onclick={() => serviceOrderStore.open('consultation')}
								class="spread-action inline-flex cursor-pointer items-center gap-3 rounded-full bg-accent-surface px-5 py-3 text-left text-sm font-semibold text-on-accent hover:bg-accent-surface-deep"
							>
								<span class="wrap-anywhere"
									><RichText value={value || 'Получить консультацию'} /></span
								>
								<svg
									class="size-4 shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									aria-hidden="true"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M4 12h15m-6-6 6 6-6 6" />
								</svg>
							</button>
						{/if}
					{/snippet}
				</EditableField>
			</div>
		</div>

		<div class="spread-view" role="region" aria-label="Выгоды" {@attach enableKeyboardScroll}>
			<ul class="spread-frames" role="list">
				{#each gallery as item, index (index)}
					{@const stockPhoto = stockPhotos.get(item.src)}
					<li class="spread-frame">
						<figure>
							<div class="spread-photo p1-body">
								<ImageFallback
									imagePath={['gallery', index, 'src']}
									imageDefaults={{ gallery }}
									src={item.src}
									{srcAliases}
									alt={stockPhoto?.stockAlt === item.alt ? stockPhoto.alt : item.alt}
									loading="lazy"
									decoding="async"
									class="h-full w-full object-cover"
								/>
							</div>
							<figcaption class="spread-caption">
								<EditableField
									fieldKey={`Incentives.gallery.${index}.label`}
									label={`Название выгоды ${index + 1}`}
									value={item.label}
									{isEditable}
									onSave={(value) => saveGalleryLabel(index, value)}
								>
									{#snippet children(value)}
										<p class="p1-title ds-title-display text-subsection-title wrap-anywhere">
											<RichText {value} />
										</p>
									{/snippet}
								</EditableField>
							</figcaption>
						</figure>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.benefits-spread {
		container-type: inline-size;
	}

	.spread-intro {
		display: grid;
		gap: calc(var(--spacing) * 5);
		margin-block-end: calc(var(--ds-spacing-section-xs) / 3);
	}

	.spread-copy {
		display: grid;
		min-width: 0;
		gap: calc(var(--spacing) * 5);
		max-width: 50ch;
	}

	.spread-action {
		min-height: 44px;
		transition: background-color var(--ds-motion-duration-ui) var(--ds-motion-ease-ui);
	}

	.spread-action:focus-visible,
	.spread-view:focus-visible {
		outline: 2px solid var(--p1-field-focus);
		outline-offset: 3px;
	}

	.spread-view {
		overflow-x: auto;
		overscroll-behavior-inline: contain;
		scroll-snap-type: inline mandatory;
		scrollbar-color: var(--p1-rail) var(--p1-surface-paper);
		scrollbar-width: thin;
	}

	.spread-frames {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: min(82%, 24rem);
	}

	.spread-frame {
		min-width: 0;
		background: var(--p1-surface-paper);
		border-block: 1px solid var(--p1-border);
		scroll-snap-align: start;
	}

	.spread-frame + .spread-frame {
		border-inline-start: 1px solid var(--p1-border);
	}

	.spread-photo {
		height: clamp(13rem, 52cqi, 21rem);
		background: var(--p1-card);
	}

	.spread-caption {
		padding: calc(var(--spacing) * 4) calc(var(--spacing) * 5);
	}

	@container (min-width: 62rem) {
		.spread-intro {
			grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
			align-items: start;
			gap: calc(var(--spacing) * 8);
		}

		.spread-view {
			overflow: visible;
		}

		.spread-frames {
			grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr) minmax(0, 0.9fr) minmax(0, 1.2fr);
		}

		.spread-photo {
			height: clamp(18rem, 24cqi, 21rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spread-action {
			transition: none;
		}
	}
</style>
