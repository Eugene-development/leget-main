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
		await saveComponentData(editContext, 'PartnershipHero', updated);
		data = updated;
	}
</script>

<div class="relative overflow-hidden bg-linear-to-br from-red-600 via-red-500 to-red-700">
	<div class="absolute inset-0 opacity-30"
		style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
	</div>
	<div class="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
		<div class="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
			<div>
				<EditableField
					fieldKey="PartnershipHero.badge"
					label="Бейдж"
					value={String(data?.badge ?? 'Партнёрская программа')}
					{isEditable}
					onSave={(v) => saveField('badge', v)}
					class="inline-block"
				>
					{#snippet children(displayValue)}
						<div class="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
							<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							{displayValue}
						</div>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="PartnershipHero.title"
					label="Заголовок"
					value={String(data?.title ?? 'Растём вместе')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						<h1 class="mt-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">{displayValue}</h1>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="PartnershipHero.text"
					label="Описание"
					value={String(data?.text ?? 'Приглашаем к сотрудничеству дизайнеров интерьеров, ремонтные бригады и продавцов мебели. Выгодные условия и прозрачная система вознаграждений.')}
					{isEditable}
					multiline
					onSave={(v) => saveField('text', v)}
					class="mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="mt-6 text-lg text-red-100">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="mt-10">
					<a
						href="/contact"
						class="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-red-600 shadow-lg transition-all hover:bg-red-50 hover:shadow-xl"
					>
						<EditableField
							fieldKey="PartnershipHero.buttonText"
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
				</div>
			</div>

			<!-- Цитата -->
			<div class="mt-12 lg:mt-0">
				<div class="relative">
					<div class="absolute -inset-4 rounded-3xl bg-white/10 backdrop-blur"></div>
					<div class="relative rounded-2xl bg-white/10 p-8 backdrop-blur">
						<EditableField
							fieldKey="PartnershipHero.quote"
							label="Цитата"
							value={String(data?.quote ?? 'Партнёрство открывает новые горизонты и возможности для совместного роста. Вместе мы достигнем большего.')}
							{isEditable}
							multiline
							onSave={(v) => saveField('quote', v)}
							class="block"
						>
							{#snippet children(displayValue)}
								<blockquote class="text-xl font-medium text-white">"{displayValue}"</blockquote>
							{/snippet}
						</EditableField>
						<div class="mt-6 flex items-center gap-4">
							<div class="h-12 w-12 rounded-full bg-white/20"></div>
							<div>
								<EditableField
									fieldKey="PartnershipHero.quoteName"
									label="Имя автора цитаты"
									value={String(data?.quoteName ?? '')}
									{isEditable}
									onSave={(v) => saveField('quoteName', v)}
									class="block"
								>
									{#snippet children(displayValue)}
										{#if displayValue}
											<div class="font-semibold text-white">{displayValue}</div>
										{/if}
									{/snippet}
								</EditableField>
								<EditableField
									fieldKey="PartnershipHero.quoteRole"
									label="Должность автора"
									value={String(data?.quoteRole ?? '')}
									{isEditable}
									onSave={(v) => saveField('quoteRole', v)}
									class="block"
								>
									{#snippet children(displayValue)}
										{#if displayValue}
											<div class="text-sm text-red-200">{displayValue}</div>
										{/if}
									{/snippet}
								</EditableField>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="absolute bottom-0 left-0 right-0 pointer-events-none">
		<svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
		</svg>
	</div>
</div>
