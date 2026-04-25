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
		await saveComponentData(editContext, 'DesignersBenefits', updated);
		data = updated;
	}

	const defaultBenefits = [
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z"/>`,
			title: 'Партнёрская скидка',
			text: 'До 5% дополнительная скидка на всю продукцию фабрики. Скидка применяется по дополнительному согласованию.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z"/>`,
			title: 'Образцы и каталоги',
			text: 'Бесплатный набор образцов материалов и актуальных каталогов с доставкой на адрес студии или клиента.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>`,
			title: 'Персональный менеджер',
			text: 'Выделенный менеджер отвечает в течение 2 часов, берёт на себя расчёт смет и контроль сроков производства.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>`,
			title: 'Приоритет в производстве',
			text: 'Заказы партнёров-дизайнеров выполняются в приоритетной очереди. Срок производства — от 22 рабочих дней.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"/>`,
			title: '3D-визуализация',
			text: 'Доступ к профессиональным 3D-моделям и текстурам всей продукции для рендера в вашем проекте.'
		},
		{
			icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/>`,
			title: 'Обучение и шоурум',
			text: 'Приглашаем на закрытые презентации новых коллекций и профессиональные экскурсии по нашему производству.'
		}
	];

	const benefits = $derived(
		Array.isArray(data?.benefits) && (data.benefits as unknown[]).length > 0
			? (data.benefits as typeof defaultBenefits)
			: defaultBenefits
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
				fieldKey="DesignersBenefits.label"
				label="Лейбл"
				value={String(data?.label ?? 'Что вы получаете')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="DesignersBenefits.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Преимущества партнёрства')}
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
			{#each benefits as b, i}
				<div
					class="group border border-border-light bg-white p-8 opacity-0 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated"
					class:animate-fade-up={visible}
					style="animation-delay: {0.1 + i * 0.08}s"
				>
					<div class="mb-5 flex h-10 w-10 items-center justify-center border border-secondary/20 text-secondary transition-colors duration-300 group-hover:border-secondary group-hover:bg-secondary group-hover:text-white">
						<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
							{@html b.icon}
						</svg>
					</div>
					<h3
						class="text-lg font-medium text-primary transition-colors duration-300 group-hover:text-secondary"
						style="font-family: var(--font-heading);"
					>
						{b.title}
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-secondary">{b.text}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
