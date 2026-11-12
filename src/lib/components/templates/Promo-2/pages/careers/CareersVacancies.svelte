<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	import { openPromo2Form } from '$lib/components/templates/Promo-2/forms/request';
	// Артикул: 2.12.3.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
	import RichText from '$lib/components/RichText.svelte';
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

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'CareersVacancies', updated);
		data = updated;
	}

	const defaultDepartments = ['Все', 'Производство', 'Дизайн', 'Продажи', 'IT', 'Управление'];

	const defaultVacancies = [
		{
			id: 1,
			title: 'Технолог мебельного производства',
			dept: 'Производство',
			city: 'Гродно',
			type: 'Полная занятость',
			experience: 'от 3 лет',
			description:
				'Разработка и оптимизация технологических процессов производства корпусной мебели. Контроль качества на всех этапах.',
			tags: ['Производство', 'Технология', 'Контроль качества']
		},
		{
			id: 2,
			title: 'Дизайнер мебели',
			dept: 'Дизайн',
			city: 'Москва',
			type: 'Полная занятость',
			experience: 'от 1 года',
			description:
				'Создание дизайн-проектов кухонь по запросам клиентов. Работа с 3D-редакторами, визуализация, презентация решений.',
			tags: ['2020']
		},
		{
			id: 3,
			title: 'Менеджер по продажам',
			dept: 'Продажи',
			city: 'Минск',
			type: 'Полная занятость',
			experience: 'от 1 года',
			description:
				'Развитие дилерской сети в регионах. Ведение переговоров, заключение договоров, сопровождение партнёров.',
			tags: ['B2B', 'Переговоры', 'CRM']
		},
		{
			id: 4,
			title: 'Оператор станков с ЧПУ',
			dept: 'Производство',
			city: 'Гродно',
			type: 'Полная занятость',
			experience: 'от 1 года',
			description:
				'Управление оборудованием с ЧПУ на производстве МДФ-фасадов. Программирование, наладка, текущее обслуживание.',
			tags: ['ЧПУ', 'МДФ', 'Наладка']
		}
	];

	const vacancies = $derived(
		Array.isArray(data?.vacancies) && (data.vacancies as unknown[]).length > 0
			? (data.vacancies as typeof defaultVacancies)
			: defaultVacancies
	);

	const departments = $derived([
		...new Set([
			...defaultDepartments,
			...(Array.isArray(data?.departments) ? (data.departments as string[]) : []),
			...vacancies.map((item) => item.dept)
		])
	]);

	let activeDept = $state('Все');
	let expandedId = $state<number | null>(null);

	const filteredVacancies = $derived(
		activeDept === 'Все' ? vacancies : vacancies.filter((v) => v.dept === activeDept)
	);

	let visible = $state(false);
	let sectionEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section bind:this={sectionEl} class="bg-surface-warm py-section-sm lg:py-section" id="vacancies">
	<div class="p2-container mx-auto">
		<!-- Header -->
		<div
			class="mb-10 flex flex-col gap-6 opacity-0 transition-all duration-700 sm:flex-row sm:items-end sm:justify-between"
			class:animate-fade-up={visible}
		>
			<div>
				<EditableField
					fieldKey="CareersVacancies.label"
					label="Лейбл"
					value={editableText(data?.label, 'Открытые позиции')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase"
							><RichText value={displayValue} /></span
						>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="CareersVacancies.heading"
					label="Заголовок"
					value={editableText(data?.heading, 'Вакансии')}
					{isEditable}
					onSave={(v) => saveField('heading', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="mt-3 text-4xl text-primary lg:text-5xl"
							style="font-family: var(--font-heading);"
						>
							<RichText value={displayValue} />
						</h2>
					{/snippet}
				</EditableField>
			</div>
			<p class="text-sm text-muted">
				{filteredVacancies.length}
				{filteredVacancies.length === 1
					? 'вакансия'
					: filteredVacancies.length < 5
						? 'вакансии'
						: 'вакансий'}
			</p>
		</div>

		<!-- Department filter -->
		<div
			class="mb-8 flex flex-wrap gap-2 opacity-0 transition-all duration-700"
			class:animate-fade-up={visible}
			style="animation-delay: 0.15s"
		>
			{#each departments as dept}
				<button
					class="rounded-sm border px-4 py-2 text-xs tracking-wider uppercase transition-all duration-300 {activeDept ===
					dept
						? 'border-primary bg-primary text-white'
						: 'border-border-medium bg-white text-secondary hover:border-primary hover:text-primary'}"
					onclick={() => {
						activeDept = dept;
						expandedId = null;
					}}
				>
					<ContentText
						bind:data
						{editContext}
						{isEditable}
						componentType="CareersVacancies"
						path={['copy', 'departments', `label:${dept}`]}
						fallback={dept}
						label="Текст"
						richText={false}
					/>
				</button>
			{/each}
		</div>

		<!-- Vacancies list -->
		<div class="divide-y divide-border-light border border-border-light bg-white">
			{#each filteredVacancies as vac, i}
				<div
					class="opacity-0 transition-all duration-500"
					class:animate-fade-up={visible}
					style="animation-delay: {0.25 + i * 0.06}s"
				>
					<button
						class="group w-full text-left"
						onclick={() => (expandedId = expandedId === vac.id ? null : vac.id)}
					>
						<div
							class="flex items-start gap-6 rounded-sm px-6 py-6 transition-colors duration-300 hover:bg-surface-warm sm:items-center sm:px-8"
						>
							<div class="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-8">
								<div class="min-w-0 flex-1">
									<h3
										class="text-base text-primary transition-colors duration-300 group-hover:text-secondary"
										style="font-family: var(--font-heading);"
									>
										<ContentText
											bind:data
											{editContext}
											{isEditable}
											componentType="CareersVacancies"
											path={['vacancies', vacancies.indexOf(vac), 'title']}
											fallback={vac.title}
											label="Заголовок"
											defaults={{ vacancies }}
											richText={false}
										/>
									</h3>
									<div class="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
										<span class="text-xs text-muted"
											><ContentText
												bind:data
												{editContext}
												{isEditable}
												componentType="CareersVacancies"
												path={['vacancies', vacancies.indexOf(vac), 'city']}
												fallback={vac.city}
												label="Текст"
												defaults={{ vacancies }}
												richText={false}
											/></span
										>
										<span class="h-1 w-1 rounded-full bg-border-medium"></span>
										<span class="text-xs text-muted"
											><ContentText
												bind:data
												{editContext}
												{isEditable}
												componentType="CareersVacancies"
												path={['vacancies', vacancies.indexOf(vac), 'type']}
												fallback={vac.type}
												label="Текст"
												defaults={{ vacancies }}
												richText={false}
											/></span
										>
										<span class="h-1 w-1 rounded-full bg-border-medium"></span>
										<span class="text-xs text-muted"
											><ContentText
												bind:data
												{editContext}
												{isEditable}
												componentType="CareersVacancies"
												path={['copy', 'body1']}
												fallback={'Опыт:'}
												label="Опыт:"
												richText={false}
											/>
											<ContentText
												bind:data
												{editContext}
												{isEditable}
												componentType="CareersVacancies"
												path={['vacancies', vacancies.indexOf(vac), 'experience']}
												fallback={vac.experience}
												label="Текст"
												defaults={{ vacancies }}
												richText={false}
											/></span
										>
									</div>
								</div>
								<div class="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
									<span
										class="inline-block border border-border-medium px-2.5 py-0.5 text-[10px] tracking-wider text-muted uppercase"
										><ContentText
											bind:data
											{editContext}
											{isEditable}
											componentType="CareersVacancies"
											path={['vacancies', vacancies.indexOf(vac), 'dept']}
											fallback={vac.dept}
											label="Текст"
											defaults={{ vacancies }}
											richText={false}
										/></span
									>
								</div>
							</div>
							<svg
								class="h-5 w-5 shrink-0 text-muted transition-all duration-300 {expandedId ===
								vac.id
									? 'rotate-180 text-secondary'
									: 'group-hover:text-secondary'}"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.5 8.25l-7.5 7.5-7.5-7.5"
								/>
							</svg>
						</div>
					</button>

					{#if expandedId === vac.id}
						<div class="border-t border-border-light bg-surface-warm px-6 py-6 pb-8 sm:px-8">
							<p class="max-w-2xl text-sm leading-relaxed text-secondary">
								<ContentText
									bind:data
									{editContext}
									{isEditable}
									componentType="CareersVacancies"
									path={['vacancies', vacancies.indexOf(vac), 'description']}
									fallback={vac.description}
									label="Описание"
									defaults={{ vacancies }}
									multiline
								/>
							</p>
							<div class="mt-5 flex flex-wrap gap-2">
								{#each vac.tags as tag, tagIndex}
									<span
										class="border border-border-medium bg-white px-3 py-1 text-[11px] tracking-wider text-muted uppercase"
										><ContentText
											bind:data
											{editContext}
											{isEditable}
											componentType="CareersVacancies"
											path={['vacancies', vacancies.indexOf(vac), 'tags', vac.tags.indexOf(tag)]}
											fallback={tag}
											label="Текст"
											defaults={{ vacancies }}
										/></span
									>
								{/each}
							</div>
							<div class="mt-6 flex flex-wrap items-center gap-4">
								<button
									class="group inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-6 py-3 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
									type="button"
									data-metrika-goal="pages_careers_careersvacancies_open"
									data-goal-action="open"
									onclick={() => {
										if (!isEditable) openPromo2Form('careers', vac.title);
									}}
								>
									<ContentText
										bind:data
										{editContext}
										{isEditable}
										componentType="CareersVacancies"
										path={['copy', 'applyText']}
										fallback={'Откликнуться'}
										label="Откликнуться"
										richText={false}
									/>
									<svg
										class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="1.5"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
										/>
									</svg>
								</button>
							</div>
						</div>
					{/if}
				</div>
			{/each}

			{#if filteredVacancies.length === 0}
				<div class="px-8 py-16 text-center text-muted">
					<p class="text-sm">
						<ContentText
							bind:data
							{editContext}
							{isEditable}
							componentType="CareersVacancies"
							path={['copy', 'body2']}
							fallback={'Вакансий в этой категории не найдено.'}
							label="Вакансий в этой категории не найдено."
							multiline
						/>
					</p>
				</div>
			{/if}
		</div>
	</div>
</section>
