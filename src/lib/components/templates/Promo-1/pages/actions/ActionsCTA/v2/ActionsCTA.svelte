<script lang="ts">
	// Артикул: 1.4.5.2 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'dark'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ActionsCTA', updated);
		data = updated;
	}
</script>

<!-- Премиальный тёмный CTA: split-layout, золотые акценты, стекло. -->
<section
	class="p1-surface relative overflow-hidden py-24 sm:py-32"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Глубокий фоновый градиент -->
	{#if !isLight}
		<div class="absolute inset-0 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950"></div>
	{/if}
	<!-- Тёплые световые пятна -->
	<div
		class="absolute -top-24 -left-24 size-96 rounded-full bg-amber-500/15 blur-[120px]"
		aria-hidden="true"
	></div>
	<div
		class="absolute -right-24 -bottom-24 size-112 rounded-full bg-rose-500/10 blur-[130px]"
		aria-hidden="true"
	></div>
	<!-- Тонкая декоративная сетка -->
	<div
		class="absolute inset-0 opacity-[0.05]"
		style="background-image: linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px); background-size: 56px 56px; mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%);"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-6xl px-6 lg:px-8">
		<!-- Стеклянная панель с градиентной рамкой -->
		<div
			class="relative rounded-4xl bg-linear-to-br from-amber-400/40 via-white/10 to-rose-500/30 p-px shadow-2xl shadow-black/40"
		>
			<div
				class="relative overflow-hidden rounded-[calc(2rem-1px)] {isLight
					? 'bg-white/80'
					: 'bg-slate-900/80'} px-6 py-14 backdrop-blur-xl sm:px-12 sm:py-16 lg:px-16"
			>
				<!-- Внутреннее золотое свечение сверху -->
				<div
					class="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-amber-300/70 to-transparent"
					aria-hidden="true"
				></div>
				<div
					class="absolute -top-16 left-1/2 h-32 w-2/3 -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl"
					aria-hidden="true"
				></div>

				<div class="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
					<!-- Левая колонка: текст -->
					<div class="text-center lg:text-left">
						<!-- Бейдж-надголовок -->
						<span
							class="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold {isLight
								? 'text-amber-600'
								: 'text-amber-300'} backdrop-blur-sm"
						>
							<svg class="size-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path
									d="M12 2l2.4 4.86L20 7.6l-3.9 3.8L17 17l-5-2.6L7 17l.9-5.6L4 7.6l5.6-.74L12 2z"
								/>
							</svg>
							Эксклюзивные предложения
						</span>

						<EditableField
							fieldKey="ActionsCTA.title"
							label="Заголовок"
							value={String(data?.title ?? 'Хотите узнать больше об акциях?')}
							{isEditable}
							onSave={(v) => saveField('title', v)}
							class="mt-6 block"
						>
							{#snippet children(displayValue)}
								<h2
									class="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl lg:text-5xl"
								>
									{displayValue}
								</h2>
							{/snippet}
						</EditableField>

						<EditableField
							fieldKey="ActionsCTA.subtitle"
							label="Подзаголовок"
							value={String(
								data?.subtitle ?? 'Свяжитесь с нами и мы расскажем обо всех актуальных предложениях'
							)}
							{isEditable}
							multiline
							onSave={(v) => saveField('subtitle', v)}
							class="mt-6 block"
						>
							{#snippet children(displayValue)}
								<p class="p1-body mx-auto mt-5 max-w-lg text-lg/8 lg:mx-0">{displayValue}</p>
							{/snippet}
						</EditableField>
					</div>

					<!-- Правая колонка: действия -->
					<div class="flex flex-col gap-4">
						<EditableField
							fieldKey="ActionsCTA.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Связаться с нами')}
							{isEditable}
							onSave={(v) => saveField('buttonText', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								<a
									href="/contact"
									class="group p1-title relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-amber-400 to-amber-500 px-8 py-5 text-base font-semibold shadow-lg shadow-amber-500/25 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
								>
									<!-- Блик при наведении -->
									<span
										class="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full"
										aria-hidden="true"
									></span>
									<span class="relative">{displayValue}</span>
									<svg
										class="relative size-5 transition-transform duration-300 group-hover:translate-x-1"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</a>
							{/snippet}
						</EditableField>

						<EditableField
							fieldKey="ActionsCTA.phone"
							label="Телефон"
							value={String(data?.phone ?? '')}
							{isEditable}
							onSave={(v) => saveField('phone', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<a
										href="tel:{displayValue}"
										class="group inline-flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-white backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-amber-400/40 hover:bg-white/10"
									>
										<span
											class="group-hover:p1-title flex size-11 items-center justify-center rounded-full bg-amber-400/15 {isLight
												? 'text-amber-600'
												: 'text-amber-300'} ring-1 ring-amber-400/20 transition-colors duration-300 group-hover:bg-amber-400"
										>
											<svg
												class="size-5"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
												stroke-width="2"
												aria-hidden="true"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
												/>
											</svg>
										</span>
										<span class="flex flex-col items-start leading-tight">
											<span class="p1-muted text-xs font-normal">Или позвоните нам</span>
											<span class="text-base font-semibold tracking-tight">{displayValue}</span>
										</span>
									</a>
								{/if}
							{/snippet}
						</EditableField>

						<!-- Тонкая подсказка -->
						<p
							class="p1-muted mt-1 flex items-center justify-center gap-2 text-sm lg:justify-start"
						>
							<span class="relative flex size-2">
								<span
									class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75"
								></span>
								<span class="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
							</span>
							Ответим в течение дня · Консультация бесплатна
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
