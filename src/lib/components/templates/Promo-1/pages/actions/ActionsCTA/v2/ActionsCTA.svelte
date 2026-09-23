<script lang="ts">
	// Артикул: 1.4.5.2 — см. docs/architecture/component-articles-map.md
	import RichText from '$lib/components/RichText.svelte';
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { isLightBlock } from '$lib/utils/block-theme';
	import { resolveSitePhone, sitePhoneHref } from '$lib/utils/site-phone';
	import '../../../../theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
		sitePhone?: string | null;
	} = $props();
	const phone = $derived(resolveSitePhone(sitePhone));
	const phoneHref = $derived(sitePhoneHref(sitePhone));
	const isLight = $derived(isLightBlock(data, 'dark'));

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
	<div
		class="pointer-events-none absolute inset-y-0 right-0 w-[70%] bg-brand-500/10 lg:w-[45%]"
		style="clip-path: polygon(72% 0, 100% 0, 100% 100%, 12% 100%)"
		aria-hidden="true"
	></div>
	<div class="relative mx-auto max-w-7xl px-6 lg:px-8">
		<div class="h-1 w-full bg-brand-500"></div>
		<div
			class="relative grid gap-12 border-b border-[var(--p1-border)] py-12 sm:py-16 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)] lg:gap-16 lg:py-20"
		>
			<div class="relative z-10">
				<EditableField
					fieldKey="ActionsCTA.title"
					label="Заголовок"
					value={String(data?.title ?? 'Хотите узнать больше об акциях?')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<h2
							class="p1-title p1-title-display max-w-[12ch] text-5xl text-balance sm:text-6xl lg:text-7xl"
						>
							<RichText value={displayValue} />
						</h2>
					{/snippet}
				</EditableField>
				<div class="mt-8 h-1 w-24 origin-left -skew-x-24 bg-brand-500" aria-hidden="true"></div>
				<EditableField
					fieldKey="ActionsCTA.subtitle"
					label="Подзаголовок"
					value={String(
						data?.subtitle ?? 'Свяжитесь с нами и мы расскажем обо всех актуальных предложениях'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('subtitle', v)}
					class="mt-8 block"
				>
					{#snippet children(displayValue)}
						<p class="p1-body max-w-xl text-lg/8 sm:text-xl/9"><RichText value={displayValue} /></p>
					{/snippet}
				</EditableField>
			</div>
			<div
				class="relative z-10 flex flex-col justify-end gap-6 lg:border-l lg:border-[var(--p1-border)] lg:pl-10"
			>
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
							class="group flex min-h-20 items-center justify-between gap-5 bg-brand-600 px-6 py-5 text-lg font-semibold text-on-accent transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 sm:px-8"
						>
							<RichText value={displayValue} />
							<svg
								class="size-8 shrink-0 transition-transform group-hover:translate-x-1"
								viewBox="0 0 32 32"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"><path d="M4 16h23m-9-9 9 9-9 9" /></svg
							>
						</a>
					{/snippet}
				</EditableField>
				<EditableField
					richText={false}
					fieldKey="ActionsCTA.phone"
					label="Телефон"
					value={phone}
					isEditable={false}
					onSave={(v) => saveField('phone', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<a
								href={phoneHref}
								class="p1-body inline-flex min-h-11 items-center gap-3 text-base font-semibold underline decoration-brand-500 underline-offset-8 transition-colors hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
							>
								<svg
									class="size-5 shrink-0"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									aria-hidden="true"
									><path
										d="M6 3h3l1.5 4-2 2a15 15 0 0 0 6.5 6.5l2-2 4 1.5v3a2 2 0 0 1-2 2C10.2 20 4 13.8 4 5a2 2 0 0 1 2-2Z"
									/></svg
								>
								{displayValue}
							</a>
						{/if}
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>
