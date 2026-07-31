<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';

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
		await saveComponentData(editContext, 'Mission', updated);
		data = updated;
	}

	/** Абзацы миссии: ключи те же (text1…text3), пустые не рендерятся. */
	const paragraphs = $derived([
		{ key: 'text1', label: 'Абзац 1', value: String(data?.text1 ?? '') },
		{ key: 'text2', label: 'Абзац 2', value: String(data?.text2 ?? '') },
		{ key: 'text3', label: 'Абзац 3', value: String(data?.text3 ?? '') }
	]);

	const imageUrl = $derived(String(data?.imageUrl ?? '').trim());
</script>

<section class="relative isolate overflow-hidden bg-white py-24">
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
						<h2
							class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-slate-900 sm:text-4xl lg:text-5xl"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<div class="ab-rule ab-d1 mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
					<span class="h-px flex-1 bg-slate-900/10"></span>
					<span class="size-1.5 rotate-45 border border-red-500/70"></span>
					<span class="h-px flex-1 bg-slate-900/10"></span>
				</div>

				<!--
					Абзацы идут одним списком: раньше каждый был отдельным блоком со своим
					mt-*, и при пустом первом абзаце отступы съезжали. Теперь отступ задаёт
					сам список, а пустые значения просто не рисуются.
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
								{#if displayValue}
									<p class="max-w-xl text-sm/6 text-slate-600 sm:text-base/7">{displayValue}</p>
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
						class="rounded-4xl bg-linear-to-br from-red-500/25 via-slate-900/10 to-red-500/25 p-px shadow-[0_40px_100px_-60px_rgba(15,23,42,0.55)]"
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
									<img
										loading="lazy"
										src={displayValue}
										alt=""
										class="aspect-4/3 w-full rounded-[calc(var(--radius-4xl)-1px)] object-cover"
									/>
								{:else}
									<div
										class="flex aspect-4/3 w-full items-center justify-center rounded-[calc(var(--radius-4xl)-1px)] bg-slate-50"
									>
										<p class="text-sm text-slate-400">Добавьте URL изображения</p>
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
