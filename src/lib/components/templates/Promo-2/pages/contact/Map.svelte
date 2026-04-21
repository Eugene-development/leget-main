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
		await saveComponentData(editContext, 'Map', updated);
		data = updated;
	}
</script>

<section class="bg-white px-6 py-12">
	<div class="mx-auto max-w-2xl">
		{#if data?.address}
			<EditableField
				fieldKey="Map.address"
				label="Адрес"
				value={String(data.address)}
				{isEditable}
				onSave={(v) => saveField('address', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<p class="mb-4 text-stone-600">
						<span class="font-medium">Адрес:</span>
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		{/if}

		<div class="overflow-hidden rounded-2xl bg-stone-100" style="height: 320px;">
			<iframe
				title="Карта"
				src="https://yandex.ru/map-widget/v1/?text={encodeURIComponent(String(data?.address ?? 'Москва'))}&z=14"
				width="100%"
				height="100%"
				frameborder="0"
				allowfullscreen
				loading="lazy"
			></iframe>
		</div>
	</div>
</section>
