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
		await saveComponentData(editContext, 'ProductionCycle', updated);
		data = updated;
	}

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

<section bind:this={sectionEl} class="relative px-6 py-section-sm xl:px-1 lg:py-section">
	<div class="mx-auto max-w-screen-xl">
		<!-- Section Header -->
		<div class="mb-16 text-center opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="ProductionCycle.label"
				label="Лейбл"
				value={String(data?.label ?? 'Этапы')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">{displayValue}</div>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ProductionCycle.heading"
				label="Заголовок"
				value={String(data?.heading ?? 'Производственный цикл')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mb-6 text-3xl font-light tracking-wide text-primary uppercase lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ProductionCycle.description"
				label="Описание"
				value={String(data?.description ?? 'Отточенный годами процесс создания премиальной мебели.')}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-lg leading-relaxed font-light text-secondary">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="flex flex-col gap-32">
			<!-- Step 1: Проектирование -->
			<div
				class="flex flex-col items-center gap-16 opacity-0 transition-all duration-700 lg:flex-row"
				class:animate-slide-right={visible}
				style="animation-delay: 0.1s"
			>
				<div class="order-2 lg:order-1 lg:w-1/2">
					<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">01. Проектирование</div>
					<h3
						class="mb-6 text-3xl font-light tracking-wide text-primary lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						Проектирование технологами
					</h3>
					<p class="mb-6 leading-relaxed text-secondary">
						Дизайн начинается задолго до производства. Наши инженеры-технологи детально прорабатывают проект, учитывая миллиметровые зазоры, нагрузку на фурнитуру, особенности материалов и эргономику пространства.
					</p>
					<div class="h-px w-24 bg-accent"></div>
				</div>
				<div class="order-1 lg:order-2 lg:w-1/2">
					<div class="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-elevated">
						<img loading="lazy"
							src="https://storage.yandexcloud.net/zovtop/foto/technoljergbmeogkmbktgg.jpg"
							alt="Проектирование кухни технологами"
							class="h-full w-full object-cover transition-transform duration-700 hover:scale-105">
					</div>
				</div>
			</div>

			<!-- Step 2: Производство -->
			<div
				class="flex flex-col items-center gap-16 opacity-0 transition-all duration-700 lg:flex-row"
				class:animate-slide-right={visible}
				style="animation-delay: 0.2s"
			>
				<div class="lg:w-1/2">
					<div class="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-elevated">
						<img loading="lazy"
							src="https://storage.yandexcloud.net/zovtop/foto/proizvodlkfegbmrgbm.jpg"
							alt="Производственный процесс"
							class="h-full w-full object-cover transition-transform duration-700 hover:scale-105">
					</div>
				</div>
				<div class="lg:w-1/2">
					<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">02. Производство</div>
					<h3
						class="mb-6 text-3xl font-light tracking-wide text-primary lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						Работа в наших цехах
					</h3>
					<p class="mb-6 leading-relaxed text-secondary">
						Производство — это симбиоз передовых роботизированных линий и ручного мастерства. Мы используем европейское оборудование сверхвысокой точности для распила и кромления, что гарантирует идеальную геометрию фасадов.
					</p>
					<div class="h-px w-24 bg-accent"></div>
				</div>
			</div>

			<!-- Steps 3 & 4: Упаковка & Доставка -->
			<div
				class="relative grid grid-cols-1 gap-16 py-12 opacity-0 transition-all duration-700 md:grid-cols-2"
				class:animate-fade-up={visible}
				style="animation-delay: 0.3s"
			>
				<div class="absolute inset-0 -z-10 -mx-6 rounded-3xl bg-surface-warm px-6 lg:-mx-12 lg:px-12"></div>

				<div class="p-8 lg:p-12">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft">
						<svg class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
						</svg>
					</div>
					<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">03. Логистика</div>
					<h3
						class="mb-6 text-2xl font-light tracking-wide text-primary lg:text-3xl"
						style="font-family: var(--font-heading);"
					>
						Бережная упаковка
					</h3>
					<p class="leading-relaxed text-secondary">
						Каждая деталь проходит многоуровневый контроль качества. Затем элементы бережно упаковываются в плотный многослойный картон с защитными профилями.
					</p>
				</div>

				<div class="p-8 lg:p-12">
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-soft">
						<svg class="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
						</svg>
					</div>
					<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">04. Транспортировка</div>
					<h3
						class="mb-6 text-2xl font-light tracking-wide text-primary lg:text-3xl"
						style="font-family: var(--font-heading);"
					>
						Безопасная доставка
					</h3>
					<p class="leading-relaxed text-secondary">
						Доставка осуществляется собственным автопарком, оборудованным специальными пневматическими креплениями для перевозки элитной мебели.
					</p>
				</div>
			</div>

			<!-- Step 5: Сборка -->
			<div
				class="flex flex-col items-center gap-16 opacity-0 transition-all duration-700 lg:flex-row"
				class:animate-slide-right={visible}
				style="animation-delay: 0.4s"
			>
				<div class="order-2 lg:order-1 lg:w-1/2">
					<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">05. Финал</div>
					<h3
						class="mb-6 text-3xl font-light tracking-wide text-primary lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						Профессиональная сборка
					</h3>
					<p class="mb-6 leading-relaxed text-secondary">
						Сборкой занимаются собственные бригады сертифицированных специалистов. Они монтируют корпуса, выставляют идеальные зазоры фасадов, подключают встраиваемую технику и интегрируют освещение.
					</p>
					<div class="h-px w-24 bg-accent"></div>
				</div>
				<div class="order-1 lg:order-2 lg:w-1/2">
					<div class="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-elevated">
						<img loading="lazy"
							alt="Сборка кухни"
							class="h-full w-full object-cover transition-transform duration-700 hover:scale-105">
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
