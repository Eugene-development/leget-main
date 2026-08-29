<script lang="ts">
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	const DEFAULT_BACKGROUNDS = [
		'https://storage.yandexcloud.net/novostroy/bg/hero-2.jpg',
		'https://storage.yandexcloud.net/novostroy/bg/hero-1.jpg'
	];
	const MIN_INTERVAL_SECONDS = 1;
	const MAX_INTERVAL_SECONDS = 300;
	const MAX_BACKGROUNDS = 12;

	let {
		data = $bindable(),
		editContext
	}: {
		data: Record<string, unknown>;
		editContext: EditContext;
	} = $props();

	const backgrounds = $derived.by(() => {
		if (Array.isArray(data.bgImagesV1)) {
			const stored = data.bgImagesV1.filter(
				(value): value is string => typeof value === 'string' && value.trim() !== ''
			);
			if (stored.length > 0) return stored;
		}

		const legacy = [data.bgImageV1, data.bgImage].find(
			(value): value is string => typeof value === 'string' && value.trim() !== ''
		);
		return legacy ? [legacy] : DEFAULT_BACKGROUNDS;
	});
	const intervalSeconds = $derived(
		Math.min(MAX_INTERVAL_SECONDS, Math.max(MIN_INTERVAL_SECONDS, Number(data.bgIntervalV1) || 5))
	);

	let activeImageIndex = $state<number | null>(null);
	let isAdding = $state(false);
	let isSaving = $state(false);
	let error = $state('');
	let intervalDraft = $state(5);
	let intervalFocused = $state(false);

	$effect(() => {
		if (!intervalFocused) intervalDraft = intervalSeconds;
	});

	const pickerImage = $derived(
		isAdding || activeImageIndex === null ? '' : (backgrounds[activeImageIndex] ?? '')
	);

	async function persist(next: Record<string, unknown>) {
		if (isSaving) return;
		const previous = data;
		data = next;
		isSaving = true;
		error = '';
		try {
			await saveComponentData(editContext, 'HeroMain', next);
		} catch (cause) {
			data = previous;
			error = cause instanceof Error ? cause.message : 'Не удалось сохранить настройки фона';
			throw cause;
		} finally {
			isSaving = false;
		}
	}

	function openReplace(index: number) {
		isAdding = false;
		activeImageIndex = index;
	}

	function openAdd() {
		if (backgrounds.length >= MAX_BACKGROUNDS) return;
		isAdding = true;
		activeImageIndex = null;
	}

	function closePicker() {
		isAdding = false;
		activeImageIndex = null;
	}

	async function approveImage(url: string) {
		const nextBackgrounds = isAdding
			? [...backgrounds, url]
			: backgrounds.map((background, index) => (index === activeImageIndex ? url : background));
		await persist({ ...data, bgImagesV1: nextBackgrounds });
		closePicker();
	}

	async function removeImage(index: number) {
		if (backgrounds.length <= 1) return;
		try {
			await persist({
				...data,
				bgImagesV1: backgrounds.filter((_, backgroundIndex) => backgroundIndex !== index)
			});
		} catch {
			// Сообщение уже показано в секции; оставляем текущий список на месте.
		}
	}

	async function saveInterval() {
		intervalFocused = false;
		const normalized = Math.min(
			MAX_INTERVAL_SECONDS,
			Math.max(MIN_INTERVAL_SECONDS, Math.round(Number(intervalDraft) || 5))
		);
		intervalDraft = normalized;
		if (normalized === intervalSeconds && data.bgIntervalV1 !== undefined) return;
		try {
			await persist({ ...data, bgIntervalV1: normalized });
		} catch {
			// Ошибка и откат обрабатываются в persist().
		}
	}
</script>

