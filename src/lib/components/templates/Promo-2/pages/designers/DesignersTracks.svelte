<script lang="ts">
	import { onMount } from 'svelte';
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
		await saveComponentData(editContext, 'DesignersTracks', updated);
		data = updated;
	}

	const defaultTracks = [
		{
			id: 'studio',
			label: 'Дизайн-студиям',
			title: 'Программа для студий',
			description: 'Подходит для дизайн-бюро и архитектурных студий с регулярным потоком проектов. Предусматривает корпоративный договор, сводные счета и персональные условия сотрудничества.',
			points: [
				'Скидка от 15% до 22% в зависимости от объёма',
				'Сводные акты и единый счёт раз в месяц',
				'Единый менеджер для всей команды студии',
				'Доступ к закрытым коллекциям и предпродажам',
				'Совместное участие в выставках и мероприятиях'
			]
		},
		{
			id: 'freelance',
			label: 'Фрилансерам',
			title: 'Программа для независимых дизайнеров',
			description: 'Идеально для частных дизайнеров интерьеров: гибкие условия без минимального объёма, быстрая регистрация через онлайн-заявку и поддержка на каждом этапе проекта.',
			points: [
				'Фиксированная скидка 12% с первого заказа',
				'Без минимального объёма и ежемесячных обязательств',
				'Персональный кабинет с историей заказов и КП',
				'Бесплатные образцы к каждому проекту',
				'Реферальный бонус: 3% от заказов привлечённых клиентов'
			]
		}
	];

	const tracks = $derived(
		Array.isArray(data?.tracks) && (data.tracks as unknown[]).length > 0
			? (data.tracks as typeof defaultTracks)
			: defaultTracks
	);

	let activeTrack = $state('studio');

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

<section bind:this={sectionEl} class="bg-surface-warm py-section-sm lg:py-section" id="how-it-works">
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="mb-10 opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="DesignersTracks.label"
				label="Лейбл"
				value={String(data?.label ?? 'Выберите формат')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="DesignersTracks.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Программы сотрудничества')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mt-3 text-4xl font-light text-primary lg:text-5xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>
		</div>

		<!-- Tab switcher -->
		<div
			class="mb-10 flex gap-2 border-b border-border-light opacity-0 transition-all duration-700"
			class:animate-fade-up={visible}
			style="animation-delay: 0.15s"
		>
			{#each tracks as track}
				<button
					class="relative pb-4 text-sm tracking-wide transition-colors duration-300 {activeTrack === track.id ? 'text-primary' : 'text-muted hover:text-secondary'}"
					onclick={() => (activeTrack = track.id)}
				>
					{track.label}
					{#if activeTrack === track.id}
						<span class="absolute bottom-0 left-0 h-0.5 w-full bg-secondary"></span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Content -->
		{#each tracks as track}
			{#if activeTrack === track.id}
				<div class="grid gap-12 lg:grid-cols-2 lg:gap-20">
					<div class="opacity-0 transition-all duration-500" class:animate-fade-up={visible} style="animation-delay: 0.25s">
						<h3
							class="text-3xl font-light text-primary lg:text-4xl"
							style="font-family: var(--font-heading);"
						>
							{track.title}
						</h3>
						<p class="mt-5 text-base leading-relaxed text-secondary">{track.description}</p>
						<a
							href="#application"
							class="group mt-8 inline-flex items-center gap-3 rounded-sm border border-primary bg-primary px-7 py-3.5 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:border-secondary hover:bg-secondary"
						>
							Оставить заявку
							<svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
							</svg>
						</a>
					</div>

					<div class="opacity-0 transition-all duration-500" class:animate-fade-up={visible} style="animation-delay: 0.35s">
						<ul class="divide-y divide-border-light">
							{#each track.points as point, j}
								<li class="flex items-start gap-4 py-4">
									<span class="mt-0.5 shrink-0 text-xs font-medium text-accent tabular-nums">0{j + 1}</span>
									<span class="text-sm leading-relaxed text-primary">{point}</span>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/if}
		{/each}
	</div>
</section>
