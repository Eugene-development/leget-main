<script lang="ts">
	// Артикул: 2.17.7.1 — см. docs/architecture/component-articles-map.md
	import ContentText from '../../ContentText.svelte';
	import { editableText } from '$lib/utils/editable-text';
	import { openPromo2Form } from '../../forms/request';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { equipmentDefaults } from './content';
	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();
	const defaults = equipmentDefaults.EquipmentCTA;
</script>

<section class="relative border-t border-border-light bg-surface-warm py-section-sm lg:py-section">
	<div class="p2-container mx-auto grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
		<h2 class="text-3xl text-primary lg:text-5xl" style="font-family: var(--font-heading);">
			<ContentText
				bind:data
				{editContext}
				{isEditable}
				componentType="EquipmentCTA"
				path={['heading']}
				fallback={defaults.heading}
				label="Заголовок"
			/>
		</h2>
		<div>
			<p class="max-w-2xl text-base leading-relaxed text-secondary lg:text-lg">
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="EquipmentCTA"
					path={['description']}
					fallback={defaults.description}
					label="Описание"
					multiline
				/>
			</p>
			<button
				type="button"
				data-metrika-goal="pages_equipment_equipmentcta_open"
				data-goal-action="open"
				data-goal-label="Обсудить комплектацию"
				aria-label={editableText(data?.linkText, defaults.linkText)}
				onclick={() => {
					if (!isEditable) openPromo2Form('consultation', 'Комплектация мебели');
				}}
				class="mt-8 inline-flex min-h-12 cursor-pointer items-center gap-4 rounded-sm border border-secondary bg-secondary px-7 py-4 text-sm text-on-dark transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
			>
				<ContentText
					bind:data
					{editContext}
					{isEditable}
					componentType="EquipmentCTA"
					path={['linkText']}
					fallback={defaults.linkText}
					label="Текст кнопки"
					richText={false}
				/>
				<svg
					class="h-4 w-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" /></svg
				>
			</button>
		</div>
	</div>
</section>
