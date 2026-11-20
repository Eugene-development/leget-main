<script lang="ts">
	// Артикул: 2.17.7.1 — см. docs/architecture/component-articles-map.md
	import ContentText from '../../../../ContentText.svelte';
	import EquipmentConsultationButton from '../../EquipmentConsultationButton.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { equipmentDefaults } from '../../content';
	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();
	const defaults = equipmentDefaults.EquipmentCTA;
</script>

<section class="relative border-t border-border-light bg-surface-warm py-section-sm lg:py-section">
	<div class="p2-container mx-auto grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
		<h2 class="text-section-title text-primary" style="font-family: var(--font-heading);">
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
			<p class="max-w-2xl text-prose text-secondary">
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
			<EquipmentConsultationButton
				bind:data
				{editContext}
				{isEditable}
				class="mt-8 inline-flex min-h-12 cursor-pointer items-center gap-4 rounded-sm border border-secondary bg-secondary px-7 py-4 text-sm text-on-dark transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary"
			/>
		</div>
	</div>
</section>
