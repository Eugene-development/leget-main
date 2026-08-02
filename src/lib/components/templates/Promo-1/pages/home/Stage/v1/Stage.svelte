<script lang="ts">
	// Артикул: 1.1.5.1 — см. docs/architecture/component-articles-map.md
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

	const steps = $derived(
		Array.isArray(data?.steps) && data.steps.length > 0
			? (data.steps as { title: string; description: string }[])
			: [
					{ title: 'Консультация', description: 'Наш менеджер даст консультацию по материалам и возможным решениям в проектировании мебели' },
					{ title: 'Замер',        description: 'Организуем проектный замер помещения с обозначением углов, коммуникаций и розеток' },
					{ title: 'Проект',       description: 'Дизайнер составит проект мебели с учётом всех ваших пожеланий и размеров помещения' },
					{ title: 'Договор',      description: 'Поможем комфортно заключить договор с указанием всех условий выполнения вашего проекта' },
					{ title: 'Изготовление', description: 'Фабрика изготовит заказ на высокотехнологичном оборудовании под контролем технологов' },
					{ title: 'Сборка',       description: 'Профессиональные сборщики компании качественно выполнят монтаж и установку мебели' },
				]
	);

	// SVG иконки для каждого шага
	const icons = [
		'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
		'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
		'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
		'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
		'M5 13l4 4L19 7',
	];

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Stage', updated);
		data = updated;
	}

	async function saveStepField(index: number, field: 'title' | 'description', value: string) {
		if (!editContext) return;
		const updatedSteps = [...steps];
		updatedSteps[index] = { ...updatedSteps[index], [field]: value };
		const updated = { ...data, steps: updatedSteps };
		await saveComponentData(editContext, 'Stage', updated);
		data = updated;
	}
</script>

<!-- Этапы работы (Stage) -->
<section class="relative isolate overflow-hidden py-24 sm:py-32">
	<ImageFallback
		src={String(data?.bgImage ?? '')}
		alt="Интерьер с мебелью"
		class="absolute inset-0 -z-20 h-full w-full object-cover"
	/>
	<div class="absolute inset-0 -z-10 bg-black/50"></div>

	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl rounded-2xl bg-black/30 p-8 backdrop-blur-sm lg:mx-0">
			<span class="inline-flex items-center gap-2 rounded-full bg-sky-500/20 px-4 py-1.5 text-sm font-medium text-sky-300">
				<EditableField
					fieldKey="Stage.badge"
					label="Метка"
					value={String(data?.badge ?? 'Это важно')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline"
				>
					{#snippet children(displayValue)}{displayValue}{/snippet}
				</EditableField>
			</span>

			<EditableField
				fieldKey="Stage.title"
				label="Заголовок"
				value={String(data?.title ?? 'Наша работа')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="mt-4 text-4xl font-bold text-white sm:text-5xl">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Stage.description"
				label="Описание"
				value={String(data?.description ?? 'Мы поддержим вас на всех этапах работы над мебельным проектом: от первой консультации до дня финальной сборки.')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mt-6 text-lg leading-relaxed text-slate-200">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 lg:mx-0 lg:max-w-none lg:grid-cols-3">
			{#each steps as step, i}
				<div class="group rounded-2xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-sm transition-all duration-300 hover:bg-white/15">
					<div class="flex items-start gap-4">
						<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-sky-500 to-cyan-500 text-white">
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[i % icons.length]} />
							</svg>
						</div>
						<div>
							<h3 class="text-lg font-semibold text-white">
								<EditableField
									fieldKey={`Stage.steps.${i}.title`}
									label="Заголовок"
									value={step.title}
									{isEditable}
									inline
									onSave={(v) => saveStepField(i, 'title', v)}
									class="inline"
								>
									{#snippet children(displayValue)}{displayValue}{/snippet}
								</EditableField>
							</h3>
							<p class="mt-2 text-sm text-slate-300">
								<EditableField
									fieldKey={`Stage.steps.${i}.description`}
									label="Описание"
									value={step.description}
									{isEditable}
									multiline
									inline
									onSave={(v) => saveStepField(i, 'description', v)}
									class="inline"
								>
									{#snippet children(displayValue)}{displayValue}{/snippet}
								</EditableField>
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
