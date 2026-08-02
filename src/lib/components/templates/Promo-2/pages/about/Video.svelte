<script lang="ts">
	// Артикул: 2.2.5.1 — см. docs/architecture/component-articles-map.md
	import { onMount } from 'svelte';
	import { saveComponentData, type EditContext } from '$lib/utils/page-edit';

	let {
		data = $bindable(),
		editContext = null,
		isEditable = false
	}: {
		data: Record<string, unknown>;
		editContext?: EditContext | null;
		isEditable?: boolean;
	} = $props();

	let visible = $state(false);
	let sectionEl: HTMLElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) visible = true;
				});
			},
			{ threshold: 0.1 }
		);
		if (sectionEl) observer.observe(sectionEl);
		return () => observer.disconnect();
	});
</script>

<section class="relative z-10 -mt-12" bind:this={sectionEl}>
	<div class="mx-auto max-w-screen-xl px-6 xl:px-1">
		<div
			class="relative overflow-hidden opacity-0"
			class:animate-scale-in={visible}
		>
			<video
				class="h-[400px] w-full bg-black object-cover lg:h-[640px]"
				controls
				preload="metadata"
			>
				<source
					src="{String(data?.src ?? 'https://storage.yandexcloud.net/zovrus/zov.mp4')}#t=3"
					type="video/mp4"
				/>
			</video>
			<!-- Video overlay gradient -->
			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-primary/10"
			></div>
		</div>
	</div>
</section>
