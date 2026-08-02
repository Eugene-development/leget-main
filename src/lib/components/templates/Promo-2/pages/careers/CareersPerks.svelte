<script lang="ts">
	// Артикул: 2.12.2.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'CareersPerks', updated);
		data = updated;
	}

	const defaultPerks = [
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.171-2.303 0-3.182.53-.398 1.267-.62 2.003-.62.736 0 1.472.222 2.003.62M12 6V4m0 14v2"/>`,
			title: 'Конкурентная зарплата',
			text: 'Своевременная выплата, привязанная к результату. Ежегодный пересмотр.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
			title: 'Официальное трудоустройство',
			text: 'Оформление по ТК, полный соцпакет, оплачиваемый отпуск.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/>`,
			title: 'Обучение и развитие',
			text: 'Внутренние тренинги и профессиональные экскурсии от наших партнёров.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>`,
			title: 'Дружная команда',
			text: 'Более 700 сотрудников. Открытая командная культура и регулярные мероприятия.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>`,
			title: 'Скидка на продукцию',
			text: 'Корпоративная скидка 30% на всю мебель фабрики для сотрудников.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3"/>`,
			title: 'Карьерный рост',
			text: 'Прозрачная система продвижения. Каждый второй руководитель вырос в компании.'
		}
	];

	const perks = $derived(
		Array.isArray(data?.perks) && (data.perks as unknown[]).length > 0
			? (data.perks as typeof defaultPerks)
			: defaultPerks
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

<section bind:this={sectionEl} class="py-section-sm lg:py-section">
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="mb-14 opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="CareersPerks.label"
				label="Лейбл"
				value={String(data?.label ?? 'Почему мы')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="CareersPerks.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Условия работы')}
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

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each perks as perk, i}
				<div
					class="group border border-border-light bg-white p-8 opacity-0 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated"
					class:animate-fade-up={visible}
					style="animation-delay: {0.08 + i * 0.07}s"
				>
					<div class="mb-5 flex h-10 w-10 items-center justify-center border border-secondary/20 text-secondary transition-colors duration-300 group-hover:border-secondary group-hover:bg-secondary group-hover:text-white">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							{@html perk.icon}
						</svg>
					</div>
					<h3
						class="text-lg font-medium text-primary transition-colors duration-300 group-hover:text-secondary"
						style="font-family: var(--font-heading);"
					>
						{perk.title}
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-secondary">{perk.text}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
