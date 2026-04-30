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
		await saveComponentData(editContext, 'InstallmentHero', updated);
		data = updated;
	}
</script>

<div class="relative overflow-hidden bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700">
	<div class="absolute inset-0 opacity-30"
		style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
	</div>
	<div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
		<div class="text-center">
			<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur shadow-lg">
				<svg class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
				</svg>
			</div>

			<EditableField
				fieldKey="InstallmentHero.title"
				label="Заголовок"
				value={String(data?.title ?? 'Рассрочка без переплаты')}
				{isEditable}
				onSave={(v) => saveField('title', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h1 class="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">{displayValue}</h1>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="InstallmentHero.subtitle"
				label="Подзаголовок"
				value={String(data?.subtitle ?? 'Купите мебель и технику сейчас — платите частями до 12 месяцев. Быстрое одобрение, минимум документов.')}
				{isEditable}
				multiline
				onSave={(v) => saveField('subtitle', v)}
				class="mt-6 block"
			>
				{#snippet children(displayValue)}
					<p class="mx-auto mt-6 max-w-2xl text-lg text-purple-100">{displayValue}</p>
				{/snippet}
			</EditableField>

			<div class="mt-10 flex flex-wrap justify-center gap-4">
				<a
					href="/contact"
					class="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-purple-600 shadow-lg transition-all hover:bg-purple-50 hover:shadow-xl"
				>
					<EditableField
						fieldKey="InstallmentHero.buttonText"
						label="Текст кнопки"
						value={String(data?.buttonText ?? 'Консультация по рассрочке')}
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
			</div>
		</div>
	</div>
	<div class="absolute bottom-0 left-0 right-0 pointer-events-none">
		<svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
		</svg>
	</div>
</div>
