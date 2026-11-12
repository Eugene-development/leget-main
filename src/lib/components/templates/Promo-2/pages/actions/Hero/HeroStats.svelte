<script lang="ts">
	import ContentText from '$lib/components/templates/Promo-2/ContentText.svelte';
	import HeroField from './HeroField.svelte';
	import type { EditContext } from '$lib/utils/page-edit';
	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();
</script>

<dl class="ah-stats">
	<div>
		<dt>
			<ContentText
				bind:data
				{editContext}
				{isEditable}
				componentType="Hero"
				path={['copy', 'statCountLabel']}
				fallback={'Акций сейчас'}
				label="Акций сейчас"
			/>
		</dt>
		<dd>
			<HeroField
				bind:data
				{editContext}
				{isEditable}
				field="statCount"
				label="Количество акций"
				fallback="6+"
			/>
		</dd>
	</div>
	<div>
		<dt>
			<ContentText
				bind:data
				{editContext}
				{isEditable}
				componentType="Hero"
				path={['copy', 'statDiscountLabel']}
				fallback={'Максимальная скидка'}
				label="Максимальная скидка"
			/>
		</dt>
		<dd>
			<HeroField
				bind:data
				{editContext}
				{isEditable}
				field="statDiscount"
				label="Максимальная скидка"
				fallback="−30%"
			/>
		</dd>
	</div>
	<div class="ah-delivery">
		<dt>
			<ContentText
				bind:data
				{editContext}
				{isEditable}
				componentType="Hero"
				path={['copy', 'statDeliveryLabel']}
				fallback={'За доставку'}
				label="За доставку"
			/>
		</dt>
		<dd>
			<ContentText
				bind:data
				{editContext}
				{isEditable}
				componentType="Hero"
				path={['copy', 'statDelivery']}
				fallback={'0 ₽'}
				label="0 ₽"
			/>
		</dd>
	</div>
</dl>
