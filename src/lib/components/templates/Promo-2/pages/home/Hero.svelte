<script lang="ts">
	import { notifyError } from '$lib/utils/notify-error';
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	import { openPromo2Form } from '$lib/components/templates/Promo-2/forms/request';
	// Артикул: 2.1.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import VersionSwitcher from '$lib/components/VersionSwitcher.svelte';
	import { editStore } from '$lib/stores/edit.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { uploadSiteFile } from '$lib/utils/site-file-upload';
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
	const desktopTitle = $derived(editableText(data?.title));
	const mobileTitle = $derived(editableText(data?.mobileTitle));
	const hasMobileTitle = $derived(richTextToPlainText(mobileTitle).trim().length > 0);
	const phoneTitle = $derived(hasMobileTitle ? mobileTitle : desktopTitle);
	const desktopTitleKey = 'HomeHero.title';
	const mobileTitleKey = 'HomeHero.mobileTitle';
	const desktopTitleLabel = 'Заголовок для компьютера';
	const mobileTitleLabel = 'Заголовок для телефона';

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
	let videoEls = $state<HTMLVideoElement[]>([]);
	let isDesktop = $state(false);
	let titleElement = $state<HTMLHeadingElement | null>(null);
	const activeTitleKey = $derived(editStore.activeField?.key);
	const editingMobileTitle = $derived(
		isEditable &&
			(activeTitleKey === mobileTitleKey || (!isDesktop && activeTitleKey !== desktopTitleKey))
	);

	function saveDesktopTitle(value: string) {
		return saveField('title', value);
	}

	function saveMobileTitle(value: string) {
		return saveField('mobileTitle', value);
	}

	function openTitleEditor(field: 'title' | 'mobileTitle') {
		const forPhone = field === 'mobileTitle';
		editStore.open({
			key: forPhone ? mobileTitleKey : desktopTitleKey,
			kind: 'text',
			label: forPhone ? mobileTitleLabel : desktopTitleLabel,
			value: forPhone ? phoneTitle : desktopTitle,
			multiline: false,
			richText: true,
			defaultFontSize: titleElement ? getComputedStyle(titleElement).fontSize : undefined,
			onSave: forPhone ? saveMobileTitle : saveDesktopTitle
		});
	}

	const videoSlots = [
		{
			field: 'firstBackgroundVideo',
			fallback: 'https://storage.yandexcloud.net/zovtop/video/videomainkjfhwirj.mp4'
		},
		{
			field: 'secondBackgroundVideo',
			fallback: 'https://storage.yandexcloud.net/zovtop/video/videomain-2kknh.mp4'
		}
	];

	const heroVideos = $derived(
		videoSlots.map(({ field, fallback }) => {
			const value = data?.[field];
			return typeof value === 'string' && value.trim() ? value.trim() : fallback;
		})
	);
	const videoSourceKey = $derived(JSON.stringify(heroVideos));
	let activeVideo = $derived.by(() => {
		videoSourceKey;
		return 0;
	});
	let busyVideo = $state<string | null>(null);
	let videoStatus = $state('');
	let videoError = $state('');
	let pendingVideo = $state<{ field: string; url: string } | null>(null);

	async function replaceVideo(field: string, input?: HTMLInputElement) {
		if (!editContext || busyVideo) return;
		const file = input?.files?.[0];
		if (input) {
			input.value = '';
			if (!file) return;
		}
		videoError = '';
		videoStatus = '';
		if (file && (!/\.mp4$/i.test(file.name) || file.size === 0)) {
			videoError = 'Выберите непустой файл MP4.';
			return;
		}

		busyVideo = field;
		try {
			if (file) {
				pendingVideo = null;
				videoStatus = 'Загрузка видео…';
				const mp4 = new File([file], file.name, { type: 'video/mp4' });
				const url = await uploadSiteFile(mp4, editContext.licenseId, 'video', (progress) => {
					videoStatus = `Загрузка видео… ${progress}%`;
				});
				pendingVideo = { field, url };
			}
			if (pendingVideo?.field !== field) return;
			videoStatus = 'Сохранение видео…';
			await saveField(field, pendingVideo.url);
			pendingVideo = null;
			videoStatus = 'Видео заменено.';
		} catch (error) {
			videoStatus = '';
			videoError =
				pendingVideo?.field === field
					? notifyError(error, 'Видео загружено. Повторите сохранение, чтобы применить его.')
					: notifyError(error, 'Не удалось загрузить видео. Повторите попытку.');
		} finally {
			busyVideo = null;
		}
	}

	function onVideoTimeUpdate(i: number) {
		const el = videoEls[i];
		if (!el || i !== activeVideo) return;
		if (el.duration && el.currentTime >= el.duration - 0.5) {
			const next = (i + 1) % heroVideos.length;
			const nextEl = videoEls[next];
			if (!nextEl || nextEl.error) return;
			el.pause();
			nextEl.currentTime = 0;
			activeVideo = next;
			void nextEl.play().catch(() => {
				if (videoEls[next] === nextEl) activeVideo = i;
			});
		}
	}

	onMount(() => {
		heroVisible = true;
		const desktop = window.matchMedia('(min-width: 768px)');
		const syncDesktop = () => {
			activeVideo = 0;
			isDesktop = desktop.matches;
		};
		syncDesktop();
		desktop.addEventListener('change', syncDesktop);
		return () => desktop.removeEventListener('change', syncDesktop);
	});
