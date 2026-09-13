<script lang="ts">
	import { untrack } from 'svelte';
	import ImageEditButton from './ImageEditButton.svelte';
	import { useImageEditing } from '$lib/utils/image-editing.svelte';
	import { editStore } from '$lib/stores/edit.svelte';
	import { type ImagePathPart } from '$lib/utils/component-images';
	import type { HTMLImgAttributes } from 'svelte/elements';

	let {
		src,
		imagePath,
		imageDefaults = {},
		imageRole,
		imageVisibility,
		onImageEdit,
		alt = '',
		class: className = '',
		onerror,
		...imgAttributes
	}: HTMLImgAttributes & {
		src?: string | null;
		imagePath?: ImagePathPart[];
		imageDefaults?: Record<string, unknown>;
		imageRole?: 'preview';
		onImageEdit?: () => void;
		imageVisibility?: {
			visible: boolean;
			pending?: boolean;
			label: string;
			onToggle: (event: MouseEvent) => void | Promise<void>;
		};
	} = $props();

	const editor = useImageEditing();
	const registrationId = Symbol('image');
	let target = $state<HTMLElement>();
	const fieldKey = $derived(imagePath && editor ? editor.key(imagePath) : '');
	const savedSrc = $derived(imagePath && editor ? editor.read(imagePath, src ?? '') : src);
	const active = $derived(
		imagePath && editStore.activeField?.key === fieldKey && editStore.activeField.kind === 'image'
	);
	const displaySrc = $derived(active ? editStore.activeField?.draft : savedSrc);
	const label = $derived(alt || 'Изображение');
	$effect(() => {
		if (!editor?.editable || !imagePath || imageRole === 'preview') return;
		const field = { path: imagePath, value: savedSrc ?? '', label, defaults: imageDefaults };
		return untrack(() => editor.register(registrationId, field));
	});
	let failed = $state(false);
	const hasImage = $derived(Boolean(displaySrc?.trim()) && !failed);

	$effect(() => {
		displaySrc;
		failed = false;
	});
</script>

{#if hasImage}
	<img
		{...imgAttributes}
		bind:this={target}
		data-image-field={fieldKey || undefined}
		src={displaySrc ?? undefined}
		{alt}
		class={className}
		onerror={(event) => {
			failed = true;
			onerror?.(event);
		}}
	/>
{:else}
	<!--
		Заглушка следует теме блока, а не светится собственным цветом.

		Была захардкожена `bg-slate-200` / `rgb(148 163 184/.35)` / `text-slate-400`
		— холодный светлый квадрат в любой дизайн-системе и на любой поверхности.
		Цена этого выше, чем у обычного хардкода: картинка задана примерно в
		десятке из ~226 определений блоков, то есть заглушка — типовое состояние
		шаблона, а на тёмной секции она оказывалась самым ярким пятном страницы.

		`currentColor` вместо своего цвета: заглушка берёт цвет текста родителя,
		поэтому одна разметка годится и Promo-1 с его `p1-*`, и остальным
		шаблонам — общий компонент не вправе знать про роли конкретного шаблона.

		⚠️ Отсюда контракт к вызывающему: **на обёртке должна стоять текстовая
		роль темы** (`p1-body` в Promo-1). Тема принадлежит блоку, а не системе
		и не общему компоненту, — сам он тему не знает и знать не может. Без
		роли цвет достанется от `body`, то есть тёмный на тёмной секции, и
		заглушка растворится в фоне.
	-->
	<div
		bind:this={target}
		data-image-field={fieldKey || undefined}
		class={`ph flex items-center justify-center overflow-hidden ${className}`}
		role="img"
		aria-label={alt || 'Изображение отсутствует'}
	>
		<svg class="ph-icon h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
			<rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.5" />
			<circle cx="8.5" cy="9" r="1.5" fill="currentColor" />
			<path
				d="m4 18 5-5 3.5 3.5 2.5-2.5 5 4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>

	<style>
		/* Не утилитами: `bg-current/10` рядом с `text-current/25` считается уже
		   от приглушённого currentColor и даёт 2,5% вместо 10%. Здесь три доли
		   одного цвета берутся независимо. */
		.ph {
			background-color: color-mix(in oklab, currentColor 8%, transparent);
			background-image: linear-gradient(
				135deg,
				transparent 46%,
				color-mix(in oklab, currentColor 20%, transparent) 47%,
				color-mix(in oklab, currentColor 20%, transparent) 53%,
				transparent 54%
			);
		}
		.ph-icon {
			opacity: 0.45;
		}
	</style>
{/if}

{#if editor?.editable && imagePath && target && imageRole !== 'preview' && !editStore.activeField}
	{#key target}
		<ImageEditButton
			{target}
			{label}
			visibility={imageVisibility}
			onOpen={onImageEdit ??
				(() =>
					editor.open({ path: imagePath!, value: savedSrc ?? '', label, defaults: imageDefaults }))}
		/>
	{/key}
{/if}
