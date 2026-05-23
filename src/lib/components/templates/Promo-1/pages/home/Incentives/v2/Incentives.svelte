<script lang="ts">
	import EditableField from '$lib/components/EditableField.svelte';
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
					{ src: '/incentives/wardrobe.png',      alt: 'Шкафы-купе',  label: 'Системы раздвижения' },
					{ src: '/incentives/kitchen_detail.png', alt: 'Детали',      label: 'Фасады'              },
					{ src: '/incentives/kitchen_main.png',   alt: 'Кухни',       label: 'Свет'                },
					{ src: '/incentives/closet.png',         alt: 'Гардеробные', label: 'Гардеробные'         },
				]
	);

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Incentives', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-slate-50 py-24 sm:py-32 font-sans select-none text-slate-800">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid gap-16 lg:grid-cols-12 lg:items-center">
			
			<!-- Левая колонка: Текст (V2 Outfit style) -->
			<div class="lg:col-span-5 flex flex-col justify-center text-left">
				<div class="mb-6">
					<span class="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 backdrop-blur-md">
						<svg class="h-4 w-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
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
						<h2 class="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-display leading-tight">{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="mt-8 space-y-4 text-base leading-relaxed text-slate-600">
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
							<div class="text-slate-600 font-medium">{@html displayValue}</div>
						{/snippet}
					</EditableField>
				</div>

				<div class="mt-10 flex items-center gap-3">
					<span class="w-12 h-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"></span>
					<span class="text-xs font-bold uppercase tracking-widest text-slate-400 font-display">Ваш умный выбор</span>
				</div>
			</div>

			<!-- Правая колонка: Асимметричная мозаика (V2 Masonry Grid) -->
			<div class="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
				<!-- Левый блок мозаики -->
				<div class="flex flex-col gap-4 sm:gap-6 justify-center">
					{#each gallery.slice(0, 2) as item}
						<div class="group relative overflow-hidden rounded-3xl bg-slate-200 shadow-xl border border-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
							<div class="aspect-[4/3] w-full overflow-hidden">
								<img src={item.src} alt={item.alt} class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
							</div>
							<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
							<!-- Стеклянный шильдик названия на V2 -->
							<div class="absolute bottom-4 left-4 right-4 p-3 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-md text-white">
								<p class="text-xs md:text-sm font-bold tracking-wide uppercase font-display">{item.label}</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- Правый блок со смещением по вертикали -->
				<div class="flex flex-col gap-4 sm:gap-6 pt-10 sm:pt-16">
					{#each gallery.slice(2, 4) as item}
						<div class="group relative overflow-hidden rounded-3xl bg-slate-200 shadow-xl border border-slate-200/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
							<div class="aspect-[4/3] w-full overflow-hidden">
								<img src={item.src} alt={item.alt} class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
							</div>
							<div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
							<!-- Стеклянный шильдик названия на V2 -->
							<div class="absolute bottom-4 left-4 right-4 p-3 rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-md text-white">
								<p class="text-xs md:text-sm font-bold tracking-wide uppercase font-display">{item.label}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>

		</div>
	</div>
</section>

<style>
	@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&display=swap');

	.font-display {
		font-family: 'Outfit', sans-serif;
	}
</style>
