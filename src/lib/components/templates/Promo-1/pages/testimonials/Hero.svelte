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
		await saveComponentData(editContext, 'Hero', updated);
		data = updated;
	}
</script>

<div class="relative overflow-hidden bg-linear-to-br from-pink-600 via-rose-500 to-fuchsia-600">
	<div class="absolute inset-0 opacity-30"
		style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
	</div>
	<div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
		<div class="text-center">
			<div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur shadow-lg">
				<svg class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
				</svg>
			</div>

			<EditableField
				fieldKey="Hero.eyebrow"
				label="Надпись над заголовком"
				value={String(data?.eyebrow ?? 'Отзывы')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<span class="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">{displayValue}</span>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="Hero.title"
				label="Заголовок"
				value={String(data?.title ?? 'Мы работаем ради таких отзывов клиентов о нашей работе')}
				{isEditable}
				multiline
				onSave={(v) => saveField('title', v)}
				class="mt-6 block"
			>
				{#snippet children(displayValue)}
					<h1 class="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">{displayValue}</h1>
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
