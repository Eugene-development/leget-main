<script lang="ts">
	// Артикул: 1.12.1.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'DesignProjectHero', updated);
		data = updated;
	}
</script>

<section class="relative flex h-[calc(100vh-88px)] items-center overflow-hidden bg-ink-950">
	<div class="absolute inset-0 z-0">
		<div
			class="absolute inset-0 bg-[linear-gradient(to_right,var(--color-ink-800)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-ink-800)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-[size:4rem_4rem] opacity-20"
		></div>
		<div
			class="absolute top-0 left-1/2 h-full w-full -translate-x-1/2 bg-gradient-to-b from-cat-2-500/10 via-transparent to-transparent blur-[120px]"
		></div>
	</div>

	<div class="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
		<div class="grid items-center gap-12 lg:grid-cols-12 lg:gap-24">
			<div class="lg:col-span-5" in:fly={{ y: 30, duration: 1000, easing: cubicOut }}>
				<EditableField
					fieldKey="DesignProjectHero.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'Проектирование полного цикла')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="mb-8 inline-block"
				>
					{#snippet children(displayValue)}
						<div
							class="inline-flex items-center gap-2 rounded-full border border-cat-2-500/20 bg-cat-2-500/10 px-4 py-1.5 text-xs font-bold tracking-widest text-cat-2-400 uppercase"
						>
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<h1 class="text-5xl text-on-dark sm:text-7xl">
					<EditableField
						fieldKey="DesignProjectHero.title_part1"
						label="Заголовок часть 1"
						value={String(data?.title_part1 ?? 'Проект')}
						{isEditable}
						onSave={(v) => saveField('title_part1', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							{displayValue}
						{/snippet}
					</EditableField>
					<br />
					<EditableField
						fieldKey="DesignProjectHero.title_part2"
						label="Заголовок часть 2"
						value={String(data?.title_part2 ?? 'дизайна')}
						{isEditable}
						onSave={(v) => saveField('title_part2', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<span
								class="bg-gradient-to-r from-cat-2-400 to-cat-9-300 bg-clip-text text-transparent"
								>{displayValue}</span
							>
						{/snippet}
					</EditableField>
				</h1>

				<EditableField
					fieldKey="DesignProjectHero.description"
					label="Описание"
					value={String(
						data?.description ??
							'Создаем не просто красивые картинки, а детально проработанные технические решения для безупречной реализации вашего интерьера.'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="mt-8 block"
				>
					{#snippet children(displayValue)}
						<p class="max-w-xl text-xl leading-relaxed text-ink-400">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<div class="mt-12 flex flex-wrap items-center gap-8">
					<EditableField
						fieldKey="DesignProjectHero.cta_text"
						label="Текст кнопки"
						value={String(data?.cta_text ?? 'Начать проект')}
						{isEditable}
						onSave={(v) => saveField('cta_text', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<button
								type="button"
								onclick={() => serviceOrderStore.open('design-project')}
								class="group relative inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-cat-2-500 px-10 py-5 text-base font-black text-on-accent shadow-2xl shadow-cat-2-500/20 transition-all duration-300 hover:-translate-y-1 hover:bg-cat-2-400 hover:shadow-cat-2-500/40 active:scale-95"
							>
								<span>{displayValue}</span>
							</button>
						{/snippet}
					</EditableField>
				</div>
			</div>

			<div
				class="relative hidden w-full lg:col-span-7 lg:block lg:justify-self-end"
				in:fly={{ x: 60, duration: 1200, delay: 200, easing: cubicOut }}
			>
				<div
					class="absolute -inset-10 bg-gradient-to-tr from-cat-2-500/20 to-cat-9-500/20 opacity-50 blur-[80px]"
				></div>
				<div class="group relative">
					<div
						class="relative z-10 overflow-hidden rounded-[3rem] border border-on-dark/10 bg-on-dark/5 p-4 shadow-2xl backdrop-blur-3xl transition-transform duration-500 group-hover:scale-[1.02]"
					>
						<ImageFallback
							src={String(
								data?.hero_image ??
									'https://storage.yandexcloud.net/leget-main/templates/promo-1/design_project_hero.png'
							)}
							alt="Interior Design Visualization"
							class="aspect-[4/3] w-full rounded-[2.5rem] object-cover"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
		<button
			onclick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
			class="group p-2 transition-all duration-300 hover:translate-y-1"
			aria-label="Скролл вниз"
		>
			<svg
				class="h-10 w-10 text-on-dark/20 transition-colors group-hover:text-cat-2-400"
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
