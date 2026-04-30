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
		await saveComponentData(editContext, 'GuaranteesHero', updated);
		data = updated;
	}
</script>

<div class="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
	<div class="absolute inset-0 opacity-20"
		style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
	</div>
	<div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
		<div class="text-center">
			<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/25">
				<svg class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
			</div>

			<EditableField
				fieldKey="GuaranteesHero.title"
				label="Заголовок"
				value={String(data?.title ?? 'Гарантия качества')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h1 class="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">{displayValue}</h1>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="GuaranteesHero.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Мы уверены в качестве продукции наших партнёров. Вся продукция имеет расширенную гарантию на материалы и работу мастеров.')}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-6 max-w-2xl text-lg text-slate-300">{displayValue}</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
	<div class="absolute bottom-0 left-0 right-0 pointer-events-none">
		<svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
		</svg>
	</div>
</div>
