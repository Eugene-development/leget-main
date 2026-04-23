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
		await saveComponentData(editContext, 'ContactAddress', updated);
		data = updated;
	}
</script>

<section class="bg-gray-50 py-24 sm:py-32">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="grid items-center gap-16 lg:grid-cols-2">
			<div>
				<EditableField
					fieldKey="ContactAddress.eyebrow"
					label="Надпись над заголовком"
					value={String(data?.eyebrow ?? 'Давайте встретимся')}
					{isEditable}
					onSave={(v) => saveField('eyebrow', v)}
					class="block"
				>
					{#snippet children(displayValue)}
						<p class="text-base/7 font-semibold text-red-600">{displayValue}</p>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ContactAddress.title"
					label="Заголовок"
					value={String(data?.title ?? 'Личная консультация')}
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
					fieldKey="ContactAddress.description"
					label="Описание"
					value={String(data?.description ?? 'Для обсуждения деталей мы можем организовать с вами встречу в одном из салонов наших партнёров или на вашем объекте')}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="mt-6 text-base/7 md:text-lg/8 text-gray-600">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="mt-8">
					<a
						href="/contact"
						class="inline-flex items-center gap-2 rounded-lg bg-red-500 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition duration-300 hover:-translate-y-1 hover:bg-red-400 hover:shadow-xl hover:shadow-red-500/40"
					>
						<EditableField
							fieldKey="ContactAddress.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Записаться на консультацию')}
							{isEditable}
							onSave={(v) => saveField('buttonText', v)}
							class="inline"
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
					</a>
				</div>

				<dl class="mt-10 space-y-6">
					<!-- Адрес -->
					<div class="flex gap-4">
						<dt class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
							<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
							</svg>
						</dt>
						<dd>
							<EditableField
								fieldKey="ContactAddress.addressTitle"
								label="Заголовок адреса"
								value={String(data?.addressTitle ?? 'Адрес')}
								{isEditable}
								onSave={(v) => saveField('addressTitle', v)}
								class="block"
							>
								{#snippet children(displayValue)}
									<p class="font-semibold text-gray-900">{displayValue}</p>
								{/snippet}
							</EditableField>
							<EditableField
								fieldKey="ContactAddress.addressText"
								label="Адрес"
								value={String(data?.addressText ?? '')}
								{isEditable}
								onSave={(v) => saveField('addressText', v)}
								class="mt-1 block"
							>
								{#snippet children(displayValue)}
									<p class="mt-1 text-base/7 text-gray-600">{displayValue}</p>
								{/snippet}
							</EditableField>
						</dd>
					</div>

					<!-- Часы работы -->
					<div class="flex gap-4">
						<dt class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
							<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
						</dt>
						<dd>
							<EditableField
								fieldKey="ContactAddress.hoursTitle"
								label="Заголовок часов работы"
								value={String(data?.hoursTitle ?? 'Часы работы')}
								{isEditable}
								onSave={(v) => saveField('hoursTitle', v)}
								class="block"
							>
								{#snippet children(displayValue)}
									<p class="font-semibold text-gray-900">{displayValue}</p>
								{/snippet}
							</EditableField>
							<EditableField
								fieldKey="ContactAddress.hoursText"
								label="Часы работы"
								value={String(data?.hoursText ?? '')}
								{isEditable}
								onSave={(v) => saveField('hoursText', v)}
								class="mt-1 block"
							>
								{#snippet children(displayValue)}
									<p class="mt-1 text-base/7 text-gray-600">{displayValue}</p>
								{/snippet}
							</EditableField>
						</dd>
					</div>

					<!-- Парковка -->
					<div class="flex gap-4">
						<dt class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
							<svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
							</svg>
						</dt>
						<dd>
							<EditableField
								fieldKey="ContactAddress.parkingTitle"
								label="Заголовок парковки"
								value={String(data?.parkingTitle ?? 'Парковка')}
								{isEditable}
								onSave={(v) => saveField('parkingTitle', v)}
								class="block"
							>
								{#snippet children(displayValue)}
									<p class="font-semibold text-gray-900">{displayValue}</p>
								{/snippet}
							</EditableField>
							<EditableField
								fieldKey="ContactAddress.parkingText"
								label="Информация о парковке"
								value={String(data?.parkingText ?? '')}
								{isEditable}
								onSave={(v) => saveField('parkingText', v)}
								class="mt-1 block"
							>
								{#snippet children(displayValue)}
									<p class="mt-1 text-base/7 text-gray-600">{displayValue}</p>
								{/snippet}
							</EditableField>
						</dd>
					</div>
				</dl>
			</div>

			<!-- Карта / Изображение -->
			<div class="relative">
				<div class="absolute -bottom-6 -right-6 size-48 rounded-3xl bg-red-500 lg:size-64"></div>
				<div class="absolute -left-4 -top-4 size-32 rounded-full bg-red-500/30 blur-2xl"></div>
				<div class="relative overflow-hidden rounded-3xl bg-gray-200 shadow-2xl">
					<EditableField
						fieldKey="ContactAddress.mapImageUrl"
						label="URL изображения карты"
						value={String(data?.mapImageUrl ?? '')}
						{isEditable}
						onSave={(v) => saveField('mapImageUrl', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<img src={displayValue} alt="Карта" class="w-full object-cover" />
							{:else}
								<div class="flex aspect-square items-center justify-center bg-gray-100">
									<div class="text-center">
										<svg class="mx-auto size-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
											<path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
										</svg>
										<p class="mt-4 text-lg font-medium text-gray-500">Карта</p>
										<p class="mt-1 text-sm text-gray-400">Добавьте URL изображения карты</p>
									</div>
								</div>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</div>
</section>
