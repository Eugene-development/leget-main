<script lang="ts">
	// Артикул: 1.19.2.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const bgImage = $derived(data.bgImage || '/countertops_hero.png');

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'StoleshnicaHero', updated);
		data = updated;
	}
</script>

<div class="mebel-container">
	<section class="mebel-hero relative overflow-hidden rounded-2xl bg-slate-900">
		<img src={bgImage} alt="Hero" class="absolute inset-0 h-full w-full object-cover opacity-40" />

		<div class="relative px-8 py-16 sm:px-12 sm:py-20">
			<!-- Хлебные крошки -->
			<nav class="mb-6 flex items-center gap-2 text-sm text-slate-400">
				<a href="/" class="transition-colors hover:text-white">Главная</a>
				<span>/</span>
				<span class="text-white">Столешницы</span>
			</nav>

			<h1 class="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
				<EditableField
					fieldKey="StoleshnicaHero.title"
					label="Заголовок"
					value={String(data.title || 'Столешницы')}
					{isEditable}
					inline
					onSave={(v) => saveField('title', v)}
				>
					{#snippet children(val)}
						{val}
					{/snippet}
				</EditableField>
			</h1>

			<p class="mt-4 max-w-xl text-lg text-slate-300">
				<EditableField
					fieldKey="StoleshnicaHero.description"
					label="Описание"
					value={String(data.description || 'Изготавливаем столешницы из искусственного камня, кварца, массива и других материалов. Точный раскрой под вашу кухню с вырезами под мойку и варочную панель.')}
					{isEditable}
					inline
					multiline
					onSave={(v) => saveField('description', v)}
				>
					{#snippet children(val)}
						{val}
					{/snippet}
				</EditableField>
			</p>

			<div class="mt-8 flex flex-wrap gap-4">
				<button
					class="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-medium text-white transition-all hover:bg-amber-600"
				>
					<EditableField
						fieldKey="StoleshnicaHero.primaryButton"
						label="Текст кнопки 1"
						value={String(data.primaryButton || 'Рассчитать стоимость')}
						{isEditable}
						inline
						onSave={(v) => saveField('primaryButton', v)}
					>
						{#snippet children(val)}
							{val}
						{/snippet}
					</EditableField>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
					</svg>
				</button>

				<button
					class="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-medium text-white backdrop-blur transition-all hover:bg-white/20"
				>
					<EditableField
						fieldKey="StoleshnicaHero.secondaryButton"
						label="Текст кнопки 2"
						value={String(data.secondaryButton || 'Вызвать замерщика')}
						{isEditable}
						inline
						onSave={(v) => saveField('secondaryButton', v)}
					>
						{#snippet children(val)}
							{val}
						{/snippet}
					</EditableField>
				</button>
			</div>
		</div>
	</section>
</div>

<style>
	:global(.mebel-container) {
		max-width: 1536px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 1rem;
		padding-right: 1rem;
		margin-top: 4rem;
	}

	@media (min-width: 1024px) {
		:global(.mebel-container) {
			padding-left: 360px;
		}
	}

	h1 {
		font-family: inherit;
	}
</style>
