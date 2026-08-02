<script lang="ts">
	// Артикул: 1.1.6.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const gallery = $derived(
		Array.isArray(data?.gallery) && data.gallery.length > 0
			? (data.gallery as { src: string; alt: string; label: string }[])
			: [
					{ src: '',      alt: 'Шкафы-купе',  label: 'Системы раздвижения' },
					{ src: '', alt: 'Детали',      label: 'Фасады'              },
					{ src: '',   alt: 'Кухни',       label: 'Свет'                },
					{ src: '',         alt: 'Гардеробные', label: 'Гардеробные'         },
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}
</script>

<!-- Преимущества (Incentives) -->
<section class="relative overflow-hidden bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-24">
			<!-- Текст -->
			<div class="flex flex-col justify-center lg:py-8">
				<div class="mb-6">
					<span class="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<EditableField
							fieldKey="Incentives.badge"
							label="Метка"
							value={String(data?.badge ?? 'Выгода')}
							{isEditable}
							onSave={(v) => saveField('badge', v)}
							class="inline"
						>
							{#snippet children(displayValue)}{displayValue}{/snippet}
						</EditableField>
					</span>
				</div>

				<EditableField
					fieldKey="Incentives.title"
					label="Заголовок"
					value={String(data?.title ?? 'С нами выгодно')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="mt-8 space-y-2 text-base leading-7 text-slate-600">
					<EditableField
						fieldKey="Incentives.text"
						label="Текст"
						value={String(data?.text ?? '')}
						{isEditable}
						multiline
						onSave={(v) => saveField('text', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{@html displayValue}
						{/snippet}
					</EditableField>
				</div>

				<div class="mt-8 h-px w-24 bg-linear-to-r from-sky-300 to-cyan-300"></div>
			</div>

			<!-- Галерея -->
			<div class="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
				<div class="space-y-4 sm:space-y-6 lg:space-y-8">
					{#each gallery.slice(0, 2) as item}
						<div class="group relative overflow-hidden rounded-3xl bg-slate-100 shadow-lg ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:ring-slate-300">
							<div class="aspect-4/3 w-full overflow-hidden">
								<ImageFallback src={item.src} alt={item.alt} class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
							</div>
							<div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-70"></div>
							<div class="absolute bottom-6 left-6 text-white">
								<p class="text-lg font-bold">{item.label}</p>
							</div>
						</div>
					{/each}
				</div>

				<div class="space-y-4 pt-8 sm:space-y-6 sm:pt-12 lg:space-y-8">
					{#each gallery.slice(2, 4) as item}
						<div class="group relative overflow-hidden rounded-3xl bg-slate-100 shadow-lg ring-1 ring-slate-200 transition-all duration-500 hover:shadow-xl hover:ring-slate-300">
							<div class="aspect-4/3 w-full overflow-hidden">
								<ImageFallback src={item.src} alt={item.alt} class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
							</div>
							<div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-70"></div>
							<div class="absolute bottom-6 left-6 text-white">
								<p class="text-lg font-bold">{item.label}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
