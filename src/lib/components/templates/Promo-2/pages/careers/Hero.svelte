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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}

	const defaultStats = [
		{ value: '700+', label: 'сотрудников' },
		{ value: '4', label: 'открытых вакансии' },
		{ value: '25 лет', label: 'на рынке' },
		{ value: '30%', label: 'скидка для сотрудников' }
	];

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
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

<section bind:this={sectionEl} class="relative overflow-hidden bg-primary py-28 lg:py-36">
	<!-- Decorations -->
	<div class="absolute top-0 left-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rotate-12 border border-white/5"></div>
	<div class="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 border border-white/5"></div>
	<div class="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-secondary to-transparent opacity-30"></div>

	<div class="relative mx-auto max-w-screen-xl px-6 xl:px-1">
		<div class="max-w-2xl">
			<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.2s">
				<EditableField
					fieldKey="Hero.label"
					label="Лейбл"
					value={String(data?.label ?? 'Карьера')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2 text-[11px] tracking-[0.3em] text-accent uppercase backdrop-blur-sm">
							<span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
							{displayValue}
						</span>
					{/snippet}
				</EditableField>
			</div>

			<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.4s">
				<EditableField
					fieldKey="Hero.title"
					label="Заголовок"
					value={String(data?.title ?? 'Строй карьеру вместе с нами')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h1
							class="mt-6 text-5xl leading-[1.1] font-light text-white md:text-6xl lg:text-7xl"
							style="font-family: var(--font-heading);"
						>
							{displayValue}
						</h1>
					{/snippet}
				</EditableField>
			</div>

			<div class="opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.6s">
				<EditableField
					fieldKey="Hero.description"
					label="Описание"
					value={String(data?.description ?? 'Фабрика — это более 700 специалистов, которые создают премиальную мебель. Присоединяйтесь к команде профессионалов.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mt-7 max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
							{displayValue}
						</p>
					{/snippet}
				</EditableField>
			</div>

			<div class="mt-10 flex flex-wrap items-center gap-4 opacity-0" class:animate-fade-up={visible} style="animation-delay: 0.8s">
				<a
					href="#vacancies"
					class="group inline-flex items-center gap-3 rounded-sm border border-accent bg-accent px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-500 hover:border-accent hover:bg-transparent hover:text-accent"
				>
					Смотреть вакансии
					<svg class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
						<path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
					</svg>
				</a>
				<a
					href="#open-resume"
					class="inline-flex items-center gap-2 rounded-sm border border-white/20 px-8 py-4 text-xs tracking-[0.15em] text-white/80 uppercase transition-all duration-500 hover:border-white/50 hover:text-white"
				>
					Отправить резюме
				</a>
			</div>
		</div>

		<!-- Stats -->
		<div
			class="mt-20 grid grid-cols-2 gap-px border border-white/10 opacity-0 md:grid-cols-4"
			class:animate-fade-up={visible}
			style="animation-delay: 1s"
		>
			{#each stats as stat}
				<div class="flex flex-col gap-1.5 bg-white/5 px-6 py-5 backdrop-blur-sm xl:px-8">
					<span class="text-3xl font-light text-accent-light" style="font-family: var(--font-heading);">{stat.value}</span>
					<span class="text-xs tracking-wide text-white/40">{stat.label}</span>
				</div>
			{/each}
		</div>
	</div>
</section>
