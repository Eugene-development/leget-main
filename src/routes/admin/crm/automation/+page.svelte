<script lang="ts">
	import Feature from '../../../crm/automation/+page.svelte';
	let { data } = $props<{ data: import('svelte').ComponentProps<typeof Feature>['data'] }>();
</script>

<Feature {data} />
