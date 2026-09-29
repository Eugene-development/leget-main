<script lang="ts">
	let {
		id,
		cover,
		admin = false
	}: { id: string; cover?: string | null; admin?: boolean } = $props();
	let video = $state<HTMLVideoElement>();
	let failed = $state(false);
	let retry = $state(0);
	const base = $derived(`${admin ? '/admin' : ''}/university/media/`);
	export function seek(seconds: number) {
		if (video) {
			video.currentTime = seconds;
			video.play().catch(() => {});
		}
	}
</script>

<div class="study-video">
	<video
		bind:this={video}
		controls
		preload="metadata"
		playsinline
		src={`${base}${id}?retry=${retry}`}
		poster={cover ? `${base}${cover}` : undefined}
		onerror={() => (failed = true)}
		onloadedmetadata={() => (failed = false)}
		aria-label="Учебное видео"><track kind="captions" /></video
	>
	{#if failed}<p role="alert">Не удалось воспроизвести видео. Проверьте соединение.</p>
		<button
			class="study-button study-button-secondary"
			onclick={() => {
				failed = false;
				retry++;
			}}
			data-goal-ignore="Повтор загрузки учебного видео">Загрузить снова</button
		>{/if}
</div>
