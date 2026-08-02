<script lang="ts">
	// Артикул: 1.4.5.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'ActionsCTA', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-linear-to-br from-slate-50 via-white to-amber-50/40 py-24 sm:py-32">
	<!-- Светящиеся круги (в стиле Hero страницы actions) -->
	<div class="absolute -left-32 top-1/4 size-80 rounded-full bg-red-100/40 blur-3xl"></div>
	<div class="absolute -right-32 bottom-1/4 size-96 rounded-full bg-amber-100/40 blur-3xl"></div>
	<!-- Тонкая декоративная сетка -->
	<div
		class="absolute inset-0 opacity-[0.04]"
		style="background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px); background-size: 44px 44px;"
	></div>

	<div class="relative mx-auto max-w-4xl px-6 lg:px-8">
		<!-- CTA-карточка с глубоким теневым обрамлением -->
		<div
			class="relative overflow-hidden rounded-3xl bg-white/80 px-6 py-14 shadow-2xl shadow-slate-900/5 ring-1 ring-slate-900/5 backdrop-blur-sm sm:px-16 sm:py-20"
		>
			<!-- Внутренний акцентный градиент сверху -->
			<div
				class="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-red-500 via-rose-500 to-amber-500"
			></div>

			<div class="mx-auto max-w-2xl text-center">
				<!-- Бейдж-надголовок -->
				<span
					class="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-semibold text-red-600 ring-1 ring-red-100"
				>
					<span class="relative flex size-2">
						<span
							class="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75"
						></span>
						<span class="relative inline-flex size-2 rounded-full bg-red-500"></span>
					</span>
					Акции и спецпредложения
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
							class="text-pretty text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ActionsCTA.subtitle"
					label="Подзаголовок"
					value={String(data?.subtitle ??
						'Свяжитесь с нами и мы расскажем обо всех актуальных предложениях')}
					{isEditable}
					multiline
					onSave={(v) => saveField('subtitle', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="mx-auto mt-6 max-w-xl text-lg/8 text-slate-600">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<EditableField
						fieldKey="ActionsCTA.buttonText"
						label="Текст кнопки"
						value={String(data?.buttonText ?? 'Связаться с нами')}
						{isEditable}
						onSave={(v) => saveField('buttonText', v)}
						class="inline-block"
					>
						{#snippet children(displayValue)}
							<a
								href="/contact"
								class="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-red-500 to-rose-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition duration-300 hover:-translate-y-0.5 hover:from-red-600 hover:to-rose-600 hover:shadow-xl hover:shadow-red-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
							>
								{displayValue}
								<svg
									class="size-4 transition-transform duration-300 group-hover:translate-x-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									stroke-width="2"
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
						class="inline-block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<a
									href="tel:{displayValue}"
									class="group inline-flex items-center gap-3 rounded-xl bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-md ring-1 ring-slate-200 transition duration-300 hover:-translate-y-0.5 hover:text-red-600 hover:shadow-lg hover:ring-red-200"
								>
									<span
										class="flex size-10 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-red-100 transition-colors duration-300 group-hover:bg-red-500 group-hover:text-white"
									>
										<svg
											class="size-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
											/>
										</svg>
									</span>
									<span class="flex flex-col items-start leading-tight">
										<span class="text-xs font-normal text-slate-400">Или позвоните нам</span>
										<span class="text-base font-semibold tracking-tight">{displayValue}</span>
									</span>
								</a>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>

		<!-- Тонкая подсказка под карточкой -->
		<p class="mt-6 text-center text-sm text-slate-400">
			Ответим в течение дня · Консультация бесплатна
		</p>
	</div>
</section>
