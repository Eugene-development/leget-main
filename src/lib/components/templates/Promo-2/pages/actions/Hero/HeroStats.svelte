<script lang="ts">
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
		<dt>Акций сейчас</dt>
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
		<dt>Максимальная скидка</dt>
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
		<dt>За доставку</dt>
		<dd>0 ₽</dd>
	</div>
</dl>
