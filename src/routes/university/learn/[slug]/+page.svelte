<script lang="ts">
	import Icon from '$lib/university/StudyIcon.svelte';
	import { continueUrl, lessonUrl, passes } from '$lib/university/navigation';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const done = $derived(passes(data.course, data.attempts));
</script>

<svelte:head
	><title>{data.course.title} — Универ</title><meta name="robots" content="noindex" /></svelte:head
>
<div class="study-container">
	<header class="study-course-hero">
		{#if data.course.cover_id}<img src="/university/media/{data.course.cover_id}" alt="" />{/if}
		<div>
			<h1>{data.course.title}</h1>
			<p>{data.course.description}</p>
			<div class="study-meta">
				<span><Icon name="book" size={16} />{data.course.discipline}</span><span
					><Icon name="file" size={16} />{data.course.lessons.length} урока и экзамен</span
				>
			</div>
			<div class="study-actions">
				<a class="study-button" href={continueUrl(data.course, data.attempts)}
					><Icon name="play" size={14} />{done.size ? 'Продолжить курс' : 'Начать курс'}</a
				>{#if data.course.status === 'archived'}<span
						>Предыдущая редакция · ваши результаты сохранены</span
					>{/if}
			</div>
		</div>
	</header>
	<section class="study-section">
		<h2>Программа курса</h2>
		<div class="study-list">
			{#each data.course.lessons as lesson, i}<article class="study-list-item">
					<span class="study-list-icon"
						><Icon
							name={done.has(lesson.id) ? 'check' : lesson.video_id ? 'play' : 'file'}
							size={17}
						/></span
					>
					<div>
						<h3><a href={lessonUrl(data.course, lesson.id)}>{lesson.title}</a></h3>
						<p>
							Урок {i + 1} · {lesson.video_id
								? 'Видео, материал и тест'
								: 'Материал и тест'}{done.has(lesson.id) ? ' · Зачтён' : ''}
						</p>
					</div>
				</article>{/each}
			<article class="study-list-item">
				<span class="study-list-icon"><Icon name="check" size={17} /></span>
				<div>
					<h3><a href={lessonUrl(data.course, 'exam')}>Итоговый экзамен</a></h3>
					<p>После зачёта всех уроков. Сертификат при результате от 75%.</p>
				</div>
			</article>
		</div>
	</section>
</div>
