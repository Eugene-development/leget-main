<script lang="ts">
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
		<div class="bg-brand-500 px-6 py-10 text-on-accent sm:px-10 sm:py-14 lg:px-16 lg:py-16">
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
						class="p1-title-display max-w-5xl text-5xl text-balance text-on-accent sm:text-6xl lg:text-7xl"
					>
						<RichText value={displayValue} />
					</h2>
				{/snippet}
			</EditableField>
		</div>
		<div
			class="grid gap-10 border-x border-b border-[var(--p1-border)] px-6 py-9 sm:px-10 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.7fr)] lg:items-center lg:gap-16 lg:px-16"
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
					<p class="p1-body max-w-2xl text-xl/9 sm:text-2xl/10">
						<RichText value={displayValue} />
					</p>
				{/snippet}
			</EditableField>
			<div class="flex flex-col gap-5">
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
							class="group flex min-h-24 items-center justify-between gap-4 border-2 border-brand-600 bg-brand-600 px-6 py-5 text-lg font-semibold text-on-accent transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 sm:text-xl"
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
						{#if displayValue}<a
								href={phoneHref}
								class="p1-body inline-flex min-h-11 items-center text-base font-semibold underline decoration-brand-500 underline-offset-8 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
								>{displayValue}</a
							>{/if}
					{/snippet}
				</EditableField>
			</div>
		</div>
	</div>
</section>
