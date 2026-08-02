<script lang="ts">
	// Артикул: 1.9.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { revealOnScroll } from './theme';
	import './theme.css';

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
		await saveComponentData(editContext, 'GuaranteesCTA', updated);
		data = updated;
	}
</script>

<!--
	Финальный CTA страницы «Гарантии». Палитра прежняя (тёмный slate + emerald/cyan
	как на Hero). Без backdrop-blur на анимируемых узлах — при активном transform
	backdrop-filter сэмплит другую подложку и тон элемента скачет в конце анимации.
-->
<section class="relative isolate overflow-hidden bg-slate-950 py-24 sm:py-28 lg:py-32">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="gt-grid gt-grid--fade-center"></div>
		<div class="gt-glow absolute -top-32 left-1/2 size-144 -translate-x-1/2 bg-emerald-500/20"></div>
		<div class="gt-glow absolute -right-24 -bottom-40 size-112 bg-cyan-400/15"></div>
		<div
			class="absolute inset-x-0 top-0 mx-auto h-px w-2/3 bg-linear-to-r from-transparent via-emerald-400/60 to-transparent"
		></div>
		<div
			class="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
		></div>
	</div>

	<div class="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
		<!-- Паспарту с градиентной каймой в 1px -->
		<div
			use:revealOnScroll
			class="gt-reveal gt-card rounded-4xl bg-linear-to-br from-emerald-400/40 via-teal-300/25 to-cyan-400/40 p-px shadow-[0_50px_120px_-60px_rgba(16,185,129,0.55)]"
		>
			<div
				class="relative overflow-hidden rounded-[calc(var(--radius-4xl)-1px)] bg-slate-950/85 px-6 py-14 text-center sm:px-12 sm:py-16 lg:px-16"
			>
				<div
					class="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-white/6 to-transparent"
					aria-hidden="true"
				></div>

				<div class="relative">
					<div
						class="gt-item mx-auto flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-cyan-500 text-white ring-1 ring-white/20 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.9)]"
					>
						<svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
					</div>

					<EditableField
						fieldKey="GuaranteesCTA.eyebrow"
						label="Надзаголовок"
						value={String(data?.eyebrow ?? 'Гарантийная поддержка')}
						{isEditable}
						onSave={(v) => saveField('eyebrow', v)}
						class="gt-item gt-d1 mt-8 block"
					>
						{#snippet children(displayValue)}
							<p
								class="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-emerald-300 uppercase sm:text-xs"
							>
								<span class="h-px w-8 bg-emerald-400/80" aria-hidden="true"></span>
								{displayValue}
								<span class="h-px w-8 bg-emerald-400/80" aria-hidden="true"></span>
							</p>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="GuaranteesCTA.title"
						label="Заголовок"
						value={String(data?.title ?? 'Гарантийный случай?')}
						{isEditable}
						onSave={(v) => saveField('title', v)}
						class="gt-item gt-d2 mt-5 block"
					>
						{#snippet children(displayValue)}
							<h2
								class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-white sm:text-4xl lg:text-5xl"
							>
								{displayValue}
							</h2>
						{/snippet}
					</EditableField>

					<div class="gt-rule gt-d3 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
						<span class="h-px flex-1 bg-white/15"></span>
						<span class="size-1.5 rotate-45 border border-emerald-400/80"></span>
						<span class="h-px flex-1 bg-white/15"></span>
					</div>

					<EditableField
						fieldKey="GuaranteesCTA.subtitle"
						label="Подзаголовок"
						value={String(data?.subtitle ?? 'Заполните форму или позвоните нам — решим вопрос в кратчайшие сроки')}
						{isEditable}
						multiline
						onSave={(v) => saveField('subtitle', v)}
						class="gt-item gt-d3 mt-6 block"
					>
						{#snippet children(displayValue)}
							<p class="mx-auto max-w-xl text-sm/6 text-slate-300 sm:text-base/7">{displayValue}</p>
						{/snippet}
					</EditableField>

					<div class="gt-item gt-d4 mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
						<a
							href="/contact"
							class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-linear-to-r from-emerald-500 to-cyan-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(16,185,129,0.95)] transition duration-300 hover:from-emerald-400 hover:to-cyan-400 hover:shadow-[0_22px_55px_-16px_rgba(16,185,129,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300 motion-safe:hover:-translate-y-0.5"
						>
							<EditableField
								fieldKey="GuaranteesCTA.buttonText"
								label="Текст кнопки"
								value={String(data?.buttonText ?? 'Оставить заявку')}
								{isEditable}
								onSave={(v) => saveField('buttonText', v)}
								class="inline"
							>
								{#snippet children(displayValue)}
									{displayValue}
								{/snippet}
							</EditableField>
							<span class="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
						</a>

						<EditableField
							fieldKey="GuaranteesCTA.phone"
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
										class="group inline-flex items-center justify-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:border-white/30 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 motion-safe:hover:-translate-y-0.5"
									>
										<svg
											class="size-4.5 transition-transform duration-300 group-hover:-rotate-12"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="2"
											aria-hidden="true"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
										</svg>
										{displayValue}
									</a>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
