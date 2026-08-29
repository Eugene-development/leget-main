<script lang="ts">
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	import {
		collectComponentImages,
		setComponentImage,
		type ComponentImageField
	} from '$lib/utils/component-images';
	import { componentImageSlots, hiddenWhenEmptyImageKeys } from '$lib/utils/component-image-slots';
	import { fade, fly } from 'svelte/transition';

	let {
		data = $bindable(),
		editContext,
		componentType,
		slots = [],
		excludePathPrefixes = [],
		onSaveData
	}: {
		data: Record<string, unknown>;
		editContext: EditContext;
		componentType: string;
		slots?: import('$lib/utils/component-images').ComponentImageSlot[];
		/** Пути, которыми владеет специализированная секция настроек блока. */
		excludePathPrefixes?: string[];
		onSaveData: (next: Record<string, unknown>) => void | Promise<void>;
	} = $props();

	const imageSlots = $derived([...componentImageSlots(editContext, componentType, data), ...slots]);
	// Мёртвые легаси-ключи (напр. `bgImage` у HeroMain — вытеснен `bgImageV1`,
	// но обход находит его прямо в data, минуя реестр слотов) не должны
	// плодить пустую карточку рядом с актуальным полем. Непустые остаются:
	// у тенантов, ещё не мигрировавших, это единственный способ его сменить.
	const hiddenWhenEmpty = $derived(new Set(hiddenWhenEmptyImageKeys(editContext, componentType)));
	const isExcluded = (pathKey: string) =>
		excludePathPrefixes.some(
			(prefix) =>
				pathKey === prefix || pathKey.startsWith(`${prefix}.`) || pathKey.startsWith(`${prefix}[`)
		);
	const images = $derived(
		collectComponentImages(data, imageSlots).filter(
			(image) =>
				!isExcluded(image.pathKey) && (image.value !== '' || !hiddenWhenEmpty.has(image.pathKey))
		)
	);
	let activePathKey = $state<string | null>(null);
	let removingPathKey = $state<string | null>(null);
	let error = $state('');
	/** Изображение, ожидающее подтверждения удаления — до клика по кнопке
	    в модалке `remove()` не вызывается. */
	let confirmRemoveImage = $state<ComponentImageField | null>(null);

	const activeImage = $derived(
		activePathKey ? (images.find((image) => image.pathKey === activePathKey) ?? null) : null
	);
	const folder = $derived(`components/${componentType.toLocaleLowerCase('ru-RU')}`);

	async function persist(image: ComponentImageField, value: string) {
		error = '';
		const previous = data;
		const next = setComponentImage(previous, image.path, value);
		data = next;
		try {
			await onSaveData(next);
		} catch (cause) {
			data = previous;
			error = cause instanceof Error ? cause.message : 'Не удалось сохранить изображение';
			throw cause;
		}
	}

	async function approve(url: string) {
		if (!activeImage) return;
		await persist(activeImage, url);
		activePathKey = null;
	}

	async function remove(image: ComponentImageField) {
		if (!image.value || removingPathKey) return;
		removingPathKey = image.pathKey;
		try {
			await persist(image, '');
			activePathKey = null;
		} finally {
			removingPathKey = null;
		}
	}

	/** Кнопка списка не удаляет сразу — только открывает подтверждение. */
	function requestRemove(image: ComponentImageField) {
		if (!image.value || removingPathKey) return;
		confirmRemoveImage = image;
	}

	async function confirmRemove() {
		if (!confirmRemoveImage) return;
		const image = confirmRemoveImage;
		confirmRemoveImage = null;
		await remove(image);
	}
</script>

