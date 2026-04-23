<script lang="ts">
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
		await saveComponentData(editContext, 'ContactCTA', updated);
		data = updated;
	}
</script>

<section class="relative overflow-hidden bg-gray-900 py-24 sm:py-32">
	<!-- Декоративный паттерн -->
	<div class="absolute inset-0 opacity-10">
		<svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<pattern id="contacts-grid" width="40" height="40" patternUnits="userSpaceOnUse">
					<path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1" />
				</pattern>
			</defs>
			<rect width="100%" height="100%" fill="url(#contacts-grid)" />
		</svg>
	</div>
	<div class="absolute left-1/4 top-0 size-64 -translate-y-1/2 rounded-full bg-red-500/15 blur-3xl"></div>
	<div class="absolute bottom-0 right-1/4 size-64 translate-y-1/2 rounded-full bg-red-500/15 blur-3xl"></div>

	<div class="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
		<EditableField
			fieldKey="ContactCTA.title"
			label="Заголовок"
			value={String(data?.title ?? 'Остались вопросы?')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-pretty text-3xl font-semibold tracking-tight text-white sm:text-4xl">
					{displayValue}
				</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="ContactCTA.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Свяжитесь с нами любым удобным способом — мы всегда рады помочь')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="mt-6 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mt-6 max-w-xl text-lg/8 text-gray-400">{displayValue}</p>
			{/snippet}
		</EditableField>

		<div class="mt-10 flex flex-wrap justify-center gap-4">
			<EditableField
				fieldKey="ContactCTA.phone"
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
							class="inline-flex items-center gap-2 rounded-lg bg-red-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition duration-300 hover:-translate-y-1 hover:bg-red-400 hover:shadow-xl hover:shadow-red-500/40"
						>
							<svg class="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
							</svg>
							Позвонить
						</a>
					{/if}
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ContactCTA.telegramUrl"
				label="Ссылка на Telegram"
				value={String(data?.telegramUrl ?? '')}
				{isEditable}
				onSave={(v) => saveField('telegramUrl', v)}
				class="inline-block"
			>
				{#snippet children(displayValue)}
					{#if displayValue}
						<a
							href={displayValue}
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-8 py-4 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:border-gray-400 hover:bg-white/5"
						>
							Написать в Telegram
						</a>
					{/if}
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
