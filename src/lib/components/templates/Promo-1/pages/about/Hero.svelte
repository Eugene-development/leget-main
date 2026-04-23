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

<div class="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-red-900">
	<div class="absolute inset-0 opacity-20"
		style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C92AC%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
	</div>
	<div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
		<div class="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
			<div>
				<EditableField
					fieldKey="Hero.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'О компании')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline-block"
				>
					{#snippet children(displayValue)}
						<div class="inline-flex items-center rounded-full bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 backdrop-blur">
							<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
							</svg>
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Hero.title"
					label="Заголовок"
					value={String(data?.title ?? 'О нас')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						<h1 class="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">{displayValue}</h1>
					{/snippet}
				</EditableField>

				<div class="mt-6 h-1 w-20 rounded-full bg-red-500"></div>

				<EditableField
					fieldKey="Hero.lead"
					label="Вводный текст"
					value={String(data?.lead ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('lead', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<p class="mt-6 text-xl text-red-100">{displayValue}</p>
						{/if}
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="Hero.text"
					label="Основной текст"
					value={String(data?.text ?? '')}
					{isEditable}
					multiline
					onSave={(v) => saveField('text', v)}
					class="mt-4 block"
				>
					{#snippet children(displayValue)}
						{#if displayValue}
							<p class="mt-4 text-lg text-slate-300">{displayValue}</p>
						{/if}
					{/snippet}
				</EditableField>

				<div class="mt-10">
					<a
						href="/contact"
						class="inline-flex items-center gap-2 rounded-xl bg-red-500 px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-red-600 hover:shadow-xl"
					>
						<EditableField
							fieldKey="Hero.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText ?? 'Связаться с нами')}
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

			<!-- Сетка фото -->
			<div class="mt-12 lg:mt-0">
				<div class="grid grid-cols-2 gap-4">
					<div class="space-y-4">
						<EditableField
							fieldKey="Hero.img1"
							label="Фото 1 (URL)"
							value={String(data?.img1 ?? '')}
							{isEditable}
							onSave={(v) => saveField('img1', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<div class="overflow-hidden rounded-2xl shadow-xl">
										<img src={displayValue} alt="" class="h-48 w-full object-cover" />
									</div>
								{/if}
							{/snippet}
						</EditableField>
						<EditableField
							fieldKey="Hero.img2"
							label="Фото 2 (URL)"
							value={String(data?.img2 ?? '')}
							{isEditable}
							onSave={(v) => saveField('img2', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<div class="overflow-hidden rounded-2xl shadow-xl">
										<img src={displayValue} alt="" class="h-48 w-full object-cover" />
									</div>
								{/if}
							{/snippet}
						</EditableField>
					</div>
					<div class="space-y-4 pt-8">
						<EditableField
							fieldKey="Hero.img3"
							label="Фото 3 (URL)"
							value={String(data?.img3 ?? '')}
							{isEditable}
							onSave={(v) => saveField('img3', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<div class="overflow-hidden rounded-2xl shadow-xl">
										<img src={displayValue} alt="" class="h-48 w-full object-cover" />
									</div>
								{/if}
							{/snippet}
						</EditableField>
						<EditableField
							fieldKey="Hero.img4"
							label="Фото 4 (URL)"
							value={String(data?.img4 ?? '')}
							{isEditable}
							onSave={(v) => saveField('img4', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								{#if displayValue}
									<div class="overflow-hidden rounded-2xl shadow-xl">
										<img src={displayValue} alt="" class="h-48 w-full object-cover" />
									</div>
								{/if}
							{/snippet}
						</EditableField>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- Волна снизу -->
	<div class="absolute bottom-0 left-0 right-0 pointer-events-none">
		<svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
		</svg>
	</div>
</div>
