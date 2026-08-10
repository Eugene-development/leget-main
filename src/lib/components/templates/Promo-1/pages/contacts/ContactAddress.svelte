<script lang="ts">
	// Артикул: 1.5.3.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { ct, revealOnScroll } from './theme';
	import BlockThemeToggle from '$lib/components/BlockThemeToggle.svelte';
	import { createThemeToggle, isLightBlock } from '$lib/utils/block-theme';
	import '../../theme.css';
	import './theme.css';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	const isLight = $derived(isLightBlock(data, 'light'));
	const toggleTheme = createThemeToggle({
		type: 'ContactAddress',
		fallback: 'light',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactAddress', updated);
		data = updated;
	}
</script>

<!-- Поверхность «paper» в ритме страницы; палитра и типографика — из ./theme.ts. -->
<section
	class="{ct.section.shell} {ct.section.pad} {ct.surface.paper}"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<BlockThemeToggle {isLight} onToggle={toggleTheme} {isEditable} {editContext} />

	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class="ct-rules"></div>
		<div
			class="absolute inset-0 bg-[radial-gradient(circle_at_82%_15%,rgba(239,68,68,0.08),transparent_42%)]"
		></div>
		<div class={ct.accent.toplineOnLight}></div>
	</div>

	<div class={ct.section.container}>
		<div use:revealOnScroll class="ct-reveal grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
			<div>
				<EditableField
					fieldKey="ContactAddress.eyebrow"
					label="Надпись над заголовком"
					value={String(data?.eyebrow || 'Давайте встретимся')}
					{isEditable}
					onSave={(v) => saveField('eyebrow', v)}
					class="ct-item inline-block"
				>
					{#snippet children(displayValue)}
						<p class={ct.eyebrow.onLight}>
							<span class={ct.eyebrow.dashOnLight} aria-hidden="true"></span>
							{displayValue}
						</p>
					{/snippet}
				</EditableField>

				<EditableField
					fieldKey="ContactAddress.title"
					label="Заголовок"
					value={String(data?.title || 'Личная консультация')}
					{isEditable}
					onSave={(v) => saveField('title', v)}
					class="ct-item ct-d1 mt-5 block"
				>
					{#snippet children(displayValue)}
						<h2 class={ct.title.h2OnLight}>{displayValue}</h2>
					{/snippet}
				</EditableField>

				<div class="ct-rule ct-d2 mt-6 flex max-w-xs items-center gap-3" aria-hidden="true">
					<span class={ct.accent.diamond}></span>
					<span class={ct.accent.ruleOnLight}></span>
				</div>

				<EditableField
					fieldKey="ContactAddress.description"
					label="Описание"
					value={String(
						data?.description ||
							'Для обсуждения деталей мы можем организовать с вами встречу в одном из салонов наших партнёров или на вашем объекте'
					)}
					{isEditable}
					multiline
					onSave={(v) => saveField('description', v)}
					class="ct-item ct-d3 mt-6 block"
				>
					{#snippet children(displayValue)}
						<p class="{ct.body.onLight} max-w-xl">{displayValue}</p>
					{/snippet}
				</EditableField>

				<div class="ct-item ct-d4 mt-9">
					<a href="/contact" class={ct.btn.primary}>
						<EditableField
							fieldKey="ContactAddress.buttonText"
							label="Текст кнопки"
							value={String(data?.buttonText || 'Записаться на консультацию')}
							{isEditable}
							onSave={(v) => saveField('buttonText', v)}
							class="inline"
						>
							{#snippet children(displayValue)}
								{displayValue}
							{/snippet}
						</EditableField>
						<span class={ct.arrow} aria-hidden="true">&rarr;</span>
					</a>
				</div>

				<dl class="ct-item ct-d5 mt-10 space-y-6">
					<!-- Адрес -->
					<div class="flex gap-4">
						<dt class={ct.iconTile}>
							<svg
								class="size-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
								/>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
								/>
							</svg>
						</dt>
						<dd>
							<EditableField
								fieldKey="ContactAddress.addressTitle"
								label="Заголовок адреса"
								value={String(data?.addressTitle || 'Адрес')}
								{isEditable}
								onSave={(v) => saveField('addressTitle', v)}
								class="block"
							>
								{#snippet children(displayValue)}
									<p class={ct.body.labelOnLight}>{displayValue}</p>
								{/snippet}
							</EditableField>
							<EditableField
								fieldKey="ContactAddress.addressText"
								label="Адрес"
								value={String(data?.addressText || 'г. Москва, ул. Большая Полянка, д. 1')}
								{isEditable}
								onSave={(v) => saveField('addressText', v)}
								class="mt-1 block"
							>
								{#snippet children(displayValue)}
									<p class={ct.body.onLight}>{displayValue}</p>
								{/snippet}
							</EditableField>
						</dd>
					</div>

					<!-- Часы работы -->
					<div class="flex gap-4">
						<dt class={ct.iconTile}>
							<svg
								class="size-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</dt>
						<dd>
							<EditableField
								fieldKey="ContactAddress.hoursTitle"
								label="Заголовок часов работы"
								value={String(data?.hoursTitle || 'Часы работы')}
								{isEditable}
								onSave={(v) => saveField('hoursTitle', v)}
								class="block"
							>
								{#snippet children(displayValue)}
									<p class={ct.body.labelOnLight}>{displayValue}</p>
								{/snippet}
							</EditableField>
							<EditableField
								fieldKey="ContactAddress.hoursText"
								label="Часы работы"
								value={String(data?.hoursText || 'Пн-Сб: 10:00 — 20:00')}
								{isEditable}
								onSave={(v) => saveField('hoursText', v)}
								class="mt-1 block"
							>
								{#snippet children(displayValue)}
									<p class={ct.body.onLight}>{displayValue}</p>
								{/snippet}
							</EditableField>
						</dd>
					</div>

					<!-- Парковка -->
					<div class="flex gap-4">
						<dt class={ct.iconTile}>
							<svg
								class="size-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="1.5"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
								/>
							</svg>
						</dt>
						<dd>
							<EditableField
								fieldKey="ContactAddress.parkingTitle"
								label="Заголовок парковки"
								value={String(data?.parkingTitle || 'Парковка')}
								{isEditable}
								onSave={(v) => saveField('parkingTitle', v)}
								class="block"
							>
								{#snippet children(displayValue)}
									<p class={ct.body.labelOnLight}>{displayValue}</p>
								{/snippet}
							</EditableField>
							<EditableField
								fieldKey="ContactAddress.parkingText"
								label="Информация о парковке"
								value={String(data?.parkingText || 'Бесплатная гостевая парковка')}
								{isEditable}
								onSave={(v) => saveField('parkingText', v)}
								class="mt-1 block"
							>
								{#snippet children(displayValue)}
									<p class={ct.body.onLight}>{displayValue}</p>
								{/snippet}
							</EditableField>
						</dd>
					</div>
				</dl>
			</div>

			<!-- Карта / Изображение -->
			<div class="ct-item ct-d2 relative">
				<div
					class="pointer-events-none absolute -right-6 -bottom-6 size-48 rounded-3xl bg-brand-600/90 sm:rounded-4xl lg:size-64"
					aria-hidden="true"
				></div>
				<div
					class="pointer-events-none absolute -top-4 -left-4 size-32 rounded-full bg-brand-600/25 blur-2xl"
					aria-hidden="true"
				></div>
				<div class="{ct.card.onLight} relative overflow-hidden">
					<EditableField
						fieldKey="ContactAddress.mapImageUrl"
						label="URL изображения карты"
						value={String(data?.mapImageUrl || '')}
						{isEditable}
						onSave={(v) => saveField('mapImageUrl', v)}
						class="block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<img loading="lazy" src={displayValue} alt="Карта" class="w-full object-cover" />
							{:else}
								<div class="flex aspect-square items-center justify-center bg-surface-paper">
									<div class="text-center">
										<svg
											class="mx-auto size-16 text-ink-300"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											stroke-width="1"
											aria-hidden="true"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
											/>
										</svg>
										<p class="mt-4 text-lg font-semibold text-ink-500">Карта</p>
										<p class="mt-1 text-sm text-ink-400">Добавьте URL изображения карты</p>
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
