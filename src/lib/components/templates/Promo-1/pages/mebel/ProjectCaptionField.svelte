<script lang="ts">
	import type { ProjectCaption } from './project-caption';
	let {
		enabled = $bindable(false),
		caption = $bindable(),
		preview = '',
		error = '',
		disabled = false
	}: {
		enabled?: boolean;
		caption: ProjectCaption;
		preview?: string;
		error?: string;
		disabled?: boolean;
	} = $props();
	const uid = $props.id();
	let previewWidth = $state(0);
	let naturalWidth = $state(1000);
	let naturalHeight = $state(750);
	const scale = $derived(previewWidth / naturalWidth);
	const padding = $derived(
		Math.min(caption.padding, Math.floor(Math.min(naturalWidth, naturalHeight) / 4)) * scale
	);
</script>

<fieldset {disabled} class="mt-5 min-w-0 space-y-3 border-t border-ink-200 pt-4">
	<label class="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium">
		<input type="checkbox" bind:checked={enabled} /> Подпись на фотографиях
	</label>
	{#if enabled}
		<p class="text-xs text-ink-600">
			Одна подпись для всех новых фото. После сохранения она станет частью изображения.
		</p>
		<label class="block text-sm" for={`${uid}-text`}>Текст подписи</label>
		<input
			id={`${uid}-text`}
			name="image_caption"
			type="text"
			maxlength="120"
			bind:value={caption.text}
			placeholder="Например, название вашей мастерской"
			aria-invalid={!!error}
			aria-describedby={error ? `${uid}-error` : undefined}
			class="field"
		/>
		<label class="block text-sm" for={`${uid}-position`}>Положение внизу</label>
		<select id={`${uid}-position`} bind:value={caption.position} class="field">
			<option value="left">Слева</option><option value="center">По центру</option><option
				value="right">Справа</option
			>
		</select>
		<label class="block text-sm" for={`${uid}-size`}>Размер шрифта: {caption.font_size} px</label>
		<input
			id={`${uid}-size`}
			type="range"
			min="12"
			max="160"
			step="1"
			bind:value={caption.font_size}
			class="w-full"
		/>
		<label class="block text-sm" for={`${uid}-opacity`}>Непрозрачность: {caption.opacity}%</label>
		<input
			id={`${uid}-opacity`}
			type="range"
			min="0"
			max="100"
			step="1"
			bind:value={caption.opacity}
			class="w-full"
		/>
		<p class="text-xs text-ink-600">0% — невидимый текст, 100% — полностью видимый.</p>
		<label class="block text-sm" for={`${uid}-padding`}>Отступ от края: {caption.padding} px</label>
		<input
			id={`${uid}-padding`}
			type="range"
			min="0"
			max="100"
			step="1"
			bind:value={caption.padding}
			class="w-full"
		/>
		<div class="flex flex-wrap items-center gap-4">
			<label class="flex min-h-11 items-center gap-2 text-sm"
				>Цвет <input type="color" bind:value={caption.color} class="h-11 w-12" /></label
			>
			<label class="flex min-h-11 items-center gap-2 text-sm"
				><input type="checkbox" bind:checked={caption.bold} />Полужирный</label
			>
		</div>
		{#if preview}
			<div
				class="relative overflow-hidden rounded-lg border border-ink-200"
				bind:clientWidth={previewWidth}
			>
				<img
					src={preview}
					alt="Пример подписи на первом новом фото"
					class="block h-auto w-full"
					onload={(event) => {
						naturalWidth = (event.currentTarget as HTMLImageElement).naturalWidth;
						naturalHeight = (event.currentTarget as HTMLImageElement).naturalHeight;
					}}
				/>
				<span
					class="pointer-events-none absolute block overflow-hidden whitespace-nowrap"
					style:left={`${padding}px`}
					style:right={`${padding}px`}
					style:bottom={`${padding}px`}
					style:text-align={caption.position}
					style:font-size={`${caption.font_size * scale}px`}
					style:font-weight={caption.bold ? 700 : 400}
					style:color={caption.color}
					style:opacity={caption.opacity / 100}
					style:font-family="DejaVu Sans, sans-serif"
					style:line-height="1">{caption.text.trim()}</span
				>
			</div>
			<p class="text-xs text-ink-600">
				Примерный вид на первом фото. Размер указан для исходного изображения. Длинная подпись
				автоматически уменьшается, чтобы поместиться.
			</p>
		{:else}
			<p class="text-xs text-ink-600">Добавьте фото, чтобы увидеть пример подписи.</p>
		{/if}
		{#if error}<p id={`${uid}-error`} class="text-cat-6-700 text-sm" role="alert">{error}</p>{/if}
	{/if}
</fieldset>

<style>
	.field {
		width: 100%;
		min-height: 44px;
		border: 1px solid var(--color-ink-300);
		border-radius: var(--radius-lg);
		padding: 0.625rem 0.75rem;
		background: var(--color-surface-raised);
		color: var(--color-ink-800);
		font-size: var(--text-sm);
	}
	input {
		accent-color: var(--color-link-600);
	}
	input[type='range'] {
		min-height: 32px;
	}
	input:focus-visible,
	select:focus-visible {
		outline: 2px solid var(--color-link-500);
		outline-offset: 2px;
	}
	.field::placeholder {
		color: var(--color-ink-500);
	}
	.field[aria-invalid='true'] {
		border-color: var(--color-cat-6-600);
	}
</style>
