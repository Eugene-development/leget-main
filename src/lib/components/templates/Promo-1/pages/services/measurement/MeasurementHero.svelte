<script lang="ts">
	// Артикул: 1.13.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';

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
		await saveComponentData(editContext, 'MeasurementHero', updated);
		data = updated;
	}
</script>

<section class="relative flex h-[calc(100vh-88px)] items-center overflow-hidden bg-ink-950">
	<div class="absolute inset-0 z-0">
		<div
			class="absolute top-0 right-0 h-[800px] w-[800px] translate-x-1/4 -translate-y-1/2 rounded-full bg-cat-3-500/10 blur-[120px]"
		></div>
		<div
			class="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/4 rounded-full bg-link-500/10 blur-[100px]"
		></div>
		<div
			class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"
		></div>
	</div>

	<div class="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
		<div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
			<div class="lg:col-span-5" in:fly={{ x: -50, duration: 1000, easing: cubicOut }}>
				<EditableField
					fieldKey="MeasurementHero.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'Услуга компании')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="mb-6 inline-block"
				>
					{#snippet children(displayValue)}
						<div
							class="inline-flex items-center gap-2 rounded-full border border-cat-3-500/20 bg-cat-3-500/10 px-3 py-1 text-sm font-medium text-cat-3-400"
						>
							<span class="relative flex h-2 w-2">
								<span
									class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cat-3-400 opacity-75"
								></span>
								<span class="relative inline-flex h-2 w-2 rounded-full bg-cat-3-500"></span>
							</span>
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<h1 class="text-4xl text-on-dark sm:text-6xl lg:text-7xl">
					<EditableField
						fieldKey="MeasurementHero.title_part1"
						label="Заголовок часть 1"
						value={String(data?.title_part1 ?? 'Проектный замер')}
						{isEditable}
						onSave={(v) => saveField('title_part1', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							{displayValue}
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="MeasurementHero.title_part2"
						label="Заголовок часть 2"
						value={String(data?.title_part2 ?? 'помещения')}
						{isEditable}
						onSave={(v) => saveField('title_part2', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<span
								class="bg-gradient-to-r from-cat-3-400 to-link-400 bg-clip-text text-transparent"
								>{displayValue}</span
							>
						{/snippet}
					</EditableField>
				</h1>

				<EditableField
					fieldKey="MeasurementHero.description"
					label="Описание"
					value={String(
						data?.description ??
							'Точные обмеры — основа качественного дизайн-проекта. Профессиональный замер с фиксацией всех коммуникаций и особенностей помещения.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="mt-8 block"
				>
					{#snippet children(displayValue)}
						<p class="max-w-xl text-lg leading-relaxed text-ink-400 sm:text-xl">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<div class="mt-12 flex flex-wrap gap-6">
					<EditableField
						fieldKey="MeasurementHero.cta_text"
						label="Текст кнопки"
						value={String(data?.cta_text ?? 'Заказать замер')}
						{isEditable}
						onSave={(v) => saveField('cta_text', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<button
								type="button"
								onclick={() => serviceOrderStore.open('measurement')}
								class="group relative inline-flex cursor-pointer items-center gap-3 rounded-full bg-gradient-to-r from-cat-3-500 to-link-600 px-8 py-4 text-base font-bold text-on-accent shadow-xl shadow-cat-3-500/20 transition-all duration-300 hover:scale-105 hover:shadow-cat-3-500/40 active:scale-95"
							>
								<span>{displayValue}</span>
								<svg
									class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2.5"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M17 8l4 4m0 0l-4 4m4-4H3"
									/>
								</svg>
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>

			<div
				class="relative hidden w-full lg:col-span-7 lg:block lg:justify-self-end"
				in:fly={{ x: 50, duration: 1000, delay: 200, easing: cubicOut }}
			>
				<div
					class="absolute -inset-10 bg-gradient-to-tr from-cat-3-500/20 to-link-500/20 opacity-50 blur-[80px]"
				></div>
				<div class="group relative">
					<div
						class="relative z-10 overflow-hidden rounded-[2.5rem] border border-on-dark/10 bg-on-dark/5 p-4 shadow-2xl backdrop-blur-3xl transition-transform duration-500 group-hover:scale-[1.02]"
					>
						<ImageFallback
							src={String(
								data?.hero_image ??
									'https://storage.yandexcloud.net/leget-main/templates/promo-1/measurement_hero.png'
							)}
							alt="Professional Measurement"
							class="aspect-[4/3] w-full rounded-[2rem] object-cover"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
		<button
			onclick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
			class="group p-2 transition-all duration-300 hover:translate-y-1"
			aria-label="Скролл вниз"
		>
			<svg
				class="h-10 w-10 text-on-dark/20 transition-colors group-hover:text-cat-3-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	</div>
</section>
