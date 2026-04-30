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
		await saveComponentData(editContext, 'Advantages', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	const defaultStats = [
		{ value: '500+', label: 'выполненных проектов' },
		{ value: '14', label: 'дней — средний срок' },
		{ value: '5', label: 'лет гарантии' },
		{ value: '0%', label: 'переплата по рассрочке' }
	];

	const defaultFeatures = [
		'Собственное производство полного цикла',
		'Европейская фурнитура: Hettich, Blum, Egger',
		'Бесплатный 3D дизайн-проект',
		'Доставка и профессиональный монтаж',
		'Работаем без предоплаты',
		'Фиксируем цену в договоре'
	];

	const stats = $derived(
		Array.isArray(data?.stats) && (data.stats as unknown[]).length > 0
			? (data.stats as typeof defaultStats)
			: defaultStats
	);

	const features = $derived(
		Array.isArray(data?.features) && (data.features as unknown[]).length > 0
			? (data.features as string[])
			: defaultFeatures
	);

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => { entries.forEach((e) => { if (e.isIntersecting) visible = true; }); },
			{ threshold: 0.2, rootMargin: '0px 0px -80px 0px' }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative overflow-hidden bg-surface-warm py-section-sm lg:py-section" bind:this={sectionEl}>
	<div class="mx-auto max-w-7xl px-6 xl:px-1">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-20">

			<!-- Left: stats -->
			<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
				<EditableField
					fieldKey="Advantages.label"
					label="Лейбл"
					value={String(data?.label ?? 'Наши преимущества')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Advantages.title"
					label="Заголовок"
					value={String(data?.title ?? 'Цифры говорят за нас')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
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

				<!-- Stats grid -->
				<div class="mt-12 grid grid-cols-2 gap-8">
					{#each stats as stat, i}
						<div
							class="opacity-0"
							class:animate-fade-up={visible}
							style="animation-delay: {0.3 + i * 0.1}s"
						>
							<div
								class="text-3xl font-light text-secondary lg:text-4xl"
								style="font-family: var(--font-heading);"
							>
								{stat.value}
							</div>
							<div class="mt-1 text-sm text-muted">{stat.label}</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: features list -->
			<div
				class="opacity-0 transition-all duration-700"
				class:animate-slide-right={visible}
				style="animation-delay: 0.2s"
			>
				<p class="mb-8 text-[11px] tracking-[0.3em] text-secondary uppercase">Что вы получаете</p>
				<div class="flex flex-col gap-0">
					{#each features as feature, i}
						<div
							class="flex items-center gap-4 border-b border-border-light py-5 first:border-t opacity-0"
							class:animate-fade-up={visible}
							style="animation-delay: {0.3 + i * 0.08}s"
						>
							<div class="h-px w-6 shrink-0 bg-accent"></div>
							<span class="text-sm leading-relaxed text-primary">{feature}</span>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</section>
