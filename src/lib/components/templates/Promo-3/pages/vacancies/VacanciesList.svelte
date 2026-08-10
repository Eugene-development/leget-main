<script lang="ts">
	// Артикул: 3.8.2.1 — см. docs/architecture/component-articles-map.md
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

	let activeVacancy = $state<string | null>(null);

	const defaultVacancies = [
		{
			id: 'tiler',
			title: 'Плиточник',
			type: 'Полная занятость',
			location: 'Москва и МО',
			salary: 'от 90 000 ₽',
			icon: `<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" stroke-linecap="round" stroke-linejoin="round"/>`,
			description:
				'Занимаемся профессиональной укладкой плитки в жилых и коммерческих объектах. Ищем профессионала с безупречным качеством работы.',
			duties: [
				'Укладка настенной и напольной плитки, керамогранита и мозаики',
				'Подготовка поверхностей (штукатурка, выравнивание, гидроизоляция)',
				'Работа с погонажем, порогами и декоративными элементами'
			],
			requirements: [
				'Опыт укладки плитки от 3 лет',
				'Умение работать с крупноформатными плитами (60×120 и более)',
				'Аккуратность, ответственность, работа в команде'
			]
		},
		{
			id: 'sales',
			title: 'Менеджер по продажам',
			type: 'Полная занятость',
			location: 'Москва, офис / гибрид',
			salary: 'от 70 000 ₽ + бонусы',
			icon: `<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke-linecap="round" stroke-linejoin="round"/>`,
			description:
				'Продажи — сердце нашего бизнеса. Мы ищем энергичного консультанта, который умеет слушать клиентов и подбирать решения.',
			duties: [
				'Консультирование клиентов в шоуруме и по телефону',
				'Подбор коллекций плитки под проект и бюджет клиента',
				'Ведение CRM, выставление счетов, контроль отгрузки'
			],
			requirements: [
				'Опыт продаж в сфере строительных материалов или интерьера от 1 года',
				'Умение работать с возражениями и вести переговоры',
				'Грамотная речь, презентабельный внешний вид'
			]
		},
		{
			id: 'designer',
			title: 'Дизайнер мебели',
			type: 'Полная занятость / Проектная работа',
			location: 'Москва, гибридный формат',
			salary: 'от 80 000 ₽',
			icon: `<path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke-linecap="round" stroke-linejoin="round"/>`,
			description:
				'Создаём интерьеры, в которых плитка и мебель дополняют друг друга. Ищем дизайнера, способного мыслить пространством и деталями одновременно.',
			duties: [
				'Разработка концепций меблировки для жилых и коммерческих интерьеров',
				'Создание 3D-визуализаций в сочетании с нашими коллекциями плитки',
				'Сопровождение проекта от эскиза до монтажа'
			],
			requirements: [
				'Профессиональное образование в области дизайна интерьеров',
				'Уверенное владение 3ds Max / SketchUp / Revit, Photoshop',
				'Портфолио выполненных проектов — обязательно'
			]
		},
		{
			id: 'curator',
			title: 'Куратор проектов',
			type: 'Полная занятость',
			location: 'Москва и МО',
			salary: 'от 85 000 ₽',
			icon: `<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>`,
			description:
				'Координируем ремонтные проекты от замера до сдачи объекта. Ищем человека, который умеет держать всё под контролем.',
			duties: [
				'Координация взаимодействия между клиентами, дизайнерами и бригадами монтажников',
				'Составление и ведение проектных планов, контроль сроков и бюджетов',
				'Выезд на объекты для приёмки работ и консультаций'
			],
			requirements: [
				'Опыт управления строительными или ремонтными проектами от 2 лет',
				'Умение работать в режиме многозадачности',
				'Знание строительных технологий и материалов'
			]
		}
	];

	const vacancies = $derived(
		Array.isArray(data?.vacancies) && (data.vacancies as unknown[]).length > 0
			? (data.vacancies as typeof defaultVacancies)
			: defaultVacancies
	);

	function openVacancy(id: string) {
		activeVacancy = activeVacancy === id ? null : id;
	}
</script>

