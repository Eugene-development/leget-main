<script lang="ts">
	// Артикул: 2.1.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { onMount } from 'svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'HomeHero', updated);
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

<section class="relative min-h-[90vh] overflow-hidden bg-surface" id="hero">
	<!-- Background: static image on mobile, crossfade videos on desktop -->
	<div class="absolute inset-0">
		<!-- Mobile: static image -->
		<ImageFallback
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
		<div class="mx-auto w-full max-w-screen-xl px-6 xl:px-1">
			<div class="max-w-2xl">
				<!-- Label -->
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
							value={String(data?.label ?? '')}
							{isEditable}
							onSave={(v) => saveField('label', v)}
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
					</span>
				</div>

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
							{displayValue}
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
								{displayValue}
							</p>
						{/snippet}
					</EditableField>
				</div>

				<!-- CTA Buttons -->
				<div
					class="mt-10 flex flex-wrap items-center gap-4 opacity-0"
					class:animate-fade-up={heroVisible}
					style="animation-delay: 0.9s"
				>
					<EditableField
						fieldKey="HomeHero.ctaPrimary"
						label="Кнопка 1"
						value={String(data?.ctaPrimary ?? '')}
						{isEditable}
						onSave={(v) => saveField('ctaPrimary', v)}
					>
						{#snippet children(displayValue)}
							<a
								href={String(data?.ctaPrimaryLink ?? '#')}
								class="group inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-8 py-4 text-xs tracking-[0.15em] text-inverse uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
							>
								{displayValue}
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
							</a>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="HomeHero.ctaSecondary"
						label="Кнопка 2"
						value={String(data?.ctaSecondary ?? '')}
						{isEditable}
						onSave={(v) => saveField('ctaSecondary', v)}
					>
						{#snippet children(displayValue)}
							<a
								href={String(data?.ctaSecondaryLink ?? '#')}
								class="group inline-flex items-center gap-3 rounded-sm border border-border-medium bg-white/60 px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase backdrop-blur-sm transition-all duration-500 hover:border-secondary hover:text-secondary"
							>
								{displayValue}
							</a>
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
