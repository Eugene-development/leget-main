<script lang="ts">
	import RichText from '$lib/components/RichText.svelte';
	// Артикулы: 1.16.6.1, 1.17.5.1, 1.18.5.1 — см. docs/architecture/component-articles-map.md
	import EditableField from '$lib/components/EditableField.svelte';
	import { serviceOrderStore } from '$lib/stores/serviceOrder.svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';
	import { sitePhoneHref } from '$lib/utils/site-phone';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false,
		sitePhone = null
	}: {
		data: any;
		editContext?: EditContext | null;
		isEditable?: boolean;
		sitePhone?: string | null;
	} = $props();

	// Read-only мост из header_data.phone: локальную копию номера CTA не хранит.
	const phoneHref = $derived(sitePhoneHref(sitePhone));

	async function saveField(field: string, value: string) {
		if (!editContext) return;
		const updated = { ...data, [field]: value };
		await saveComponentData(editContext, 'MebelCTA', updated);
		data = updated;
	}
</script>

<div class="p1-catalog-container mt-12 mb-12">
	<div
		class="relative isolate overflow-hidden rounded-2xl bg-linear-to-br from-accent-panel to-accent-panel-deep px-6 py-10 text-center text-on-accent shadow-xl ring-1 ring-on-accent/10 ring-inset sm:px-12 sm:py-14"
	>
		<h2 class="mx-auto max-w-2xl text-2xl text-balance sm:text-3xl">
			<EditableField
				fieldKey="MebelCTA.title"
				label="Заголовок"
				value={String(data.title || 'Готовы начать проект?')}
				{isEditable}
				inline
				onSave={(v) => saveField('title', v)}
			>
				{#snippet children(val)}
					<RichText value={val} />
				{/snippet}
			</EditableField>
		</h2>

		<p class="mx-auto mt-4 max-w-xl text-pretty text-on-accent-muted">
			<EditableField
				fieldKey="MebelCTA.description"
				label="Описание"
				value={String(
					data.description ||
						'Оставьте заявку и получите бесплатный дизайн-проект вашей будущей мебели'
				)}
				{isEditable}
				inline
				multiline
				onSave={(v) => saveField('description', v)}
			>
				{#snippet children(val)}
					<RichText value={val} />
				{/snippet}
			</EditableField>
		</p>

		<div class="mx-auto mt-8 flex max-w-xl flex-col justify-center gap-3 sm:flex-row">
			<button
				data-metrika-goal="pages_mebel_mebelcta_open_1"
				data-goal-label="Получить консультацию — CTA мебели"
				data-goal-action="open"
				type="button"
				onclick={() => serviceOrderStore.open('consultation')}
				class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface-raised px-7 py-3 font-medium text-accent-ink shadow-sm transition-[transform,background-color,box-shadow] ease-ui hover:-translate-y-0.5 hover:bg-accent-ink-wash hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent active:translate-y-0 sm:w-auto"
			>
				<EditableField
					fieldKey="MebelCTA.buttonText"
					label="Текст кнопки"
					value={String(data.buttonText || 'Получить консультацию')}
					{isEditable}
					inline
					onSave={(v) => saveField('buttonText', v)}
				>
					{#snippet children(val)}
						<RichText value={val} />
					{/snippet}
				</EditableField>
			</button>

			<a
				href={phoneHref}
				class="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-on-accent/20 bg-on-accent/10 px-7 py-3 font-medium text-on-accent transition-[transform,background-color,border-color] ease-ui hover:-translate-y-0.5 hover:border-on-accent/30 hover:bg-on-accent/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-accent active:translate-y-0 sm:hidden"
			>
				<svg
					class="h-[18px] w-[18px]"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
					/>
				</svg>
				Позвонить
			</a>
		</div>
	</div>
</div>