<section class="border-t border-on-dark/10 pt-5">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h4 class="text-xs text-on-dark/40 uppercase">Фоновое слайд-шоу</h4>
			<p class="mt-1 text-xs leading-relaxed text-ink-400">
				Изображения идут по порядку и сменяют друг друга плавным переходом.
			</p>
		</div>
		<span class="shrink-0 rounded-full bg-on-dark/5 px-2.5 py-1 text-xs text-ink-400">
			{backgrounds.length}/{MAX_BACKGROUNDS}
		</span>
	</div>

	{#if error}
		<p
			class="mt-3 rounded-xl border border-cat-6-500/20 bg-cat-6-500/10 px-3 py-2 text-xs text-cat-6-300"
			role="alert"
		>
			{error}. Повторите действие.
		</p>
	{/if}

	<label class="mt-4 block text-xs font-semibold text-ink-200" for="hero-bg-interval">
		Интервал смены
	</label>
	<div class="mt-2 flex items-center gap-3">
		<input
			id="hero-bg-interval"
			type="number"
			min={MIN_INTERVAL_SECONDS}
			max={MAX_INTERVAL_SECONDS}
			step="1"
			bind:value={intervalDraft}
			disabled={isSaving}
			onfocus={() => (intervalFocused = true)}
			onblur={saveInterval}
			onchange={saveInterval}
			class="min-h-11 w-24 rounded-xl border border-on-dark/10 bg-on-dark/5 px-3 py-2 text-sm font-semibold text-on-dark transition-colors outline-none focus:border-link-400 focus:ring-2 focus:ring-link-500/30 disabled:cursor-wait disabled:opacity-60"
		/>
		<span class="text-xs text-ink-400">секунд</span>
	</div>

	<div class="mt-4 flex flex-col gap-3">
		{#each backgrounds as background, index (index)}
			<div class="rounded-2xl border border-on-dark/10 bg-on-dark/3 p-3">
				<div class="flex min-w-0 items-center gap-3">
					<div class="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-900 text-ink-500">
						<ImageFallback
							src={background}
							alt={`Фоновое изображение ${index + 1}`}
							class="h-full w-full object-cover"
						/>
					</div>
					<p class="min-w-0 flex-1 truncate text-xs font-semibold text-ink-200">
						Фон {index + 1}
					</p>
				</div>

				<div class="mt-3 flex gap-2">
					<button
						type="button"
						disabled={isSaving}
						onclick={() => openReplace(index)}
						class="min-h-10 flex-1 rounded-xl border border-link-500/25 bg-link-500/10 px-3 py-2 text-xs font-semibold text-link-200 transition-colors hover:border-link-400/45 hover:bg-link-500/20 focus-visible:ring-2 focus-visible:ring-link-400 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
					>
						Заменить
					</button>
					<button
						type="button"
						disabled={isSaving || backgrounds.length <= 1}
						onclick={() => removeImage(index)}
						aria-label={`Удалить фон ${index + 1}`}
						class="min-h-10 rounded-xl border border-cat-6-500/20 bg-cat-6-500/5 px-3 py-2 text-xs font-semibold text-cat-6-300 transition-colors hover:border-cat-6-500/40 hover:bg-cat-6-500/15 focus-visible:ring-2 focus-visible:ring-cat-6-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35"
					>
						Удалить
					</button>
				</div>
			</div>
		{/each}
	</div>

	<button
		type="button"
		disabled={isSaving || backgrounds.length >= MAX_BACKGROUNDS}
		onclick={openAdd}
		class="mt-3 flex min-h-11 w-full items-center justify-center rounded-2xl border border-dashed border-link-500/30 bg-link-500/5 px-4 py-3 text-xs font-semibold text-link-200 transition-colors hover:border-link-400/55 hover:bg-link-500/15 focus-visible:ring-2 focus-visible:ring-link-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-on-dark/10 disabled:bg-on-dark/3 disabled:text-ink-500"
	>
		{backgrounds.length >= MAX_BACKGROUNDS ? 'Достигнут лимит фонов' : 'Добавить фон'}
	</button>
</section>

{#if isAdding || activeImageIndex !== null}
	<BgImagePicker
		{editContext}
		currentImage={pickerImage}
		defaultImage={pickerImage}
		folder="components/heromain"
		title={isAdding ? 'Добавить фон' : `Заменить фон ${Number(activeImageIndex) + 1}`}
		cropUploads
		aspectRatio={16 / 9}
		previewFit="cover"
		maxUploadBytes={20 * 1024 * 1024}
		cropMaxWidth={2560}
		cropMaxHeight={1440}
		cropOutputMimeType="image/webp"
		cropOutputQuality={0.86}
		cropMaxOutputBytes={4 * 1024 * 1024}
		onApprove={approveImage}
		onClose={closePicker}
	/>
{/if}
