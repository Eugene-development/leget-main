<script lang="ts">
	import Video from './StudyVideo.svelte';
	import RichText from '$lib/components/RichText.svelte';
	import { timeLabel } from './navigation';
	import type { Interview } from './types';
	let { interview, admin = false }: { interview: Interview; admin?: boolean } = $props();
	let player = $state<Video>();
</script>

<div class="study-container">
	{#if interview.video_id}<Video
			bind:this={player}
			id={interview.video_id}
			cover={interview.cover_id}
			{admin}
		/>{/if}
	<article class="study-interview">
		<h1>{interview.title}</h1>
		<p>{interview.speaker} · {interview.description}</p>
		{#if interview.intro}<div class="study-prose">
				<RichText value={interview.intro} />
			</div>{/if}{#if interview.chapters?.length}<section class="study-transcript">
				<h2>Главы</h2>
				{#each interview.chapters as chapter}<div class="study-timestamp-row">
						<button
							class="study-timestamp"
							onclick={() => player?.seek(chapter.start)}
							aria-label="Перейти к {timeLabel(chapter.start)}"
							data-goal-ignore="Перемотка интервью по главам">{timeLabel(chapter.start)}</button
						><span>{chapter.title}</span>
					</div>{/each}
			</section>{/if}{#if interview.transcript?.length}<section class="study-transcript">
				<h2>Расшифровка</h2>
				{#each interview.transcript as line}<div class="study-timestamp-row">
						<button
							class="study-timestamp"
							onclick={() => player?.seek(line.start)}
							aria-label="Перейти к {timeLabel(line.start)}"
							data-goal-ignore="Перемотка интервью по расшифровке">{timeLabel(line.start)}</button
						>
						<div>
							<strong>{line.speaker}</strong>
							<p>{line.text}</p>
						</div>
					</div>{/each}
			</section>{/if}
	</article>
</div>
