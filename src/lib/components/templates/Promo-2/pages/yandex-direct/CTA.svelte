<script lang="ts">
	// Артикул: 2.14.7.1 — см. docs/architecture/component-articles-map.md
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
		await saveComponentData(editContext, 'CTA', updated);
		data = updated;
	}

	let visible = $state(false);
	let sectionEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.25 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section
	class="relative overflow-hidden bg-primary py-section-sm lg:py-section"
	bind:this={sectionEl}
>
	<!-- Decorative corners -->
	<div class="absolute top-0 left-0 h-32 w-32 border border-white/5 lg:h-64 lg:w-64"></div>
	<div class="absolute right-0 bottom-0 h-48 w-48 border border-white/5 lg:h-80 lg:w-80"></div>
	<!-- Gold accent line top -->
	<div
		class="absolute top-0 right-0 left-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent"
	></div>

	<div class="relative mx-auto max-w-3xl px-6 text-center xl:px-1">
		<div class="opacity-0 transition-all duration-700" class:animate-fade-up={visible}>
			<EditableField
				fieldKey="CTA.eyebrow"
				label="Надпись над заголовком"
				value={String(data?.eyebrow ?? 'Готовы начать?')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
			>
				{#snippet children(displayValue)}
					<span class="text-[11px] tracking-[0.3em] text-accent uppercase">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="CTA.title"
				label="Заголовок"
				value={String(data?.title ?? 'Готовы обсудить ваш проект?')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="mt-4 block"
			>
				{#snippet children(displayValue)}
					<h2
						class="mt-4 text-4xl text-white lg:text-6xl"
						style="font-family: var(--font-heading);"
					>
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="CTA.subtitle"
				label="Описание"
				value={String(
					data?.subtitle ??
						'Оставьте заявку — мы перезвоним в течение 15 минут и ответим на все вопросы'
				)}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/60">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>

			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<!-- Primary CTA -->
				<EditableField
					fieldKey="CTA.primaryButton"
					label="Основная кнопка"
					value={String(data?.primaryButton ?? 'Оставить заявку')}
					{isEditable}
					onSave={(v) => saveField('primaryButton', v)}
				>
					{#snippet children(displayValue)}
						<a
							href={String(data?.primaryHref ?? '/contact')}
							class="group inline-flex cursor-pointer items-center gap-3 rounded-sm border border-accent bg-accent px-8 py-4 text-xs tracking-[0.15em] text-primary uppercase transition-all duration-500 hover:border-accent-light hover:bg-accent-light"
						>
							{displayValue}
							<svg
								class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
								/>
							</svg>
						</a>
					{/snippet}
				</EditableField>

				<!-- Phone CTA -->
				<EditableField
					fieldKey="CTA.phoneButton"
					label="Кнопка телефона"
					value={String(data?.phoneButton ?? 'Позвонить нам')}
					{isEditable}
					onSave={(v) => saveField('phoneButton', v)}
				>
					{#snippet children(displayValue)}
						<a
							href={String(data?.phoneHref ?? 'tel:+70000000000')}
							class="inline-flex items-center gap-2 rounded-sm border border-white/20 px-8 py-4 text-xs tracking-[0.15em] text-white uppercase transition-all duration-500 hover:border-white/50"
						>
							<svg
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
								/>
							</svg>
							{displayValue}
						</a>
					{/snippet}
				</EditableField>
			</div>

			<!-- Trust badges -->
			<div
				class="mt-12 flex flex-wrap items-center justify-center gap-8 border-t border-white/10 pt-8"
			>
				<div class="flex items-center gap-2 text-[11px] tracking-[0.15em] text-white/40 uppercase">
					<div class="h-px w-4 bg-white/20"></div>
					Безопасная сделка
				</div>
				<div class="flex items-center gap-2 text-[11px] tracking-[0.15em] text-white/40 uppercase">
					<div class="h-px w-4 bg-white/20"></div>
					Данные защищены
				</div>
				<div class="flex items-center gap-2 text-[11px] tracking-[0.15em] text-white/40 uppercase">
					<div class="h-px w-4 bg-white/20"></div>
					Без спама
				</div>
			</div>
		</div>
	</div>
</section>
