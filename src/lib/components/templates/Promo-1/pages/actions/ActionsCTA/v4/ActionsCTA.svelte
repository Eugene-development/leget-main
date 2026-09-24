<script lang="ts">
	// Артикул: 1.4.5.4 — см. docs/architecture/component-articles-map.md
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
	class="p1-surface overflow-hidden py-section-sm sm:py-section"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="border-y-4 border-brand-500 py-8 sm:py-12">
			<div class="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:gap-16">
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
							class="p1-title p1-title-display max-w-[11ch] text-5xl text-balance sm:text-6xl lg:text-7xl"
						>
							<RichText value={displayValue} />
						</h2>
					{/snippet}
				</EditableField>
				<div
					class="flex flex-col justify-between gap-8 lg:border-l lg:border-[var(--p1-border)] lg:pl-10"
				>
					<EditableField
						fieldKey="ActionsCTA.subtitle"
						label="Подзаголовок"
						value={String(
							data?.subtitle ?? 'Свяжитесь с нами и мы расскажем обо всех актуальных предложениях'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('subtitle', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							<p class="p1-body max-w-lg text-lg/8"><RichText value={displayValue} /></p>
						{/snippet}
					</EditableField>
					<div
						class="flex h-14 w-14 items-center justify-center border border-brand-500 text-brand-500"
						aria-hidden="true"
					>
						<svg
							class="size-8"
							viewBox="0 0 32 32"
							fill="none"
							stroke="currentColor"
							stroke-width="2"><path d="M4 16h23m-9-9 9 9-9 9" /></svg
						>
					</div>
				</div>
			</div>
			<div
				class="mt-10 grid gap-6 border-t border-[var(--p1-border)] pt-7 sm:mt-14 sm:pt-9 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end lg:gap-16"
			>
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
								class="p1-title p1-title-display block text-3xl break-words underline decoration-brand-500 underline-offset-8 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 sm:text-5xl"
								>{displayValue}</a
							>
						{/if}
					{/snippet}
				</EditableField>
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
							class="group flex min-h-20 items-center justify-between gap-4 bg-brand-600 px-6 py-5 text-lg font-semibold text-on-accent transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
						>
							<RichText value={displayValue} />
							<svg
								class="size-7 shrink-0 transition-transform group-hover:translate-x-1"
								viewBox="0 0 32 32"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								aria-hidden="true"><path d="M4 16h23m-9-9 9 9-9 9" /></svg
							>
						</a>
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>
