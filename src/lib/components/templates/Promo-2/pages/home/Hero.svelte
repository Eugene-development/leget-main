<script lang="ts">
	import { openPromo2Form } from '$lib/components/templates/Promo-2/forms/request';
	// Артикул: 2.1.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { richTextToPlainText } from '$lib/utils/rich-text';

	let {
		data = $bindable(),
		editContext = null,
		componentId = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		componentId?: string | null;
		isEditable?: boolean;
	} = $props();
	const label = $derived(String(data?.label ?? ''));
	const hasLabel = $derived(richTextToPlainText(label).trim().length > 0);

	// svelte-ignore state_referenced_locally — дальнейшие изменения синхронизирует VersionSwitcher.
	let selectedVersion = $state<'v1' | 'disabled'>(
		data?.heroVersion === 'disabled' ? 'disabled' : 'v1'
	);
	const logoUrl = $derived(typeof data?.logoUrl === 'string' ? data.logoUrl.trim() : '');
	const logoWidth = $derived.by(() => {
		const width = Number(data?.logoWidth);
		return Number.isFinite(width) && width > 0 ? Math.min(320, Math.max(24, width)) : 80;
	});
	let widthDraft = $state<number | undefined>(80);
	let savingLogoSize = $state(false);
	let logoSizeError = $state('');
	$effect(() => {
		widthDraft = logoWidth;
	});

	async function saveLogoSize() {
		if (!editContext || savingLogoSize) return;
		logoSizeError = '';
		if (
			widthDraft === undefined ||
			!Number.isFinite(widthDraft) ||
			widthDraft < 24 ||
			widthDraft > 320
		) {
			logoSizeError = 'Укажите ширину от 24 до 320 пикселей.';
			return;
		}
		savingLogoSize = true;
		try {
			const width = Math.round(widthDraft);
			await saveComponentData(editContext, 'Hero', { ...data, logoWidth: width });
			data = { ...data, logoWidth: width };
			widthDraft = width;
		} catch {
			logoSizeError = 'Не удалось сохранить размер. Повторите попытку.';
		} finally {
			savingLogoSize = false;
		}
	}

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}

	let heroVisible = $state(false);
	let activeVideo = $state(0);
	let videoEls = $state<HTMLVideoElement[]>([]);
	let switching = [false, false];
	let isDesktop = $state(false);

	const heroVideos = [
		'https://storage.yandexcloud.net/zovtop/video/videomainkjfhwirj.mp4',
		'https://storage.yandexcloud.net/zovtop/video/videomain-2kknh.mp4'
	];

	function onVideoTimeUpdate(i: number) {
		const el = videoEls[i];
		if (!el || switching[i]) return;
		if (el.duration && el.currentTime >= el.duration - 0.5) {
			switching[i] = true;
			el.pause();
			const next = (i + 1) % heroVideos.length;
			const nextEl = videoEls[next];
			if (nextEl) {
				nextEl.currentTime = 0;
				nextEl.play();
			}
			activeVideo = next;
			setTimeout(() => {
				switching[i] = false;
			}, 2000);
		}
	}

	onMount(() => {
		heroVisible = true;
		isDesktop = window.matchMedia('(min-width: 768px)').matches;
	});
</script>

