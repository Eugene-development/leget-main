<script lang="ts">
	// Артикул: 1.4.5.1 — см. docs/architecture/component-articles-map.md
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

	const isLight = $derived(isLightBlock(data, 'light'));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ActionsCTA', updated);
		data = updated;
	}
</script>

<section
	class="p1-surface relative overflow-hidden py-section-sm sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<!-- Тёплая подложка — только в светлой теме: на ink она бы светила белым. -->
	{#if isLight}
		<div
			class="pointer-events-none absolute inset-0 bg-linear-to-br from-ink-50 via-on-accent to-cat-1-50/40"
			aria-hidden="true"
		></div>
	{/if}
	<!-- Светящиеся круги (в стиле Hero страницы actions) -->
	<div class="absolute top-1/4 -left-32 size-80 rounded-full bg-brand-100/40 blur-3xl"></div>
	<div class="absolute -right-32 bottom-1/4 size-96 rounded-full bg-cat-1-100/40 blur-3xl"></div>
	<!-- Тонкая декоративная сетка -->
	<div
		class="absolute inset-0 opacity-[0.04]"
		style="background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px); background-size: 44px 44px;"
	></div>

	<div class="relative mx-auto max-w-4xl px-6 lg:px-8">
		<!-- CTA-карточка с глубоким теневым обрамлением -->
		<div
			class="relative overflow-hidden rounded-3xl {isLight
				? 'bg-surface-raised/80'
				: 'bg-surface-raised/[0.06]'} px-6 py-14 shadow-2xl ring-1 shadow-ink-900/5 ring-ink-900/5 backdrop-blur-sm sm:px-16 sm:py-20"
		>
			<!-- Внутренний акцентный градиент сверху -->
			<div
				class="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-brand-500 via-cat-6-500 to-cat-1-500"
			></div>

			<div class="mx-auto max-w-2xl text-center">
				<!-- Бейдж-надголовок -->
				<span
					class="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-600 ring-1 ring-brand-100"
				>
					<span class="relative flex size-2">
						<span
							class="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-75"
						></span>
						<span class="relative inline-flex size-2 rounded-full bg-brand-500"></span>
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
						<h2 class="p1-title text-3xl text-pretty sm:text-4xl lg:text-5xl">
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
						<p class="p1-body mx-auto mt-6 max-w-xl text-lg/8">{displayValue}</p>
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
								class="group inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-brand-500 to-cat-6-500 px-8 py-4 text-sm font-semibold text-on-accent shadow-lg shadow-brand-500/30 transition duration-300 hover:-translate-y-0.5 hover:from-brand-600 hover:to-cat-6-600 hover:shadow-xl hover:shadow-brand-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
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
									class="group p1-body p1-card inline-flex items-center gap-3 rounded-xl px-6 py-4 text-sm font-semibold shadow-md ring-1 ring-ink-200 transition duration-300 hover:-translate-y-0.5 hover:text-brand-600 hover:shadow-lg hover:ring-brand-200"
								>
									<span
										class="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-500 ring-1 ring-brand-100 transition-colors duration-300 group-hover:bg-brand-500 group-hover:text-on-accent"
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
										<span class="p1-muted text-xs font-normal">Или позвоните нам</span>
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
		<p class="p1-muted mt-6 text-center text-sm">Ответим в течение дня · Консультация бесплатна</p>
	</div>
</section>
