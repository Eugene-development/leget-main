<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { auth } from '$lib/stores/auth';

	let { triggerClass = '' }: { triggerClass?: string } = $props();
	const roles = ['admin', 'superadmin', 'manager'];
	const editorAccess = $derived(
		$auth.isAuthenticated && roles.includes($auth.user?.role ?? '')
	);
	const cabinetAccess = $derived(roles.includes(page.data.client?.role ?? ''));
</script>

{#if editorAccess || cabinetAccess}
	<a
		href={resolve(editorAccess ? '/crm-access' : '/crm')}
		class="relative flex h-9 shrink-0 items-center justify-center px-2 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-link-600 focus-visible:ring-offset-2 {triggerClass}"
		title="CRM сайта"
		aria-label="Открыть CRM"
	>CRM</a>
{/if}
