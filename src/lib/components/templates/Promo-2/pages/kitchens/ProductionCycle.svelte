<script lang="ts">
	import { editableText } from '$lib/utils/editable-text';
	// Артикул: 2.9.3.1 — см. docs/architecture/component-articles-map.md
	import ImageFallback from '$lib/components/ImageFallback.svelte';
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

<section bind:this={sectionEl} class="relative py-section-sm lg:py-section">
	<div class="p2-container mx-auto">
		<!-- Section Header -->
		<div
			class="mb-16 text-center opacity-0 transition-all duration-700"
			class:animate-fade-up={visible}
		>
			<EditableField
				fieldKey="ProductionCycle.label"
				label="Лейбл"
				value={editableText(data?.label, 'Этапы')}
				{isEditable}
				onSave={(v) => saveField('label', v)}
			>
				{#snippet children(displayValue)}
					<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">
						<RichText value={displayValue} />
					</div>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ProductionCycle.heading"
				label="Заголовок"
				value={editableText(data?.heading, 'Производственный цикл')}
				{isEditable}
				onSave={(v) => saveField('heading', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mb-6 text-3xl text-primary uppercase lg:text-4xl"
						style="font-family: var(--font-heading);"
					>
						<RichText value={displayValue} />
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ProductionCycle.description"
				label="Описание"
				value={editableText(
					data?.description,
					'Отточенный годами процесс создания премиальной мебели.'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('description', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto max-w-2xl text-lg leading-relaxed font-light text-secondary">
						<RichText value={displayValue} />
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
					<EditableField
						fieldKey="ProductionCycle.designLabel"
						label="Проектирование: подпись"
						value={editableText(data?.designLabel, '01. Проектирование')}
						{isEditable}
						onSave={(v) => saveField('designLabel', v)}
					>
						{#snippet children(displayValue)}
							<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">
								<RichText value={displayValue} />
							</div>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.designHeading"
						label="Проектирование: заголовок"
						value={editableText(data?.designHeading, 'Проектирование технологами')}
						{isEditable}
						onSave={(v) => saveField('designHeading', v)}
					>
						{#snippet children(displayValue)}
							<h3
								class="mb-6 text-3xl text-primary lg:text-4xl"
								style="font-family: var(--font-heading);"
							>
								<RichText value={displayValue} />
							</h3>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.designDescription"
						label="Проектирование: описание"
						value={editableText(
							data?.designDescription,
							'Дизайн начинается задолго до производства. Наши инженеры-технологи детально прорабатывают проект, учитывая миллиметровые зазоры, нагрузку на фурнитуру, особенности материалов и эргономику пространства.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('designDescription', v)}
					>
						{#snippet children(displayValue)}
							<p class="mb-6 leading-relaxed text-secondary">
								<RichText value={displayValue} />
							</p>
						{/snippet}
					</EditableField>
					<div class="h-px w-24 bg-accent"></div>
				</div>
				<div class="order-1 lg:order-2 lg:w-1/2">
					<div class="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-elevated">
						<ImageFallback
							imagePath={['designImage']}
							loading="lazy"
							src={String(
								data?.designImage ??
									'https://storage.yandexcloud.net/zovtop/foto/technoljergbmeogkmbktgg.jpg'
							)}
							alt="Проектирование кухни технологами"
							class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
						/>
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
						<ImageFallback
							imagePath={['productionImage']}
							loading="lazy"
							src={String(
								data?.productionImage ??
									'https://storage.yandexcloud.net/zovtop/foto/proizvodlkfegbmrgbm.jpg'
							)}
							alt="Производственный процесс"
							class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
						/>
					</div>
				</div>
				<div class="lg:w-1/2">
					<EditableField
						fieldKey="ProductionCycle.productionLabel"
						label="Производство: подпись"
						value={editableText(data?.productionLabel, '02. Производство')}
						{isEditable}
						onSave={(v) => saveField('productionLabel', v)}
					>
						{#snippet children(displayValue)}
							<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">
								<RichText value={displayValue} />
							</div>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.productionHeading"
						label="Производство: заголовок"
						value={editableText(data?.productionHeading, 'Работа в наших цехах')}
						{isEditable}
						onSave={(v) => saveField('productionHeading', v)}
					>
						{#snippet children(displayValue)}
							<h3
								class="mb-6 text-3xl text-primary lg:text-4xl"
								style="font-family: var(--font-heading);"
							>
								<RichText value={displayValue} />
							</h3>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.productionDescription"
						label="Производство: описание"
						value={editableText(
							data?.productionDescription,
							'Производство — это симбиоз передовых роботизированных линий и ручного мастерства. Мы используем европейское оборудование сверхвысокой точности для распила и кромления, что гарантирует идеальную геометрию фасадов.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('productionDescription', v)}
					>
						{#snippet children(displayValue)}
							<p class="mb-6 leading-relaxed text-secondary">
								<RichText value={displayValue} />
							</p>
						{/snippet}
					</EditableField>
					<div class="h-px w-24 bg-accent"></div>
				</div>
			</div>

			<!-- Steps 3 & 4: Упаковка & Доставка -->
			<div
				class="relative grid grid-cols-1 gap-16 py-12 opacity-0 transition-all duration-700 md:grid-cols-2"
				class:animate-fade-up={visible}
				style="animation-delay: 0.3s"
			>
				<div
					class="absolute inset-0 -z-10 -mx-6 rounded-3xl bg-surface-warm px-6 lg:-mx-12 lg:px-12"
				></div>

				<div class="p-8 lg:p-12">
					<EditableField
						fieldKey="ProductionCycle.packagingLabel"
						label="Упаковка: подпись"
						value={editableText(data?.packagingLabel, '03. Логистика')}
						{isEditable}
						onSave={(v) => saveField('packagingLabel', v)}
					>
						{#snippet children(displayValue)}
							<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">
								<RichText value={displayValue} />
							</div>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.packagingHeading"
						label="Упаковка: заголовок"
						value={editableText(data?.packagingHeading, 'Бережная упаковка')}
						{isEditable}
						onSave={(v) => saveField('packagingHeading', v)}
					>
						{#snippet children(displayValue)}
							<h3
								class="mb-6 text-2xl text-primary lg:text-3xl"
								style="font-family: var(--font-heading);"
							>
								<RichText value={displayValue} />
							</h3>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.packagingDescription"
						label="Упаковка: описание"
						value={editableText(
							data?.packagingDescription,
							'Каждая деталь проходит многоуровневый контроль качества. Затем элементы бережно упаковываются в плотный многослойный картон с защитными профилями.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('packagingDescription', v)}
					>
						{#snippet children(displayValue)}
							<p class="leading-relaxed text-secondary">
								<RichText value={displayValue} />
							</p>
						{/snippet}
					</EditableField>
				</div>

				<div class="p-8 lg:p-12">
					<EditableField
						fieldKey="ProductionCycle.deliveryLabel"
						label="Доставка: подпись"
						value={editableText(data?.deliveryLabel, '04. Транспортировка')}
						{isEditable}
						onSave={(v) => saveField('deliveryLabel', v)}
					>
						{#snippet children(displayValue)}
							<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">
								<RichText value={displayValue} />
							</div>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.deliveryHeading"
						label="Доставка: заголовок"
						value={editableText(data?.deliveryHeading, 'Безопасная доставка')}
						{isEditable}
						onSave={(v) => saveField('deliveryHeading', v)}
					>
						{#snippet children(displayValue)}
							<h3
								class="mb-6 text-2xl text-primary lg:text-3xl"
								style="font-family: var(--font-heading);"
							>
								<RichText value={displayValue} />
							</h3>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.deliveryDescription"
						label="Доставка: описание"
						value={editableText(
							data?.deliveryDescription,
							'Доставка осуществляется собственным автопарком, оборудованным специальными пневматическими креплениями для перевозки элитной мебели.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('deliveryDescription', v)}
					>
						{#snippet children(displayValue)}
							<p class="leading-relaxed text-secondary">
								<RichText value={displayValue} />
							</p>
						{/snippet}
					</EditableField>
				</div>
			</div>

			<!-- Step 5: Сборка -->
			<div
				class="flex flex-col items-center gap-16 opacity-0 transition-all duration-700 lg:flex-row"
				class:animate-slide-right={visible}
				style="animation-delay: 0.4s"
			>
				<div class="order-2 lg:order-1 lg:w-1/2">
					<EditableField
						fieldKey="ProductionCycle.assemblyLabel"
						label="Сборка: подпись"
						value={editableText(data?.assemblyLabel, '05. Финал')}
						{isEditable}
						onSave={(v) => saveField('assemblyLabel', v)}
					>
						{#snippet children(displayValue)}
							<div class="mb-4 text-sm font-medium tracking-[0.2em] text-accent uppercase">
								<RichText value={displayValue} />
							</div>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.assemblyHeading"
						label="Сборка: заголовок"
						value={editableText(data?.assemblyHeading, 'Профессиональная сборка')}
						{isEditable}
						onSave={(v) => saveField('assemblyHeading', v)}
					>
						{#snippet children(displayValue)}
							<h3
								class="mb-6 text-3xl text-primary lg:text-4xl"
								style="font-family: var(--font-heading);"
							>
								<RichText value={displayValue} />
							</h3>
						{/snippet}
					</EditableField>
					<EditableField
						fieldKey="ProductionCycle.assemblyDescription"
						label="Сборка: описание"
						value={editableText(
							data?.assemblyDescription,
							'Сборкой занимаются собственные бригады сертифицированных специалистов. Они монтируют корпуса, выставляют идеальные зазоры фасадов, подключают встраиваемую технику и интегрируют освещение.'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('assemblyDescription', v)}
					>
						{#snippet children(displayValue)}
							<p class="mb-6 leading-relaxed text-secondary">
								<RichText value={displayValue} />
							</p>
						{/snippet}
					</EditableField>
					<div class="h-px w-24 bg-accent"></div>
				</div>
				<div class="order-1 lg:order-2 lg:w-1/2">
					<div class="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-elevated">
						<ImageFallback
							imagePath={['assemblyImage']}
							loading="lazy"
							src={String(
								data?.assemblyImage ||
									'https://storage.yandexcloud.net/leget-main/templates/promo-2/kitchen-assembly-2-9-3-1-20261109.webp'
							)}
							alt="Сборка кухни"
							class="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
