<script lang="ts">
	// Артикул: 1.15.1.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import ServiceHeroForm from '../_shared/ServiceHeroForm.svelte';
	import '../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Нейтральная палитра — из классов p1-*; акценты от темы не зависят.
	// Дефолт 'dark': блок задуман тёмным, переключатель инвертирует исходный вид.
	const isLight = $derived(isLightBlock(data, 'dark'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'AssemblyHero', updated);
		data = updated;
	}
</script>

<!-- Герой сборки: первый шаг заявки прямо в фолде. Точная копия 1.11.1.1. -->
<section
	class="p1-surface relative flex min-h-hero-fold items-center overflow-hidden"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="absolute inset-0 z-0">
		<ImageFallback
			src={String(
				data?.hero_image ??
					'https://storage.yandexcloud.net/leget-main/templates/promo-1/kitchen_assembly_modern.png'
			)}
			alt=""
			class="h-full w-full object-cover"
		/>
		<!-- Вуаль: приводит кадр к поверхности блока. Порог контраста держит не она, а плита. -->
		<div class="p1-veil absolute inset-0"></div>
	</div>

	<div class="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
		<!--
			Плита под текстом: `p1-overlay` — единственная роль, непрозрачная во всех
			десяти сочетаниях систем и тем, поэтому только на ней текст поверх
			произвольного фото тенанта держит порог по построению, а не по удаче.
		-->
		<div
			class="p1-liquid-glass p1-border max-w-2xl rounded-4xl border px-6 py-10 sm:px-10 sm:py-12"
		>
			<EditableField
				fieldKey="AssemblyHero.badge"
				label="Бейдж"
				value={String(data?.badge ?? 'Услуга')}
				{isEditable}
				onSave={(v) => saveField('badge', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					<span class="p1-label p1-accent">{displayValue}</span>
				{/snippet}
			</EditableField>

			<h1 class="p1-title mt-5 text-4xl sm:text-6xl">
				<EditableField
					fieldKey="AssemblyHero.title_part1"
					label="Заголовок часть 1"
					value={String(data?.title_part1 ?? 'Сборка и')}
					{isEditable}
					onSave={(v) => saveField('title_part1', v)}
					class="inline-block"
				>
					{#snippet children(displayValue)}
						{displayValue}
					{/snippet}
				</EditableField>
				<EditableField
					fieldKey="AssemblyHero.title_part2"
					label="Заголовок часть 2"
					value={String(data?.title_part2 ?? 'установка')}
					{isEditable}
					onSave={(v) => saveField('title_part2', v)}
					class="inline-block"
				>
					{#snippet children(displayValue)}
						<span class="p1-accent">{displayValue}</span>
					{/snippet}
				</EditableField>
			</h1>

			<EditableField
				fieldKey="AssemblyHero.description"
				label="Описание"
				value={String(
					data?.description ??
						'Профессиональная сборка и установка мебели любой сложности профессиональным инструментом. Быстро, чисто, аккуратно и с гарантией качества.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="p1-body max-w-xl text-lg leading-relaxed">{displayValue}</p>
				{/snippet}
			</EditableField>

			<ServiceHeroForm
				serviceType="assembly"
				ctaFieldKey="AssemblyHero.cta_text"
				ctaValue={String(data?.cta_text ?? 'Заказать сборку')}
				note="Вам позвонит первый освободившийся мастер. Заявка ни к чему не обязывает."
				nameId="assembly-hero-name"
				phoneId="assembly-hero-phone"
				{isEditable}
				onSaveCta={(v) => saveField('cta_text', v)}
			/>
		</div>
	</div>
</section>
