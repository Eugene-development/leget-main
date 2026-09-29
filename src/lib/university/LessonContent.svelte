<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { Lesson } from './types';
	import RichText from '$lib/components/RichText.svelte';
	import Video from './StudyVideo.svelte';
	let {
		lesson,
		children,
		admin = false
	}: { lesson: Lesson; children?: Snippet; admin?: boolean } = $props();
	let active = $state('section-0');
	let root: HTMLDivElement;
	onMount(() => {
		const sections = Array.from(root.querySelectorAll('section[id]'));
		const visible = new Set<Element>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) visible.add(entry.target);
					else visible.delete(entry.target);
				}
				const first = sections.find((section) => visible.has(section));
				if (first) active = first.id;
			},
			{ rootMargin: '-100px 0px -55% 0px' }
		);
		sections.forEach((section) => observer.observe(section));
		return () => observer.disconnect();
	});
</script>

<div class="study-reader" bind:this={root}>
	<div class="study-reader-content">
		<h1>{lesson.title}</h1>
		{#if lesson.video_id}<Video id={lesson.video_id} {admin} />{/if}
		<article class="study-prose">
			{#each lesson.sections ?? [] as section, i}<section id="section-{i}">
					<h2>{section.title}</h2>
					<RichText value={section.text} />
				</section>{/each}{#if lesson.practice}<section id="practice">
					<h2>Практическое задание</h2>
					<RichText value={lesson.practice} />
				</section>{/if}
		</article>
		{@render children?.()}
	</div>
	<nav class="study-toc" aria-label="Оглавление урока">
		<h2>В этом уроке</h2>
		{#each lesson.sections ?? [] as section, i}<a
				href="#section-{i}"
				aria-current={active === `section-${i}` ? 'location' : undefined}>{section.title}</a
			>{/each}{#if lesson.practice}<a
				href="#practice"
				aria-current={active === 'practice' ? 'location' : undefined}>Практическое задание</a
			>{/if}{#if children}<a
				href="#assessment"
				aria-current={active === 'assessment' ? 'location' : undefined}>Проверим понимание</a
			>{/if}
	</nav>
</div>
