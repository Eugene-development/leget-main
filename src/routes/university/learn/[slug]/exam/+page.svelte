<script lang="ts">
	import Assessment from '$lib/university/Assessment.svelte';
	import { lessonUrl, passes } from '$lib/university/navigation';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const missing = $derived(
		data.course.lessons.filter((l) => !passes(data.course, data.attempts).has(l.id))
	);
</script>

<svelte:head
	><title>Экзамен — {data.course.title}</title><meta name="robots" content="noindex" /></svelte:head
>
<div class="study-interview">
	<h1>Итоговый экзамен</h1>
	<p>{data.course.title}</p>
	{#if missing.length}<section class="study-empty">
			<h2>Сначала завершите уроки</h2>
			<p>Сдайте тесты этих уроков, чтобы открыть итоговый экзамен.</p>
			<ul>
				{#each missing as lesson}<li>
						<a class="study-link" href={lessonUrl(data.course, lesson.id)}>{lesson.title}</a>
					</li>{/each}
			</ul>
		</section>{:else}<p>
			Проверьте, что вы усвоили. Для сертификата нужно не менее 75% правильных ответов.
		</p>
		{#key data.course.slug}<Assessment
				course={data.course}
				assessment="exam"
				questions={data.course.exam}
			/>{/key}{/if}
</div>
