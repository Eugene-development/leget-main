<script lang="ts">
	// Артикул: 2.17.7.2 — см. docs/architecture/component-articles-map.md
	import ContentText from '../../../../ContentText.svelte';
	import EquipmentConsultationButton from '../../EquipmentConsultationButton.svelte';
	import type { PageComponentProps } from '$lib/components/templates/types';
	import { blockTheme } from '$lib/utils/block-theme';
	import '$lib/components/templates/Promo-1/theme.css';
	import { equipmentDefaults } from '../../content';
	import '../../equipment.css';

	let { data = $bindable(), editContext = null, isEditable = false }: PageComponentProps = $props();
	const defaults = equipmentDefaults.EquipmentCTA;
</script>

<section class="equipment-v2 equipment-cta" data-p1-theme={blockTheme(data, 'dark')}>
	<div class="p2-container">
		<div class="equipment-cta-frame">
			<h2 class="equipment-title">
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
			<p class="equipment-copy">
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
				class="equipment-cta-button"
			/>
		</div>
	</div>
</section>
