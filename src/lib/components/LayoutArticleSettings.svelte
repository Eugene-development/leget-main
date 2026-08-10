<script lang="ts">
	import ArticleBadge from '$lib/components/ArticleBadge.svelte';
	import SideDrawer from '$lib/components/SideDrawer.svelte';
	import { getLayoutComponentArticle, type EditContext } from '$lib/utils/page-edit';

	let {
		editContext = null,
		isEditable = false,
		type,
		title
	}: {
		editContext?: EditContext | null;
		isEditable?: boolean;
		type: 'Header' | 'Footer';
		title: string;
	} = $props();

	let open = $state(false);
	const article = $derived(
		editContext?.templateId != null
			? getLayoutComponentArticle(editContext.templateId, type, 1)
			: null
	);
</script>

{#if isEditable && editContext}
	<button
		type="button"
		class="flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-slate-950/75 p-2.5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/25 active:scale-95"
		onclick={() => (open = true)}
		title="Настройки компонента"
		aria-label="Настройки компонента {title}"
	>
		<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
			<circle cx="9" cy="6" r="2" fill="currentColor" />
			<circle cx="15" cy="12" r="2" fill="currentColor" />
			<circle cx="8" cy="18" r="2" fill="currentColor" />
		</svg>
	</button>

	<SideDrawer bind:open {title} eyebrow="Компонент макета">
		<div class="flex flex-col gap-6">
			<div class="flex items-center gap-2">
				<span class="text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">
					Артикул
				</span>
				{#if article}
					<ArticleBadge {article} sectionLabel="Раздел" align="left" />
				{/if}
			</div>
		</div>
	</SideDrawer>
{/if}
