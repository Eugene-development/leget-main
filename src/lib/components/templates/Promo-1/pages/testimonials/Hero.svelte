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
		await saveComponentData(editContext, 'TestimonialsHero', updated);
		data = updated;
	}
</script>

<div class="relative overflow-hidden bg-white py-12 sm:py-20">
	<!-- Декоративные блобы -->
	<div class="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 overflow-hidden opacity-30 blur-3xl" aria-hidden="true">
		<div
			class="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-linear-to-tr from-red-300 to-red-500"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>
	<div class="absolute inset-x-0 top-0 -z-10 flex overflow-hidden pt-32 opacity-25 blur-3xl sm:pt-40 xl:justify-end" aria-hidden="true">
		<div
			class="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-linear-to-tr from-red-200 to-red-400 xl:ml-0 xl:mr-[calc(50%-12rem)]"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>

	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-4xl text-center">
			<EditableField
				fieldKey="TestimonialsHero.eyebrow"
				label="Надпись над заголовком"
				value={String(data?.eyebrow ?? 'Отзывы')}
				{isEditable}
				onSave={(v) => saveField('eyebrow', v)}
				class="block"
			>
				{#snippet children(displayValue)}
					<h2 class="text-base/7 font-semibold text-red-600">{displayValue}</h2>
				{/snippet}
			</EditableField>

			<EditableField
				fieldKey="TestimonialsHero.title"
				label="Заголовок"
				value={String(data?.title ?? 'Мы работаем ради таких отзывов клиентов о нашей работе')}
				{isEditable}
				multiline
				onSave={(v) => saveField('title', v)}
				class="mt-2 block"
			>
				{#snippet children(displayValue)}
					<p class="mt-2 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
						{displayValue}
					</p>
				{/snippet}
			</EditableField>
		</div>
	</div>
</div>