</script>

{#snippet heroSettings()}
	<section class="flex flex-col gap-4 text-on-dark">
		<h4 class="text-sm">Логотип перед заголовком</h4>
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
	<section class="flex flex-col gap-3 text-on-dark" aria-label="Фон первого экрана">
		<h4 class="text-sm">Фон первого экрана</h4>
		<p class="text-sm leading-relaxed text-ink-300">
			На десктопе два видео MP4 играют по очереди. Фон для телефона можно загрузить в разделе
			«Изображения» ниже.
		</p>
		{#each videoSlots as { field }, index (field)}
			<label class="flex flex-col gap-2 text-sm">
				{index === 0 ? 'Первое видео' : 'Второе видео'}
				<input
					type="file"
					accept=".mp4,video/mp4"
					disabled={busyVideo !== null}
					onchange={(event) => replaceVideo(field, event.currentTarget)}
					data-goal-ignore="Загрузка фонового видео владельцем сайта"
					class="w-full min-w-0 cursor-pointer rounded-xl border border-on-dark/20 p-2 text-sm file:mr-2 file:min-h-9 file:cursor-pointer file:rounded-lg file:border-0 file:bg-on-dark/10 file:px-2 file:text-on-dark focus-visible:outline-2 focus-visible:outline-link-400 disabled:cursor-wait disabled:opacity-50"
				/>
			</label>
		{/each}
		{#if videoStatus}<p role="status" class="text-sm text-ink-300">{videoStatus}</p>{/if}
		{#if videoError}<p role="alert" class="text-sm">{videoError}</p>{/if}
		{#if pendingVideo && !busyVideo}
			<button
				type="button"
				onclick={() => pendingVideo && replaceVideo(pendingVideo.field)}
				data-goal-ignore="Повтор сохранения фонового видео владельцем сайта"
				class="min-h-11 cursor-pointer rounded-xl bg-link-600 px-4 py-2 text-sm text-on-dark hover:bg-link-500 focus-visible:outline-2 focus-visible:outline-link-400"
			>
				Повторить сохранение
			</button>
		{/if}
	</section>
{/snippet}

{#snippet mobileTitleSettingsAction()}
	<button
		type="button"
		onclick={() => openTitleEditor('mobileTitle')}
		data-goal-ignore="Редактирование мобильного заголовка владельцем сайта"
		class="hidden min-h-11 cursor-pointer items-center rounded-xl border border-on-dark/20 px-3 text-sm text-on-dark hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-link-400 md:inline-flex"
	>
		{mobileTitleLabel}
	</button>
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
			settings={heroSettings}
			controlActions={mobileTitleSettingsAction}
		/>
		<!-- Background: static image on mobile, crossfade videos on desktop -->
		<div class="absolute inset-0">
			<!-- Mobile: static image -->
			<ImageFallback
				imagePath={['mobileImage']}
				src={String(data?.mobileImage ?? '')}
				alt="Изображение для телефона"
				class="h-full w-full object-cover md:hidden"
			/>
			<!-- Desktop: crossfade videos -->
			{#if isDesktop}
				{#key videoSourceKey}
					{#each heroVideos as src, i (i)}
						<video
							{src}
							autoplay={i === 0}
							preload="metadata"
							muted
							playsinline
							bind:this={videoEls[i]}
							ontimeupdate={() => onVideoTimeUpdate(i)}
							class={[
								'absolute inset-0 hidden h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out md:block',
								activeVideo === i ? 'opacity-100' : 'opacity-0'
							]}
						></video>
					{/each}
				{/key}
			{/if}
			<div class="absolute inset-0 bg-linear-to-r from-white/85 via-white/50 to-transparent"></div>
			<div class="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent"></div>
		</div>

		<!-- Content -->
		<div
			class="relative z-10 flex min-h-[85vh] items-start pt-[clamp(1.25rem,calc(12svh-3rem),3.5rem)] pb-6 md:items-center md:py-0"
		>
			<div class="p2-container mx-auto w-full">
				<div class="max-w-2xl">
					<!-- Label -->
					{#if isEditable || hasLabel}
						<div
							class="mb-2 opacity-0 md:mb-6"
							class:animate-fade-up={heroVisible}
							style="animation-delay: 0.3s"
						>
							<div
								class="inline-flex items-center justify-center gap-2 border border-secondary/30 bg-white/60 px-3 py-1.5 text-[11px] leading-normal tracking-[0.14em] text-secondary uppercase backdrop-blur-sm md:px-4 md:py-2 md:tracking-[0.25em]"
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
							</div>
						</div>
					{/if}

					<!-- Heading -->
					<EditableField
						fieldKey={editingMobileTitle ? mobileTitleKey : desktopTitleKey}
						label="Заголовок"
						value={editingMobileTitle ? phoneTitle : desktopTitle}
						{isEditable}
						onSave={editingMobileTitle ? saveMobileTitle : saveDesktopTitle}
						visibilityKey="title"
						visibilityLabel="заголовок"
						class="block"
					>
						{#snippet editActions()}
							<div class="grid min-w-0 gap-1">
								<button
									type="button"
									onclick={() => openTitleEditor('mobileTitle')}
									data-goal-ignore="Редактирование мобильного заголовка владельцем сайта"
									class="cursor-pointer rounded-lg px-2 py-3.5 text-left text-sm leading-snug hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-link-400"
								>
									{mobileTitleLabel}
								</button>
								<button
									type="button"
									onclick={() => openTitleEditor('title')}
									data-goal-ignore="Редактирование заголовка для компьютера владельцем сайта"
									class="cursor-pointer rounded-lg px-2 py-3.5 text-left text-sm leading-snug hover:bg-on-dark/10 focus-visible:outline-2 focus-visible:outline-link-400"
								>
									{desktopTitleLabel}
								</button>
							</div>
						{/snippet}
						{#snippet children(displayValue)}
							<h1
								bind:this={titleElement}
								class="text-page-title text-primary opacity-0 max-md:[@media(max-height:700px)]:text-[length:calc(var(--ds-font-page-title-size)*0.74)]"
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
								{#if !isEditable && hasMobileTitle}
									<span class="md:hidden"><RichText value={mobileTitle} /></span>
									<span class="hidden md:inline"><RichText value={displayValue} /></span>
								{:else}
									<RichText value={displayValue} />
								{/if}
							</h1>
						{/snippet}
					</EditableField>

					<!-- Description -->
					<div
						class="mt-3 max-w-2xl bg-white/10 py-2 opacity-0 backdrop-blur-sm md:mt-8 md:p-4"
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
								<p
									class="text-prose font-light text-primary max-md:[@media(max-height:700px)]:text-base max-md:[@media(max-height:700px)]:leading-snug"
								>
									<RichText value={displayValue} />
								</p>
							{/snippet}
						</EditableField>
					</div>

					<!-- CTA Buttons -->
					<div
						class="mt-3 flex flex-wrap items-center gap-2 opacity-0 md:mt-8 md:gap-4"
						class:animate-fade-up={heroVisible}
						style="animation-delay: 0.9s"
					>
						<EditableField
							fieldKey="HomeHero.ctaPrimary"
							label="Кнопка «Выездной дизайнер»"
							value={editableText(data?.ctaPrimary, 'Выездной дизайнер')}
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
							value={editableText(data?.ctaSecondary, 'Запись в салон')}
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
			class="absolute bottom-10 left-1/2 hidden -translate-x-1/2 opacity-0 md:block"
			class:animate-fade-in={heroVisible}
			style="animation-delay: 1.3s"
		>
			<div class="flex flex-col items-center gap-2">
				<span class="text-[10px] tracking-[0.3em] text-muted uppercase"
					><ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="Hero"
						path={['copy', 'scrollHint']}
						fallback={'Листайте'}
						label="Листайте"
					/></span
				>
				<div class="h-10 w-px bg-gradient-to-b from-text-muted to-transparent"></div>
			</div>
		</div>
	</section>
{/if}
