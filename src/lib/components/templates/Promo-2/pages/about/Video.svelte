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
	let videoEl: HTMLVideoElement;

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

		let playbackTimer: ReturnType<typeof setTimeout> | undefined;
		let frame: number | undefined;
		let playbackEligible = false;
		let disposed = false;

		function cancelPlaybackTimer() {
			clearTimeout(playbackTimer);
			playbackTimer = undefined;
		}

		function updatePlayback() {
			const rect = videoEl.getBoundingClientRect();
			const center = rect.top + rect.height / 2;
			const inCenter = center >= window.innerHeight * 0.35 && center <= window.innerHeight * 0.65;
			const fullyVisible =
				rect.top >= 0 &&
				rect.bottom <= window.innerHeight &&
				rect.left >= 0 &&
				rect.right <= window.innerWidth;
			const canPlay = !document.hidden && (inCenter || fullyVisible);

			if (!canPlay) {
				playbackEligible = false;
				cancelPlaybackTimer();
				videoEl.pause();
			} else if (!playbackEligible) {
				playbackEligible = true;
				playbackTimer = setTimeout(() => {
					playbackTimer = undefined;
					updatePlayback();
					if (!playbackEligible || disposed) return;
					void videoEl
						.play()
						.then(() => {
							if (!playbackEligible || disposed || document.hidden) videoEl.pause();
						})
						.catch(() => {
							// Browser autoplay restrictions leave the native controls available.
						});
				}, 1000);
			}
		}

		function schedulePlaybackUpdate() {
			if (frame !== undefined) return;
			frame = requestAnimationFrame(() => {
				frame = undefined;
				updatePlayback();
			});
		}

		window.addEventListener('scroll', schedulePlaybackUpdate, { passive: true, capture: true });
		window.addEventListener('resize', schedulePlaybackUpdate);
		document.addEventListener('visibilitychange', updatePlayback);
		updatePlayback();

		return () => {
			disposed = true;
			observer.disconnect();
			cancelPlaybackTimer();
			if (frame !== undefined) cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedulePlaybackUpdate, true);
			window.removeEventListener('resize', schedulePlaybackUpdate);
			document.removeEventListener('visibilitychange', updatePlayback);
			videoEl.pause();
		};
	});
</script>

<section class="relative z-10 -mt-12 pb-24 lg:pb-32" bind:this={sectionEl}>
	<div class="p2-container mx-auto">
		<div
			class="relative overflow-hidden rounded-3xl opacity-0 shadow-[0_28px_60px_-12px] shadow-primary/40"
			class:animate-scale-in={visible}
		>
			<video
				bind:this={videoEl}
				class="h-[400px] w-full bg-black object-cover lg:h-[640px]"
				controls
				muted
				playsinline
				preload="metadata"
			>
				<source
					src="{String(
						data?.src ?? 'https://storage.yandexcloud.net/leget-main/templates/promo-2/zov.mp4'
					)}#t=3"
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
