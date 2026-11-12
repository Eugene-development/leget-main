<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.1.3.1 — см. docs/architecture/component-articles-map.md
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

	async function saveField(field: string, value: unknown) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'Advantages', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	const defaultAdvantages = [
		{
			number: '01',
			title: 'Собственное производство',
			description:
				'Полный цикл производства на современном оборудовании ведущих европейских брендов'
		},
		{
			number: '02',
			title: 'Премиальные материалы',
			description: 'Только сертифицированные материалы и комплектующие от мировых лидеров отрасли'
		},
		{
			number: '03',
			title: 'Индивидуальный дизайн',
			description: 'Каждый проект создаётся по вашим размерам с учётом всех пожеланий клиента'
		},
		{
			number: '04',
			title: 'Гарантия качества',
			description:
				'Многоступенчатый фабричный контроль качества и гарантия до 5 лет на всю продукцию'
		},
		{
			number: '05',
			title: 'Сопровождение проекта',
			description:
				'Помогаем с выбором материалов и сопровождаем проект от замера до установки мебели'
		}
	];

	const defaultStats = [
		{ value: '25+', label: 'лет опыта' },
		{ value: '50 000+', label: 'реализованных проектов' },
		{ value: '180+', label: 'всего салонов' },
		{ value: '400+', label: 'дизайнеров' },
		{ value: '30+', label: 'материалов для мебели' },
		{ value: '200+', label: 'оттенков фасадов' }
	];

	const advantages = $derived.by(() => {
		if (!Array.isArray(data?.advantages)) return defaultAdvantages;
		const items = data.advantages as typeof defaultAdvantages;
		// Добавляем новый пункт и к ранее сохранённым спискам из четырёх преимуществ.
		return items.length === 4 ? [...items, defaultAdvantages[4]] : items;
	});

	const stats = $derived(
		Array.isArray(data?.stats) ? (data.stats as { value: string; label: string }[]) : defaultStats
	);

	async function saveAdvantage(
		index: number,
		field: 'number' | 'title' | 'description',
		value: string
	) {
		await saveField(
			'advantages',
			advantages.map((item, i) => (i === index ? { ...item, [field]: value } : item))
		);
	}

	async function saveStat(index: number, field: 'value' | 'label', value: string) {
		await saveField(
			'stats',
			stats.map((item, i) => (i === index ? { ...item, [field]: value } : item))
		);
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.25, rootMargin: '0px 0px -100px 0px' }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative overflow-hidden py-section-sm lg:py-section" bind:this={sectionEl}>
	<!-- Subtle Background Pattern -->
	<div
		class="absolute inset-0 opacity-[0.03]"
		style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232c2c2c\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"
	></div>

	<div class="relative p2-container mx-auto">
		<div class="grid gap-16 lg:grid-cols-2 lg:gap-20">
			<!-- Left: Header + Stats -->
			<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
				<EditableField
					fieldKey="HomeAdvantages.label"
					label="Лейбл"
					value={editableText(data?.label, 'Преимущества')}
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
					fieldKey="HomeAdvantages.heading"
					label="Заголовок"
					value={editableText(data?.heading, 'Почему выбирают нас')}
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

				<EditableField
					fieldKey="HomeAdvantages.description"
					label="Описание"
					value={String(data?.description ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="mt-6 max-w-md text-base leading-relaxed text-secondary">
							<RichText value={displayValue} />
						</p>
					{/snippet}
				</EditableField>

				<!-- Stats -->
				<div class="mt-12 grid grid-cols-2 gap-8">
					{#each stats as stat, i}
						<div
							class="opacity-0"
							class:animate-fade-up={visible}
							style="animation-delay: {0.3 + i * 0.1}s"
						>
							<EditableField
								fieldKey={`HomeAdvantages.stats.${i}.value`}
								label={`Статистика ${i + 1}: значение`}
								value={stat.value}
								{isEditable}
								onSave={(v) => saveStat(i, 'value', v)}
							>
								{#snippet children(displayValue)}
									<div
										class="text-3xl font-light text-secondary lg:text-4xl"
										style="font-family: var(--font-heading);"
									>
										<RichText value={displayValue} />
									</div>
								{/snippet}
							</EditableField>
							<EditableField
								fieldKey={`HomeAdvantages.stats.${i}.label`}
								label={`Статистика ${i + 1}: подпись`}
								value={stat.label}
								{isEditable}
								onSave={(v) => saveStat(i, 'label', v)}
							>
								{#snippet children(displayValue)}
									<div class="mt-1 text-sm text-muted"><RichText value={displayValue} /></div>
								{/snippet}
							</EditableField>
						</div>
					{/each}
				</div>
			</div>

			<!-- Right: Advantages List -->
			<div class="flex flex-col gap-0">
				{#each advantages as adv, i}
					<div
						class="group flex gap-6 rounded-sm border-b border-border-light py-8 opacity-0 transition-colors duration-300 first:border-t hover:bg-surface-warm/50 lg:px-6 xl:px-1"
						class:animate-slide-right={visible}
						style="animation-delay: {0.2 + i * 0.15}s"
					>
						<EditableField
							fieldKey={`HomeAdvantages.advantages.${i}.number`}
							label={`Преимущество ${i + 1}: номер`}
							value={adv.number}
							{isEditable}
							onSave={(v) => saveAdvantage(i, 'number', v)}
							class="mt-0.5 shrink-0"
						>
							{#snippet children(displayValue)}
								<span class="text-xs font-medium text-accent"
									><RichText value={displayValue} /></span
								>
							{/snippet}
						</EditableField>
						<div>
							<EditableField
								fieldKey={`HomeAdvantages.advantages.${i}.title`}
								label={`Преимущество ${i + 1}: заголовок`}
								value={adv.title}
								{isEditable}
								onSave={(v) => saveAdvantage(i, 'title', v)}
							>
								{#snippet children(displayValue)}
									<h3
										class="text-lg text-primary transition-colors duration-300 group-hover:text-secondary"
									>
										<RichText value={displayValue} />
									</h3>
								{/snippet}
							</EditableField>
							<EditableField
								fieldKey={`HomeAdvantages.advantages.${i}.description`}
								label={`Преимущество ${i + 1}: описание`}
								value={adv.description}
								{isEditable}
								multiline
								onSave={(v) => saveAdvantage(i, 'description', v)}
							>
								{#snippet children(displayValue)}
									<p class="mt-2 text-sm leading-relaxed text-secondary">
										<RichText value={displayValue} />
									</p>
								{/snippet}
							</EditableField>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>
