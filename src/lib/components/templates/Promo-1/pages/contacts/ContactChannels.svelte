<script lang="ts">
	// Артикул: 1.5.2.1 — см. docs/architecture/component-articles-map.md
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
		type: 'ContactChannels',
		fallback: 'light',
		getData: () => data,
		setData: (next) => (data = next),
		getContext: () => editContext
	});

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'ContactChannels', updated);
		data = updated;
	}

	const arrowPath = 'M17 8l4 4m0 0l-4 4m4-4H3';
</script>

<!-- Поверхность, радиусы, акцент и анимации — из общей темы страницы (./theme.ts). -->
<section
	class="{ct.section.shell} {ct.section.pad} {ct.surface.base}"
	data-p1-theme={isLight ? 'light' : 'dark'}
>
	<BlockThemeToggle {isLight} onToggle={toggleTheme} {isEditable} {editContext} />

	<div class="pointer-events-none absolute inset-0" aria-hidden="true">
		<div class={ct.accent.toplineOnLight}></div>
	</div>

	<div class={ct.section.container}>
		<div use:revealOnScroll class="ct-reveal grid gap-6 lg:grid-cols-3 lg:gap-8">
			<!-- Телефон -->
			<div class="ct-item {ct.card.tileOnLight}">
				<div
					class="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-red-600/8 transition duration-300 group-hover:scale-150"
				></div>
				<div class="relative">
					<div class={ct.iconTile}>
						<svg
							class="size-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
							/>
						</svg>
					</div>

					<EditableField
						fieldKey="ContactChannels.phoneTitle"
						label="Заголовок"
						value={String(data?.phoneTitle || 'Телефон')}
						{isEditable}
						onSave={(v) => saveField('phoneTitle', v)}
						class="mt-6 block"
					>
						{#snippet children(displayValue)}
							<h3 class={ct.title.h3OnLight}>{displayValue}</h3>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactChannels.phoneDescription"
						label="Описание"
						value={String(
							data?.phoneDescription || 'Позвоните нам, и мы проконсультируем вас по любым вопросам'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('phoneDescription', v)}
						class="mt-3 block"
					>
						{#snippet children(displayValue)}
							<p class={ct.body.onLight}>{displayValue}</p>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactChannels.phone"
						label="Номер телефона"
						value={String(data?.phone || '+7 (999) 000-00-00')}
						{isEditable}
						onSave={(v) => saveField('phone', v)}
						class="mt-6 block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<a href="tel:{displayValue}" class={ct.btn.link}>
									{displayValue}
									<svg
										class="size-4 {ct.arrow}"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d={arrowPath} />
									</svg>
								</a>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>

			<!-- Почта -->
			<div class="ct-item ct-d1 {ct.card.tileOnLight}">
				<div
					class="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-red-600/8 transition duration-300 group-hover:scale-150"
				></div>
				<div class="relative">
					<div class={ct.iconTile}>
						<svg
							class="size-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
							/>
						</svg>
					</div>

					<EditableField
						fieldKey="ContactChannels.emailTitle"
						label="Заголовок"
						value={String(data?.emailTitle || 'Почта')}
						{isEditable}
						onSave={(v) => saveField('emailTitle', v)}
						class="mt-6 block"
					>
						{#snippet children(displayValue)}
							<h3 class={ct.title.h3OnLight}>{displayValue}</h3>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactChannels.emailDescription"
						label="Описание"
						value={String(
							data?.emailDescription || 'Напишите нам, и мы обязательно ответим в течение 24 часов'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('emailDescription', v)}
						class="mt-3 block"
					>
						{#snippet children(displayValue)}
							<p class={ct.body.onLight}>{displayValue}</p>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactChannels.email"
						label="Email"
						value={String(data?.email || 'info@leget.ru')}
						{isEditable}
						onSave={(v) => saveField('email', v)}
						class="mt-6 block"
					>
						{#snippet children(displayValue)}
							{#if displayValue}
								<a href="mailto:{displayValue}" class={ct.btn.link}>
									{displayValue}
									<svg
										class="size-4 {ct.arrow}"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										aria-hidden="true"
									>
										<path stroke-linecap="round" stroke-linejoin="round" d={arrowPath} />
									</svg>
								</a>
							{/if}
						{/snippet}
					</EditableField>
				</div>
			</div>

			<!-- Онлайн-чат -->
			<div class="ct-item ct-d2 {ct.card.tileOnLight}">
				<div
					class="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-red-600/8 transition duration-300 group-hover:scale-150"
				></div>
				<div class="relative">
					<div class={ct.iconTile}>
						<svg
							class="size-7"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="1.5"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
							/>
						</svg>
					</div>

					<EditableField
						fieldKey="ContactChannels.chatTitle"
						label="Заголовок"
						value={String(data?.chatTitle || 'Онлайн-чат')}
						{isEditable}
						onSave={(v) => saveField('chatTitle', v)}
						class="mt-6 block"
					>
						{#snippet children(displayValue)}
							<h3 class={ct.title.h3OnLight}>{displayValue}</h3>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactChannels.chatDescription"
						label="Описание"
						value={String(
							data?.chatDescription || 'Мы готовы помочь вам в режиме реального времени'
						)}
						{isEditable}
						multiline
						onSave={(v) => saveField('chatDescription', v)}
						class="mt-3 block"
					>
						{#snippet children(displayValue)}
							<p class={ct.body.onLight}>{displayValue}</p>
						{/snippet}
					</EditableField>

					<EditableField
						fieldKey="ContactChannels.chatLabel"
						label="Текст статуса"
						value={String(data?.chatLabel || 'Чат на экране')}
						{isEditable}
						onSave={(v) => saveField('chatLabel', v)}
						class="mt-6 block"
					>
						{#snippet children(displayValue)}
							<p class={ct.btn.link}>
								{displayValue}
								<span class="relative flex size-2.5" aria-hidden="true">
									<span
										class="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60 motion-reduce:animate-none"
									></span>
									<span class="relative inline-flex size-2.5 rounded-full bg-red-600"></span>
								</span>
							</p>
						{/snippet}
					</EditableField>
				</div>
			</div>
		</div>
	</div>
</section>
