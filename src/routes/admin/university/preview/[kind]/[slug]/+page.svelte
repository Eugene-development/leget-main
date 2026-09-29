<script lang="ts">
	import AssessmentPreview from '$lib/university/admin/AssessmentPreview.svelte';
	import Lesson from '$lib/university/LessonContent.svelte';
	import Interview from '$lib/university/InterviewContent.svelte';
	import { resourceUrl } from '$lib/university/navigation';
	import type { Interview as InterviewType, Resource } from '$lib/university/types';
	import '$lib/university/study.css';
	import '$lib/university/admin/editor.css';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	let index = $state(0);
</script>

<svelte:head
	><title>Предпросмотр — {data.item.title}</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<div class="campus">
	<header class="editor-preview-bar">
		<span>Предпросмотр сохранённого материала · {data.item.status}</span><a
			class="study-link"
			href="/admin/university">К редактору</a
		>
	</header>
	<main class="editor-preview">
		{#if data.kind === 'courses' && data.item.curriculum}<article class="study-container">
				<h1>{data.item.title}</h1>
				<p>{data.item.description}</p>
				<nav aria-label="Уроки предпросмотра">
					{#each data.item.curriculum.lessons as lesson, i}<button
							onclick={() => (index = i)}
							data-goal-ignore="Выбор урока в предпросмотре">{lesson.title}</button
						>{/each}<button
						onclick={() => (index = data.item.curriculum?.lessons.length ?? 0)}
						data-goal-ignore="Предпросмотр экзамена">Экзамен</button
					>
				</nav>
				{#if data.item.curriculum.lessons[index]}{#key index}<Lesson
							lesson={data.item.curriculum.lessons[index]}
							admin
							><AssessmentPreview
								questions={data.item.curriculum.lessons[index].questions}
							/></Lesson
						>{/key}{:else}<AssessmentPreview questions={data.item.curriculum.exam} />{/if}
			</article>
		{:else if data.kind === 'interviews'}<Interview interview={data.item as InterviewType} admin />
		{:else}<article class="study-container">
				<h1>{data.item.title}</h1>
				<p>{data.item.description}</p>
				{#if data.item.cover_id}<img
						src="/admin/university/media/{data.item.cover_id}"
						alt={data.item.title}
						style="max-height:300px;margin:24px 0"
					/>{/if}{#if resourceUrl(data.item as Resource, true)}<a
						class="study-link"
						href={resourceUrl(data.item as Resource, true)}>Открыть материал</a
					>{/if}
			</article>{/if}
	</main>
</div>
