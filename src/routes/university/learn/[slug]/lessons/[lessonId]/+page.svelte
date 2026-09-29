<script lang="ts">
	import Assessment from '$lib/university/Assessment.svelte';
	import LessonContent from '$lib/university/LessonContent.svelte';
	import { lessonUrl } from '$lib/university/navigation';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const index = $derived(data.course.lessons.findIndex((l) => l.id === data.lesson.id));
	const next = $derived(lessonUrl(data.course, data.course.lessons[index + 1]?.id ?? 'exam'));
</script>

<svelte:head
	><title>{data.lesson.title} — Универ</title><meta name="robots" content="noindex" /></svelte:head
>
{#key `${data.course.slug}/${data.lesson.id}`}<LessonContent lesson={data.lesson}
		><Assessment
			course={data.course}
			assessment={data.lesson.id}
			questions={data.lesson.questions ?? []}
			{next}
		/>
		<nav class="study-next" aria-label="Соседние уроки">
			<a
				href={index
					? lessonUrl(data.course, data.course.lessons[index - 1].id)
					: `/university/learn/${data.course.slug}`}>{index ? 'Предыдущий урок' : 'Обзор курса'}</a
			><a href={next}
				>{index + 1 < data.course.lessons.length ? 'Следующий урок' : 'Итоговый экзамен'}</a
			>
		</nav></LessonContent
	>{/key}
