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
		await saveComponentData(editContext, 'ContactMessengers', updated);
		data = updated;
	}
</script>

<section class="bg-white py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="text-center">
			<EditableField
				fieldKey="ContactMessengers.eyebrow"
				label="Надпись над заголовком"
				value={String(data?.eyebrow ?? 'Социальные сети')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="text-base/7 font-semibold text-red-600">{displayValue}</p>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ContactMessengers.title"
				label="Заголовок"
				value={String(data?.title ?? 'Мы в Телеграм')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="mt-2 block"
			>
				{#snippet children(displayValue)}
					<h2 class="mt-2 text-pretty text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
						{displayValue}
					</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="ContactMessengers.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Напишите нам и мы ответим в течение нескольких минут')}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-6 max-w-2xl text-lg/8 text-gray-600">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>

		<div class="mt-16 flex flex-wrap justify-center gap-6">
			<!-- Telegram -->
			<EditableField
				fieldKey="ContactMessengers.telegramUrl"
				label="Ссылка на Telegram"
				value={String(data?.telegramUrl ?? '')}
				{isEditable}
				onSave={(v) => saveField('telegramUrl', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					{#if displayValue}
						<a
							href={displayValue}
							target="_blank"
							rel="noopener noreferrer"
							class="group flex items-center gap-4 rounded-2xl bg-white px-8 py-6 shadow-lg ring-1 ring-gray-200 transition duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-red-500"
						>
							<div class="flex size-14 items-center justify-center rounded-2xl bg-red-500 text-white transition duration-300 group-hover:scale-110">
								<svg class="size-8" fill="currentColor" viewBox="0 0 24 24">
									<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
								</svg>
							</div>
							<div>
								<p class="font-semibold text-gray-900">Telegram</p>
								<p class="text-sm text-gray-500">Удобный чат</p>
							</div>
						</a>
					{/if}
				{/snippet}
			</EditableField>
		</div>
	</div>
</section>
