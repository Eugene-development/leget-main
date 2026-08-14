<script lang="ts">
	import BgImagePicker from '$lib/components/BgImagePicker.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	import {
		collectComponentImages,
		setComponentImage,
		type ComponentImageField
	} from '$lib/utils/component-images';
	import { componentImageSlots } from '$lib/utils/component-image-slots';

	let {
		data = $bindable(),
		editContext,
		componentType,
		slots = [],
		onSaveData
	}: {
		data: Record<string, unknown>;
		editContext: EditContext;
		componentType: string;
		slots?: import('$lib/utils/component-images').ComponentImageSlot[];
		onSaveData: (next: Record<string, unknown>) => void | Promise<void>;
	} = $props();

	const imageSlots = $derived([...componentImageSlots(editContext, componentType, data), ...slots]);
	const images = $derived(collectComponentImages(data, imageSlots));
	let activePathKey = $state<string | null>(null);
	let removingPathKey = $state<string | null>(null);
	let error = $state('');

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
</script>

{#if images.length > 0}
	<section class="border-t border-white/10 pt-5">
		<div class="flex items-center justify-between gap-3">
			<div>
				<h4 class="text-xs text-white/40 uppercase">Изображения</h4>
				<p class="mt-1 text-xs leading-relaxed text-slate-400">
					Добавление, замена и удаление изображений блока.
				</p>
			</div>
			<span class="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-400">
				{images.length}
			</span>
		</div>

		{#if error}
			<p
				class="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200"
				role="alert"
			>
				{error}. Повторите действие.
			</p>
		{/if}

		<div class="mt-4 flex flex-col gap-3">
			{#each images as image (image.pathKey)}
				<div class="rounded-2xl border border-white/10 bg-white/3 p-3">
					<div class="flex min-w-0 items-center gap-3">
						<div class="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-900 text-slate-500">
							<ImageFallback
								src={image.value}
								alt={image.value ? image.label : `${image.label}: изображение не выбрано`}
								class="h-full w-full object-contain"
							/>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-semibold text-slate-200" title={image.label}>
								{image.label}
							</p>
							<p class="mt-1 truncate text-xs text-slate-500" title={image.pathKey}>
								{image.pathKey}
							</p>
						</div>
					</div>

					<div class="mt-3 flex flex-wrap gap-2">
						<button
							type="button"
							class="min-h-10 flex-1 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-200 transition-colors hover:border-sky-400/45 hover:bg-sky-500/20 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:outline-none"
							onclick={() => (activePathKey = image.pathKey)}
						>
							{image.value ? 'Заменить' : 'Добавить'}
						</button>
						<button
							type="button"
							class="min-h-10 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:border-red-500/40 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/3 disabled:text-red-200/35"
							disabled={!image.value || removingPathKey !== null}
							onclick={() => remove(image)}
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
