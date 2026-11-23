<script lang="ts">
	const titleId = $props.id();
</script>

<aside
	aria-labelledby={titleId}
	class="p1-surface-alt p1-border p1-title flex flex-col items-start gap-4 rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between md:gap-6"
>
	<div class="min-w-0">
		<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
			<h2 id={titleId} class="text-xl sm:text-2xl">Отзывы клиентов на Яндексе</h2>
			<span class="p1-body text-xs">Реклама</span>
		</div>
		<p class="p1-body mt-1.5 max-w-prose text-sm leading-relaxed">
			Для компаний, которые хотят разместить отзывы реальных клиентов и поддерживать свою репутацию.
		</p>
	</div>
	<a
		href="https://otzovik.biz/"
		target="_blank"
		rel="sponsored noopener noreferrer"
		class="p1-surface p1-border p1-title p1-accent-hover p1-accent-border-hover inline-flex min-h-11 max-w-full shrink-0 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link-600"
	>
		Перейти на OTZOVIK.biz<span class="sr-only"> (в новой вкладке)</span>
	</a>
</aside>
