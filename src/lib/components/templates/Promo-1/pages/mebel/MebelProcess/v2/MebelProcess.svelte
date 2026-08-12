<script lang="ts">
	// Артикул: 1.16.5.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	// Нейтраль — из классов p1-*; акцент узла от темы не зависит.
	const isLight = $derived(isLightBlock(data, 'light'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelProcess', updated);
		data = updated;
	}

	async function saveStepField(index: number, field: string, value: string) {
		if (!editContext) return;
		const updatedSteps = [...(data.steps || [])];
		if (!updatedSteps[index]) {
			updatedSteps[index] = { ...steps[index] };
		}
		updatedSteps[index] = { ...updatedSteps[index], [field]: value };
		const updated = { ...data, steps: updatedSteps };
		await saveComponentData(editContext, 'MebelProcess', updated);
		data = updated;
	}

	// Контракт данных тот же, что у v1: ключи `title` и `steps[{title, desc}]`.
	const steps = $derived(
		data.steps || [
			{ title: 'Консультация', desc: 'Обсуждаем ваши пожелания' },
			{ title: 'Замер', desc: 'Бесплатный выезд специалиста' },
			{ title: 'Проект', desc: '3D-визуализация и расчёт' },
			{ title: 'Установка', desc: 'Профессиональный монтаж' }
		]
	);
</script>

<div class="p1-catalog-container my-section-2xs">
	<!--
		Панель, а не полноэкранная секция: на каталожных страницах слева стоит
		сайдбар, и фон во всю ширину ушёл бы под него. Тот же приём, что у
		MebelHero на этой же странице.
	-->
	<section
		class="p1-surface-alt rounded-2xl px-6 py-10 sm:px-10 sm:py-12"
		data-p1-theme={isLight ? 'light' : 'dark'}
	>
		<h2 class="p1-title text-2xl sm:text-3xl">
			<EditableField
				fieldKey="MebelProcess.title"
				label="Заголовок"
				value={String(data.title || 'Как мы работаем')}
				{isEditable}
				inline
				onSave={(v) => saveField('title', v)}
			>
				{#snippet children(val)}
					{val}
				{/snippet}
			</EditableField>
		</h2>

		<!--
			Рельс, а не сетка карточек: последовательность несёт непрерывная линия,
			проходящая сквозь узлы. Колонок ровно столько, сколько этапов, — число
			задаётся из данных через --steps, поэтому пятый этап не ломает раскладку.
		-->
		<ol class="route mt-10 grid gap-0" style="--steps: {steps.length}">
			{#each steps as step, i}
				<li
					class="relative flex animate-fade-up-in gap-5 lg:block"
					style="animation-delay: var(--ds-motion-stagger-{Math.min(i + 1, 5)})"
				>
					<!-- Вертикальный рельс: узкие экраны -->
					<div class="flex w-3 shrink-0 flex-col items-center lg:hidden" aria-hidden="true">
						<span class="mt-1 h-3 w-3 shrink-0 rounded-full bg-link-500"></span>
						{#if i < steps.length - 1}
							<span class="p1-rail mt-2 w-px flex-1"></span>
						{/if}
					</div>

					<!-- Отступ несёт промежуток между этапами, а не сам этап: на последнем
					     он превратился бы в пустое дно панели. -->
					<div class={i < steps.length - 1 ? 'pb-8 lg:pb-0' : ''}>
						<span class="p1-numeric p1-muted block text-xs lg:pr-8">
							{String(i + 1).padStart(2, '0')}
						</span>

						<!-- Горизонтальный рельс: широкие экраны. Вне правого отступа,
						     иначе линия рвалась бы на границе колонок. -->
						<div class="my-4 hidden items-center lg:flex" aria-hidden="true">
							<span class="h-3 w-3 shrink-0 rounded-full bg-link-500"></span>
							{#if i < steps.length - 1}
								<span class="p1-rail ml-2 h-px flex-1"></span>
							{/if}
						</div>

						<div class="mt-2 lg:mt-0 lg:pr-8">
							<h3 class="p1-title-sub p1-title text-lg">
								<EditableField
									fieldKey="MebelProcess.steps.{i}.title"
									label="Заголовок этапа"
									value={step.title}
									{isEditable}
									inline
									onSave={(v) => saveStepField(i, 'title', v)}
								>
									{#snippet children(val)}
										{val}
									{/snippet}
								</EditableField>
							</h3>
							<p class="p1-body mt-1.5 text-sm">
								<EditableField
									fieldKey="MebelProcess.steps.{i}.desc"
									label="Описание этапа"
									value={step.desc ?? ''}
									{isEditable}
									inline
									onSave={(v) => saveStepField(i, 'desc', v)}
								>
									{#snippet children(val)}
										{val}
									{/snippet}
								</EditableField>
							</p>
						</div>
					</div>
				</li>
			{/each}
		</ol>
	</section>
</div>

<style>
	/* Число колонок равно числу этапов: задаётся из данных, не константой. */
	@media (min-width: 1024px) {
		.route {
			grid-template-columns: repeat(var(--steps), minmax(0, 1fr));
		}
	}
</style>
