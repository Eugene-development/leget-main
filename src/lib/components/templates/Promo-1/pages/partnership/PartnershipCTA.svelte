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
		await saveComponentData(editContext, 'PartnershipCTA', updated);
		data = updated;
	}
</script>

<div class="bg-linear-to-r from-sky-500 to-cyan-600 py-24">
	<div class="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
		<div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
			<svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
			</svg>
		</div>

		<EditableField
			fieldKey="PartnershipCTA.title"
			label="Заголовок"
			value={String(data?.title ?? 'Присоединяйтесь к нам')}
			{isEditable}
			onSave={(v) => saveField('title', v)}
			class="block"
		>
			{#snippet children(displayValue)}
				<h2 class="text-3xl font-bold text-white sm:text-4xl">{displayValue}</h2>
			{/snippet}
		</EditableField>

		<EditableField
			fieldKey="PartnershipCTA.subtitle"
			label="Подзаголовок"
			value={String(data?.subtitle ?? 'Начните работать вместе с нами уже сегодня')}
			{isEditable}
			multiline
			onSave={(v) => saveField('subtitle', v)}
			class="mt-4 block"
		>
			{#snippet children(displayValue)}
				<p class="mx-auto mt-4 max-w-xl text-lg text-cyan-100">{displayValue}</p>
			{/snippet}
		</EditableField>

		<div class="mt-8 flex flex-wrap justify-center gap-4">
			<a
				href="/contact"
				class="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-sky-600 shadow-lg transition-all hover:bg-sky-50 hover:shadow-xl"
			>
				<EditableField
					fieldKey="PartnershipCTA.buttonText"
					label="Текст кнопки"
					value={String(data?.buttonText ?? 'Обсудить сотрудничество')}
					{isEditable}
					onSave={(v) => saveField('buttonText', v)}
					class="inline"
				>
					{#snippet children(displayValue)}
						{displayValue}
					{/snippet}
				</EditableField>
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
				</svg>
			</a>

			<EditableField
				fieldKey="PartnershipCTA.phone"
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
							class="inline-flex items-center gap-2 rounded-xl bg-white/10 px-8 py-4 font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
						>
							<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
							</svg>
							Позвонить
						</a>
					{/if}
				{/snippet}
			</EditableField>
		</div>
	</div>
</div>
