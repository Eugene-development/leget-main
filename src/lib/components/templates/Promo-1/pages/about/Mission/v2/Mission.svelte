<script lang="ts">
	// Артикул: 1.2.3.2 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
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
	const isLight = $derived(isLightBlock(data, 'light'));
	const imageUrl = $derived(String(data?.imageUrl ?? '').trim());
	const supporting = $derived(
		[
			{ key: 'text2', label: 'Абзац 2', value: String(data?.text2 ?? '') },
			{ key: 'text3', label: 'Абзац 3', value: String(data?.text3 ?? '') }
		].filter((paragraph) => paragraph.value.trim() || isEditable)
	);
	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Mission', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface mission-manifest py-section-sm"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<EditableField
			fieldKey="Mission.title"
			label="Заголовок"
			value={String(data?.title ?? 'Наша миссия')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="p1-title text-3xl text-pretty sm:text-4xl"><RichText value={displayValue} /></h2>
			{/snippet}
		</EditableField>
		{#if String(data?.text1 ?? '').trim() || isEditable}
			<EditableField
				fieldKey="Mission.text1"
				label="Абзац 1"
				value={String(data?.text1 ?? '')}
				{isEditable}
				multiline
				onSave={(v) => saveField('text1', v)}
				class="mt-8 block sm:mt-10"
			>
				{#snippet children(displayValue)}
					<p class="p1-statement max-w-[34ch]">
						<RichText value={displayValue || (isEditable ? 'Добавьте первый абзац' : '')} />
					</p>
				{/snippet}
			</EditableField>
		{/if}
		{#if supporting.length || imageUrl || isEditable}
			<div
				class="mission-continuation mt-10 grid gap-8 border-t pt-8 sm:mt-12 sm:gap-10 sm:pt-10"
				class:mission-with-image={imageUrl || isEditable}
			>
				{#if imageUrl || isEditable}
					<EditableField
						fieldKey="Mission.imageUrl"
						kind="image"
						label="URL изображения"
						value={String(data?.imageUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('imageUrl', v)}
						class="block min-w-0"
					>
						{#snippet children(displayValue)}
							{#if displayValue.trim()}
								<ImageFallback
									loading="lazy"
									src={displayValue}
									alt=""
									class="aspect-4/3 w-full rounded-lg object-cover"
								/>
							{:else}
								<div
									class="p1-surface-alt p1-body flex aspect-4/3 items-center justify-center rounded-lg text-sm"
								>
									Добавьте URL изображения
								</div>
							{/if}
						{/snippet}
					</EditableField>
				{/if}
				{#if supporting.length}
					<div class="mission-support grid gap-6 sm:gap-10">
						{#each supporting as paragraph (paragraph.key)}
							<EditableField
								fieldKey="Mission.{paragraph.key}"
								label={paragraph.label}
								value={paragraph.value}
								{isEditable}
								multiline
								onSave={(v) => saveField(paragraph.key, v)}
								class="block min-w-0"
							>
								{#snippet children(displayValue)}
									<p class="p1-body text-prose">
										<RichText
											value={displayValue ||
												(isEditable ? `Добавьте ${paragraph.label.toLowerCase()}` : '')}
										/>
									</p>
								{/snippet}
							</EditableField>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>

<style>
	.mission-manifest {
		overflow-wrap: anywhere;
	}
	.mission-continuation {
		border-color: var(--p1-line);
	}
	.mission-support {
		max-width: 72rem;
	}
	@media (min-width: 768px) {
		.mission-support {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.mission-with-image {
			grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
			align-items: start;
		}
		.mission-with-image .mission-support {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
