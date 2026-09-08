<script lang="ts">
	// Артикул: 1.2.3.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../theme.css';

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
</script>

<section
	class="p1-surface relative isolate overflow-hidden py-section-sm"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ab-rules"></div>
	</div>

	<div use:revealOnScroll class="ab-reveal relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
			<div>
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

				<div class="ab-rule ab-d1 mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
					<span class="p1-line flex-1 border-t"></span>
					<span class="size-1.5 rotate-45 border border-brand-500/70"></span>
					<span class="p1-line flex-1 border-t"></span>
				</div>

				<!--
					Абзацы идут одним списком: раньше каждый был отдельным блоком со своим
					mt-*, и при пустом первом абзаце отступы съезжали. Теперь отступ задаёт
					сам список: пустое поле скрыто от посетителя, но в редакторе показывает подсказку.
				-->
				<div class="ab-item ab-d2 mt-6 space-y-4">
					{#each paragraphs as paragraph (paragraph.key)}
						<EditableField
							fieldKey="Mission.{paragraph.key}"
							label={paragraph.label}
							value={paragraph.value}
							{isEditable}
							multiline
							onSave={(v) => saveField(paragraph.key, v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue.trim()}
									<p class="p1-body max-w-xl text-sm/6 sm:text-base/7">{displayValue}</p>
								{:else if isEditable}
									<p
										class="p1-muted max-w-xl rounded-xl border border-dashed border-ink-400/50 px-4 py-3 text-sm/6"
									>
										Добавьте {paragraph.label.toLowerCase()}
									</p>
								{/if}
							{/snippet}
						</EditableField>
					{/each}
				</div>
			</div>

			<!-- Изображение в паспарту с градиентной каймой -->
			{#if imageUrl || isEditable}
				<div class="ab-card ab-d2 mt-12 lg:mt-0">
					<div
						class="rounded-4xl bg-linear-to-br from-brand-500/25 via-ink-900/10 to-brand-500/25 p-px shadow-[0_40px_100px_-60px] shadow-ink-900/55"
					>
						<EditableField
							fieldKey="Mission.imageUrl"
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
										class="aspect-4/3 w-full rounded-[calc(var(--radius-4xl)-1px)] object-cover"
									/>
								{:else}
									<div
										class="flex aspect-4/3 w-full items-center justify-center rounded-[calc(var(--radius-4xl)-1px)] bg-ink-50"
									>
										<p class="p1-muted text-sm">Добавьте URL изображения</p>
									</div>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>
