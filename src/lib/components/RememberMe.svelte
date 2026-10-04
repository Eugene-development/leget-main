<script lang="ts">
	let { checked = $bindable(false), disabled = false }: { checked?: boolean; disabled?: boolean } =
		$props();
</script>

<label class="remember-me text-sm">
	<input
		class="accent-link-600"
		type="checkbox"
		name="remember"
		value="1"
		bind:checked
		{disabled}
	/>
	<span>Запомнить меня</span>
</label>

<style>
	.remember-me {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		min-height: 2.75rem;
		margin-block: 0.5rem;
		cursor: pointer;
	}
	.remember-me input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		min-height: 0;
		padding: 0;
		margin: 0;
		flex: none;
		appearance: auto;
	}
</style>
