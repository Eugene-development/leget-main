<script lang="ts">
	// Артикул: 2.2.6.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'Principles', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	const defaultPrinciples = [
		{
			title: 'Открытость',
			text: 'Салоны наших дилеров работают ежедневно и всегда рады дать полную консультацию по всем вопросам'
		},
		{
			title: 'Лояльность',
			text: 'Мы всегда идём навстречу нашим клиентам в любой ситуации и дорожим долгим сотрудничеством'
		},
		{
			title: 'Поддержка',
			text: 'В сложной ситуации, при доставке или в процессе сборки, специалисты решают все вопросы в кратчайшие сроки'
		},
		{
			title: 'Качество',
			text: 'Система контроля качества и надёжная упаковка гарантирует целостность заказа и соответствие заявленному качеству'
		},
		{
			title: 'Гибкость',
			text: 'У нас гибкая политика в отношении цен, условий доставки и дат установки заказанной мебели для вашего комфорта'
		},
		{
			title: 'Инновации',
			text: 'Наша фабрика внедряет современные решения и передовые технологии в производство мебели'
		}
	];

	const principles = $derived(
		Array.isArray(data?.principles) && (data.principles as unknown[]).length > 0
			? (data.principles as typeof defaultPrinciples)
			: defaultPrinciples
	);

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

<section
	class="relative -mt-12 bg-surface-warm pt-28 pb-section-sm lg:-mt-20 lg:pt-40 lg:pb-section"
	bind:this={sectionEl}
>
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<!-- Header -->
		<div class="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
			<div
				class="opacity-0 transition-all duration-700"
				class:animate-fade-up={visible}
			>
				<EditableField
					fieldKey="Principles.label"
					label="Лейбл"
					value={String(data?.label ?? 'Наши ценности')}
					{isEditable}
					onSave={(v) => saveField('label', v)}
				>
					{#snippet children(displayValue)}
						<span class="text-[11px] tracking-[0.3em] text-secondary uppercase">{displayValue}</span>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Principles.heading"
					label="Заголовок"
					value={String(data?.heading ?? 'Принципы компании')}
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

				<p class="mt-4 max-w-xl text-base leading-relaxed text-secondary">
					Компания основывается на принципах индивидуального подхода, высокого качества материалов и
					соблюдения сроков.
				</p>
			</div>
		</div>

		<!-- Principles Grid -->
		<div class="grid gap-6 md:grid-cols-3">
			{#each principles as principle, i}
				<div
					class="group border border-border-light bg-white p-8 shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-elevated lg:p-10"
					class:animate-fade-up={visible}
					style="animation-delay: {0.2 + i * 0.1}s; opacity: 0;"
				>
					<span class="text-xs font-medium text-accent">0{i + 1}</span>
					<h3
						class="mt-4 text-xl font-medium text-primary transition-colors duration-300 group-hover:text-secondary lg:text-2xl"
						style="font-family: var(--font-heading);"
					>
						{principle.title}
					</h3>
					<p class="mt-3 text-sm leading-relaxed text-secondary">
						{principle.text}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