{#if images.length > 0}
	<section class="border-t border-on-dark/10 pt-5">
		<div class="flex items-center justify-between gap-3">
			<div>
				<h4 class="text-xs text-on-dark/40 uppercase">Изображения</h4>
				<p class="mt-1 text-xs leading-relaxed text-ink-400">
					Добавление, замена и удаление изображений блока.
				</p>
			</div>
			<span class="rounded-full bg-on-dark/5 px-2.5 py-1 text-xs text-ink-400">
				{images.length}
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

		<div class="mt-4 flex flex-col gap-3">
			{#each images as image (image.pathKey)}
				<div class="rounded-2xl border border-on-dark/10 bg-on-dark/3 p-3">
					<div class="flex min-w-0 items-center gap-3">
						<div class="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-ink-900 text-ink-500">
							<ImageFallback
								src={image.value}
								alt={image.value ? image.label : `${image.label}: изображение не выбрано`}
								class="h-full w-full object-contain"
							/>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-semibold text-ink-200" title={image.label}>
								{image.label}
							</p>
						</div>
					</div>

					<div class="mt-3 flex flex-wrap gap-2">
						<button
							type="button"
							class="min-h-10 flex-1 rounded-xl border border-link-500/25 bg-link-500/10 px-3 py-2 text-xs font-semibold text-link-200 transition-colors hover:border-link-400/45 hover:bg-link-500/20 focus-visible:ring-2 focus-visible:ring-link-400 focus-visible:outline-none"
							onclick={() => (activePathKey = image.pathKey)}
						>
							{image.value ? 'Заменить' : 'Добавить'}
						</button>
						<button
							type="button"
							class="min-h-10 rounded-xl border border-cat-6-500/20 bg-cat-6-500/5 px-3 py-2 text-xs font-semibold text-cat-6-300 transition-colors hover:border-cat-6-500/40 hover:bg-cat-6-500/15 disabled:cursor-not-allowed disabled:border-on-dark/10 disabled:bg-on-dark/3 disabled:text-cat-6-300/35"
							disabled={!image.value || removingPathKey !== null}
							onclick={() => requestRemove(image)}
							aria-label={`Удалить: ${image.label}`}
						>
							{removingPathKey === image.pathKey ? 'Удаление…' : 'Удалить'}
						</button>
					</div>
				</div>
			{/each}
		</div>
	</section>
{/if}

{#if activeImage}
	<BgImagePicker
		{editContext}
		currentImage={activeImage.value}
		defaultImage={activeImage.value}
		{folder}
		title={activeImage.label}
		cropUploads
		aspectRatio={NaN}
		previewFit="contain"
		maxUploadBytes={20 * 1024 * 1024}
		cropMaxWidth={2560}
		cropMaxHeight={2560}
		cropOutputMimeType="image/webp"
		cropOutputQuality={0.86}
		cropMaxOutputBytes={4 * 1024 * 1024}
		onApprove={approve}
		onRemove={() => remove(activeImage)}
		onClose={() => (activePathKey = null)}
	/>
{/if}

{#if confirmRemoveImage}
	<div
		class="fixed inset-0 z-[1000] flex items-center justify-center bg-scrim/60 p-4 backdrop-blur-md"
		transition:fade={{ duration: 200 }}
	>
		<!-- Backdrop click to close -->
		<button
			type="button"
			class="absolute inset-0 h-full w-full cursor-default border-none bg-transparent outline-none"
			onclick={() => (confirmRemoveImage = null)}
			aria-label="Закрыть"
		></button>

		<!-- Modal Card -->
		<div
			class="font-sans-premium relative z-10 flex w-full max-w-md flex-col items-center gap-5 rounded-3xl border border-on-dark/10 bg-ink-900/95 p-6 text-center shadow-2xl backdrop-blur-2xl"
			transition:fly={{ y: 20, duration: 300 }}
		>
			<div
				class="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl border border-cat-6-500/25 bg-cat-6-500/10 text-cat-6-400 shadow-[0_0_20px] shadow-cat-6-500/15"
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

			<div class="flex flex-col gap-2">
				<h3 class="text-lg text-on-dark uppercase">Удалить изображение?</h3>
				<p class="text-xs leading-relaxed font-medium text-ink-400">
					Вы уверены, что хотите удалить
					<span class="font-bold text-ink-200">"{confirmRemoveImage.label}"</span>
					? Действие нельзя отменить.
				</p>
			</div>

			<div class="mt-2 flex w-full items-center gap-3">
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl border border-on-dark/10 bg-on-dark/5 px-4 py-3 text-xs font-bold tracking-wider text-on-dark uppercase transition-all duration-300 hover:bg-on-dark/10 active:scale-98"
					onclick={() => (confirmRemoveImage = null)}
				>
					Отмена
				</button>
				<button
					type="button"
					class="flex-1 cursor-pointer rounded-xl bg-cat-6-600 px-4 py-3 text-xs font-bold tracking-wider text-on-dark uppercase transition-all duration-300 hover:bg-cat-6-500 hover:shadow-lg hover:shadow-cat-6-600/25 active:scale-98"
					onclick={confirmRemove}
				>
					Да, удалить
				</button>
			</div>
		</div>
	</div>
{/if}
