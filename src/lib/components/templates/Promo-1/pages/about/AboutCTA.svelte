<script lang="ts">
	// Артикул: 1.2.6.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'AboutCTA', updated);
		data = updated;
	}
</script>

<!--
	Финальный CTA страницы «О компании» — светлая секция, красный только акцентом
	(линия, иконка, кнопка). Заливать секцию красным нельзя: перед ней тёмный
	WhyUs, и плашка во всю ширину перебивала весь остальной контент страницы.
-->
<section class="relative isolate overflow-hidden bg-white py-24 sm:py-28 lg:py-32">
	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ab-rules"></div>
		<div class="ab-glow absolute -top-32 left-1/2 size-144 -translate-x-1/2 bg-red-500/8"></div>
	</div>

	<div class="relative mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
		<div
			use:revealOnScroll
			class="ab-reveal ab-card relative overflow-hidden rounded-4xl border border-slate-900/10 bg-white px-6 py-14 text-center shadow-[0_40px_100px_-60px_rgba(15,23,42,0.45)] sm:px-12 sm:py-16 lg:px-16"
		>
			<div
				class="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-red-500/70 to-transparent"
				aria-hidden="true"
			></div>
			<div
				class="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-red-500/5 blur-3xl"
				aria-hidden="true"
			></div>

			<div class="relative">
				<div
					class="ab-item mx-auto flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-red-500 to-red-600 text-white ring-1 ring-white/25 shadow-[0_20px_50px_-20px_rgba(220,38,38,0.85)]"
				>
					<svg class="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
					</svg>
				</div>

				<EditableField
					fieldKey="AboutCTA.eyebrow"
					label="Надзаголовок"
					value={String(data?.eyebrow ?? 'Давайте познакомимся')}
					{isEditable}
					onSave={(v) => saveField('eyebrow', v)}
					class="ab-item ab-d1 mt-8 block"
				>
					{#snippet children(displayValue)}
						<p
							class="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.28em] text-red-600 uppercase sm:text-xs"
						>
							<span class="h-px w-8 bg-red-500/60" aria-hidden="true"></span>
							{displayValue}
							<span class="h-px w-8 bg-red-500/60" aria-hidden="true"></span>
						</p>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="AboutCTA.title"
					label="Заголовок"
					value={String(data?.title ?? 'Ждём вас в качестве клиента')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="ab-item ab-d2 mt-5 block"
				>
					{#snippet children(displayValue)}
						<h2
							class="text-3xl leading-[1.08] font-semibold tracking-[-0.03em] text-pretty text-slate-900 sm:text-4xl lg:text-5xl"
						>
							{displayValue}
						</h2>
					{/snippet}
				</EditableField>

				<div class="ab-rule ab-d3 mx-auto mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
					<span class="h-px flex-1 bg-slate-900/10"></span>
					<span class="size-1.5 rotate-45 border border-red-500/70"></span>
					<span class="h-px flex-1 bg-slate-900/10"></span>
				</div>

				<EditableField
					fieldKey="AboutCTA.subtitle"
					label="Подзаголовок"
					value={String(data?.subtitle ?? 'Свяжитесь с нами, чтобы обсудить ваш проект')}
					{isEditable}
					multiline
					onSave={(v) => saveField('subtitle', v)}
					class="ab-item ab-d3 mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="mx-auto max-w-xl text-sm/6 text-slate-600 sm:text-base/7">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="ab-item ab-d4 mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
					<a
						href="/contact"
						class="group inline-flex items-center justify-center gap-2.5 rounded-full bg-red-500 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(239,68,68,0.9)] transition duration-300 hover:bg-red-400 hover:shadow-[0_22px_55px_-16px_rgba(239,68,68,1)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-400 motion-safe:hover:-translate-y-0.5"
					>
						<EditableField
							fieldKey="AboutCTA.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Получить консультацию')}
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
						fieldKey="AboutCTA.phone"
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
									class="group inline-flex items-center justify-center gap-2.5 rounded-full border border-slate-900/15 bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition duration-300 hover:border-slate-900/30 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-400 motion-safe:hover:-translate-y-0.5"
								>
									<svg
										class="size-4.5 text-red-500 transition-transform duration-300 group-hover:-rotate-12"
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
</section>