{#snippet logoSettings()}
	<section class="flex flex-col gap-4 text-on-dark">
		<h4 class="text-sm font-medium">Логотип перед заголовком</h4>
		<p class="text-sm leading-relaxed text-ink-300">
			Добавьте логотип в разделе «Изображения» ниже. Высота подстраивается под его пропорции.
		</p>
		<label class="flex flex-col gap-2 text-sm">
			Ширина логотипа, px
			<input
				type="number"
				min="24"
				max="320"
				step="1"
				bind:value={widthDraft}
				oninput={() => (logoSizeError = '')}
				disabled={savingLogoSize}
				class="min-h-11 w-full rounded-xl border border-on-dark/20 bg-transparent p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400"
			/>
		</label>
		<input
			type="range"
			min="24"
			max="320"
			step="1"
			bind:value={widthDraft}
			oninput={() => (logoSizeError = '')}
			disabled={savingLogoSize}
			aria-label="Ширина логотипа"
			class="min-h-11 w-full cursor-pointer accent-link-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400"
		/>
		{#if logoSizeError}<p role="alert" class="text-sm">{logoSizeError}</p>{/if}
		<button
			type="button"
			onclick={saveLogoSize}
			disabled={savingLogoSize || widthDraft === logoWidth}
			data-goal-ignore="Сохранение размера логотипа владельцем сайта"
			class="min-h-11 cursor-pointer rounded-xl bg-link-600 px-4 py-3 text-sm font-medium text-on-dark hover:bg-link-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-400 disabled:cursor-default disabled:opacity-50"
		>
			{savingLogoSize ? 'Сохранение…' : 'Сохранить размер'}
		</button>
	</section>
{/snippet}

{#if selectedVersion !== 'disabled' || isEditable}
	<section
		class="relative min-h-[90vh] overflow-hidden bg-surface"
		class:opacity-40={selectedVersion === 'disabled'}
		id="hero"
	>
		<VersionSwitcher
			bind:data
			{editContext}
			{isEditable}
			componentType="Hero"
			resetId={componentId}
			versions={['v1']}
			showVersionMenu={false}
			bind:selectedVersion
			title="Первый экран"
			settings={logoSettings}
		/>
		<!-- Background: static image on mobile, crossfade videos on desktop -->
		<div class="absolute inset-0">
			<!-- Mobile: static image -->
			<ImageFallback
				imagePath={['mobileImage']}
				src={String(data?.mobileImage ?? '')}
				alt={String(data?.title ?? 'Hero')}
				class="h-full w-full object-cover md:hidden"
			/>
			<!-- Desktop: crossfade videos -->
			{#each heroVideos as src, i}
				<video
					src={isDesktop ? src : undefined}
					autoplay={isDesktop && i === 0}
					preload={isDesktop ? 'metadata' : 'none'}
					muted
					playsinline
					bind:this={videoEls[i]}
					ontimeupdate={() => onVideoTimeUpdate(i)}
					class="absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out md:block"
					class:opacity-100={activeVideo === i}
					class:opacity-0={activeVideo !== i}
				></video>
			{/each}
			<div class="absolute inset-0 bg-linear-to-r from-white/85 via-white/50 to-transparent"></div>
			<div class="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent"></div>
		</div>

		<!-- Content -->
		<div class="relative z-10 flex min-h-[85vh] items-start pt-32 md:items-center md:pt-0">
			<div class="p2-container mx-auto w-full">
				<div class="max-w-2xl">
					<!-- Label -->
					{#if isEditable || hasLabel}
						<div
							class="mb-6 opacity-0"
							class:animate-fade-up={heroVisible}
							style="animation-delay: 0.3s"
						>
							<span
								class="inline-flex items-center gap-2 border border-secondary/30 bg-white/60 px-4 py-2 text-[11px] tracking-[0.25em] text-secondary uppercase backdrop-blur-sm"
							>
								<EditableField
									fieldKey="HomeHero.label"
									label="Лейбл"
									value={label}
									{isEditable}
									onSave={(v) => saveField('label', v)}
								>
									{#snippet children(displayValue)}
										<RichText value={displayValue} />
									{/snippet}
								</EditableField>
							</span>
						</div>
					{/if}

					<!-- Heading -->
					<EditableField
						fieldKey="HomeHero.title"
						label="Заголовок"
						value={String(data?.title ?? '')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<h1
								class="text-3xl text-primary opacity-0 md:text-5xl lg:text-6xl"
								style="font-family: var(--font-heading); animation-delay: 0.5s"
								class:animate-fade-up={heroVisible}
							>
								{#if logoUrl}
									<span
										class="mr-[0.25em] inline-block max-w-[40%] align-text-bottom md:max-w-none"
										style:width={`${isEditable && widthDraft !== undefined && Number.isFinite(widthDraft) ? Math.min(320, Math.max(24, widthDraft)) : logoWidth}px`}
									>
										<ImageFallback
											imagePath={['logoUrl']}
											src={logoUrl}
											alt="Логотип компании"
											class="h-auto w-full object-contain"
										/>
									</span>
								{/if}
								<RichText value={displayValue} />
							</h1>
						{/snippet}
					</EditableField>

					<!-- Description -->
					<div
						class="mt-8 max-w-2xl bg-white/10 p-4 opacity-0 backdrop-blur-sm md:p-6"
						class:animate-fade-up={heroVisible}
						style="animation-delay: 0.7s"
					>
						<EditableField
							fieldKey="HomeHero.description"
							label="Описание"
							value={String(data?.description ?? '')}
							{isEditable}
							multiline
							onSave={(v) => saveField('description', v)}
						>
							{#snippet children(displayValue)}
								<p class="text-sm leading-relaxed font-light text-primary md:text-lg lg:text-xl">
									<RichText value={displayValue} />
								</p>
							{/snippet}
						</EditableField>
					</div>

					<!-- CTA Buttons -->
					<div
						class="mt-8 flex flex-wrap items-center gap-4 opacity-0"
						class:animate-fade-up={heroVisible}
						style="animation-delay: 0.9s"
					>
						<EditableField
							fieldKey="HomeHero.ctaPrimary"
							label="Кнопка «Выездной дизайнер»"
							value={String(data?.ctaPrimary ?? 'Выездной дизайнер')}
							{isEditable}
							onSave={(v) => saveField('ctaPrimary', v)}
						>
							{#snippet children(displayValue)}
								<button
									class="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-inverse uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
									type="button"
									data-metrika-goal="pages_home_hero_open"
									data-goal-action="open"
									onclick={() => {
										if (!isEditable) openPromo2Form('home-designer', '');
									}}
								>
									<RichText value={displayValue} />
									<svg
										class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
										/>
									</svg>
								</button>
							{/snippet}
						</EditableField>

						<EditableField
							fieldKey="HomeHero.ctaSecondary"
							label="Кнопка «Запись в салон»"
							value={String(data?.ctaSecondary ?? 'Запись в салон')}
							{isEditable}
							onSave={(v) => saveField('ctaSecondary', v)}
						>
							{#snippet children(displayValue)}
								<button
									type="button"
									data-metrika-goal="pages_home_hero_showroom_open"
									data-goal-action="open"
									onclick={() => {
										if (!isEditable) openPromo2Form('showroom', '');
									}}
									class="group inline-flex cursor-pointer items-center justify-center gap-3 rounded-sm border border-border-medium bg-white/60 px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase backdrop-blur-sm transition-all duration-500 hover:border-secondary hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
								>
									<RichText value={displayValue} />
								</button>
							{/snippet}
						</EditableField>
					</div>
				</div>
			</div>
		</div>

		<!-- Scroll Indicator -->
		<div
			class="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0"
			class:animate-fade-in={heroVisible}
			style="animation-delay: 1.3s"
		>
			<div class="flex flex-col items-center gap-2">
				<span class="text-[10px] tracking-[0.3em] text-muted uppercase">Листайте</span>
				<div class="h-10 w-px bg-gradient-to-b from-text-muted to-transparent"></div>
			</div>
		</div>
	</section>
{/if}