<section class="relative py-24 lg:py-32">
	<div class="px-10 lg:px-24 xl:px-32">
		<div class="mb-16">
			<span class="text-xs font-semibold tracking-[0.3em] text-accent-500 uppercase"
				>Открытые позиции</span
			>
			<h2 class="font-display mt-3 text-4xl text-white lg:text-5xl">
				{vacancies.length} вакансии <span class="text-surface-300">прямо сейчас</span>
			</h2>
			<p class="mt-4 max-w-2xl text-surface-300">
				Нажмите на карточку, чтобы узнать подробности об обязанностях и требованиях.
			</p>
		</div>

		<div class="flex flex-col gap-4">
			{#each vacancies as vacancy}
				<div
					class="group rounded-2xl border border-surface-700/50 bg-surface-800/40 transition-all duration-500 hover:border-accent-500/30 hover:bg-surface-800/70"
				>
					<button
						class="flex w-full items-center gap-6 p-6 text-left lg:p-8"
						onclick={() => openVacancy(vacancy.id)}
						aria-expanded={activeVacancy === vacancy.id}
					>
						<div
							class="flex size-14 shrink-0 items-center justify-center rounded-xl border border-accent-500/20 bg-accent-500/10 transition-all duration-300 group-hover:border-accent-500/50 group-hover:bg-accent-500/15"
						>
							<svg
								viewBox="0 0 24 24"
								class="size-6 fill-none stroke-accent-500 stroke-2"
								stroke-linecap="round"
								stroke-linejoin="round">{@html vacancy.icon}</svg
							>
						</div>
						<div class="min-w-0 flex-1">
							<h3 class="text-xl text-white">{vacancy.title}</h3>
							<div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5">
								<span class="text-sm text-surface-300">{vacancy.type}</span>
								<span class="h-1 w-1 rounded-full bg-surface-500"></span>
								<span class="text-sm text-surface-300">{vacancy.location}</span>
							</div>
						</div>
						<div class="flex shrink-0 items-center gap-6">
							<span class="hidden text-base font-semibold text-accent-500 sm:block"
								>{vacancy.salary}</span
							>
							<div
								class="flex size-9 items-center justify-center rounded-full border border-surface-600 bg-surface-700 transition-all duration-300 group-hover:border-accent-500/40 group-hover:bg-surface-600"
							>
								<svg
									viewBox="0 0 16 16"
									class="size-4 fill-none stroke-surface-300 stroke-2 transition-transform duration-300 {activeVacancy ===
									vacancy.id
										? 'rotate-180'
										: ''}"
									stroke-linecap="round"
									stroke-linejoin="round"><path d="M4 6l4 4 4-4" /></svg
								>
							</div>
						</div>
					</button>

					{#if activeVacancy === vacancy.id}
						<div class="border-t border-surface-700/50 px-6 pt-6 pb-8 lg:px-8">
							<p class="mb-8 leading-relaxed text-surface-300">{vacancy.description}</p>
							<div class="grid gap-8 lg:grid-cols-2">
								<div>
									<h4 class="mb-4 text-sm text-surface-50 uppercase">Обязанности</h4>
									<ul class="flex flex-col gap-3">
										{#each vacancy.duties as duty}
											<li class="flex items-start gap-3">
												<div
													class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-500/10"
												>
													<svg viewBox="0 0 12 12" class="size-2.5 fill-accent-500"
														><path
															d="M10.28 2.28L3.989 8.575 1.695 6.28A.751.751 0 00.633 7.345l2.83 2.83a.75.75 0 001.06 0l6.88-6.83a.751.751 0 00-1.123-1.065z"
														/></svg
													>
												</div>
												<span class="text-sm leading-relaxed text-surface-300">{duty}</span>
											</li>
										{/each}
									</ul>
								</div>
								<div>
									<h4 class="mb-4 text-sm text-surface-50 uppercase">Требования</h4>
									<ul class="flex flex-col gap-3">
										{#each vacancy.requirements as req}
											<li class="flex items-start gap-3">
												<div
													class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-accent-500/30"
												>
													<span class="size-1.5 rounded-full bg-accent-500"></span>
												</div>
												<span class="text-sm leading-relaxed text-surface-300">{req}</span>
											</li>
										{/each}
									</ul>
								</div>
							</div>
							<div
								class="mt-10 flex flex-col gap-4 rounded-2xl border border-accent-500/15 bg-accent-500/5 p-6 sm:flex-row sm:items-center sm:justify-between"
							>
								<div>
									<p class="font-semibold text-white">Хотите откликнуться?</p>
									<p class="mt-1 text-sm text-surface-300">
										Оставьте имя и телефон — мы свяжемся с вами в течение рабочего дня.
									</p>
								</div>
								<a
									href="#apply"
									class="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold tracking-wide text-surface-900 uppercase transition-all duration-300 hover:bg-accent-400 hover:shadow-xl hover:shadow-accent-500/30"
								>
									Откликнуться
									<svg viewBox="0 0 20 20" class="size-4 fill-current"
										><path
											fill-rule="evenodd"
											d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
											clip-rule="evenodd"
										/></svg
									>
								</a>
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
