<script lang="ts">
	// Артикул: 1.2.3.1 — см. docs/architecture/component-articles-map.md
	import { tick } from 'svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from '../../theme';
	import '../../theme.css';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Тема блока: нейтральная палитра — из классов p1-*, акценты не зависят от темы.
	const isLight = $derived(isLightBlock(data, 'light'));
	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Mission', updated);
		data = updated;
	}

	/** Пустые абзацы не видны посетителю, но остаются доступными в редакторе. */
	const paragraphs = $derived([
		{ key: 'text1', label: 'Абзац 1', value: String(data?.text1 ?? '') },
		{ key: 'text2', label: 'Абзац 2', value: String(data?.text2 ?? '') },
		{ key: 'text3', label: 'Абзац 3', value: String(data?.text3 ?? '') }
	]);

	const imageUrl = $derived(String(data?.imageUrl ?? '').trim());
	let layoutEl = $state<HTMLDivElement | null>(null);
	let imageEl = $state<HTMLDivElement | null>(null);
	let imageOffset = $state(0);

	// Привязка к реальному центру text2, а не к центру всей колонки с заголовком.
	// Перемеряем отдельные абзацы: их высоты могут измениться взаимно, сохранив
	// общую высоту колонки (например, во время редактирования).
	$effect(() => {
		paragraphs;
		if (!layoutEl || !imageEl) return;
		const layout = layoutEl;
		const image = imageEl;
		let disposed = false;
		const measure = () => {
			const middle = layout.querySelector<HTMLElement>('.mission-middle');
			const column = layout.querySelector<HTMLElement>('.mission-text');
			const anchor = middle ?? column;
			if (!anchor) return;
			imageOffset =
				anchor.getBoundingClientRect().top -
				layout.getBoundingClientRect().top +
				anchor.offsetHeight / 2 -
				image.offsetHeight / 2;
		};
		const observer = new ResizeObserver(measure);
		tick().then(() => {
			if (disposed) return;
			observer.observe(image);
			layout
				.querySelectorAll('.mission-text, .mission-paragraph')
				.forEach((el) => observer.observe(el));
			measure();
		});
		return () => {
			disposed = true;
			observer.disconnect();
		};
	});
</script>

<section
	class="p1-surface relative isolate overflow-hidden py-section-sm"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ab-rules"></div>
	</div>

	<div use:revealOnScroll class="ab-reveal relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div
			bind:this={layoutEl}
			class={imageUrl || isEditable ? 'lg:grid lg:grid-cols-2 lg:items-start lg:gap-16' : ''}
		>
			<div class="mission-text {imageUrl || isEditable ? '' : 'mx-auto max-w-4xl'}">
				<EditableField
					fieldKey="Mission.title"
					label="Заголовок"
					value={String(data?.title ?? 'Наша миссия')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="ab-item block"
				>
					{#snippet children(displayValue)}
						<h2 class="p1-title text-3xl text-pretty sm:text-4xl lg:text-5xl">
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<!--
					Абзацы идут одним списком: раньше каждый был отдельным блоком со своим
					mt-*, и при пустом первом абзаце отступы съезжали. Теперь отступ задаёт
					сам список: пустое поле скрыто от посетителя, но в редакторе показывает подсказку.
				-->
				<div class="mt-8 grid gap-4 sm:gap-5">
					{#each paragraphs as paragraph (paragraph.key)}
						{#if paragraph.value.trim() || isEditable}
							<EditableField
								fieldKey="Mission.{paragraph.key}"
								label={paragraph.label}
								value={paragraph.value}
								{isEditable}
								multiline
								onSave={(v) => saveField(paragraph.key, v)}
								class="mission-paragraph {paragraph.key === 'text2'
									? 'mission-middle'
									: ''} block rounded-md border-l border-ink-800 px-5 py-6 sm:px-8"
							>
								{#snippet children(displayValue)}
									{#if displayValue.trim()}
										<p class="p1-body text-prose">{displayValue}</p>
									{:else if isEditable}
										<p
											class="p1-muted max-w-xl rounded-xl border border-dashed border-ink-400/50 px-4 py-3 text-sm/6"
										>
											Добавьте {paragraph.label.toLowerCase()}
										</p>
									{/if}
								{/snippet}
							</EditableField>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Изображение без дополнительной подложки. -->
			{#if imageUrl || isEditable}
				<div
					bind:this={imageEl}
					class="mission-image ab-card ab-d2 mt-12"
					style:--mission-image-offset={`${imageOffset}px`}
				>
					<EditableField
						fieldKey="Mission.imageUrl"
						kind="image"
						label="URL изображения"
						value={String(data?.imageUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('imageUrl', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<ImageFallback
									loading="lazy"
									src={displayValue}
									alt=""
									class="aspect-4/3 w-full rounded-4xl object-cover"
								/>
							{:else}
								<div class="flex aspect-4/3 w-full items-center justify-center rounded-4xl">
									<p class="p1-muted text-sm">Добавьте URL изображения</p>
								</div>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	.mission-image {
		width: 90%;
		margin-inline: auto;
	}
	@media (min-width: 1024px) {
		.mission-image {
			margin-top: var(--mission-image-offset, 0px);
		}
	}
	section :global(.mission-paragraph) {
		/* Сохраняем системную светлоту ink-800, убираем цветность линии. */
		border-left-color: oklch(from var(--ds-ink-800) l 0 0);
		background: linear-gradient(var(--p1-veil), var(--p1-veil)), var(--p1-surface-alt);
	}
</style>
