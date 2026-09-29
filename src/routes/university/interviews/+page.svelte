<script lang="ts">
	import Shell from '$lib/university/StudyShell.svelte';
	import Icon from '$lib/university/StudyIcon.svelte';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Интервью — Универ</title><meta name="robots" content="noindex" /></svelte:head>
<Shell title="Интервью"
	><div class="study-container">
		<div class="study-intro">
			<h1>Интервью</h1>
			<p>Разговоры о доме, ремесле и решениях, которые меняют повседневную жизнь.</p>
		</div>
		{#if !data.interviews.length}<div class="study-empty">
				<h2>Разговоры ещё впереди</h2>
				<p>Здесь появятся интервью с практиками. Пока можно выбрать тему в программе курсов.</p>
				<a class="study-link" href="/university/learn">К курсам</a>
			</div>{:else}<div class="study-media-grid">
				{#each data.interviews as item}<a
						class="study-media-card"
						href="/university/interviews/{item.slug}"
						>{#if item.cover_id}<img
								src="/university/media/{item.cover_id}"
								alt={item.speaker}
								loading="lazy"
							/>{:else}<div class="study-cover-empty"><Icon name="play" size={32} /></div>{/if}
						<h2>{item.speaker}</h2>
						<p>{item.title}</p></a
					>{/each}
			</div>{/if}
	</div></Shell
>
