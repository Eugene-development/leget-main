<script lang="ts">
	import Shell from '$lib/university/StudyShell.svelte';
	import Icon from '$lib/university/StudyIcon.svelte';
	import { continueUrl, passes } from '$lib/university/navigation';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const courses = $derived(data.dashboard.courses.filter((c) => c.status !== 'archived'));
	const disciplines = $derived([...new Set(courses.map((c) => c.discipline))]);
</script>

<svelte:head><title>Курсы — Универ</title><meta name="robots" content="noindex" /></svelte:head>
<Shell {courses} sidebar title="Курсы"
	><div class="study-container">
		<div class="study-intro">
			<h1>Учиться понимать.<br />Создавать своё.</h1>
			<p>
				Устройство дома — от первого плана до деталей, с которыми вы живёте каждый день. Выберите
				тему и двигайтесь в своём темпе.
			</p>
			<div class="study-meta">
				<span><Icon name="book" size={16} />{disciplines.length} дисциплин</span><span
					><Icon name="file" size={16} />{courses.length} курсов</span
				><a class="study-link" href="/university/student">Моё обучение</a>
			</div>
		</div>
		{#if !courses.length}<p class="study-empty">
				Курсы ещё готовятся. Они появятся здесь после публикации.
			</p>{/if}
		{#each disciplines as discipline}<section class="study-section">
				<h2>{discipline}</h2>
				<div class="study-list">
					{#each courses.filter((c) => c.discipline === discipline) as course}{@const done = passes(
							course,
							data.dashboard.attempts
						)}
						<article class="study-list-item">
							<span class="study-list-icon"
								><Icon name={done.has('exam') ? 'check' : 'book'} size={17} /></span
							>
							<div>
								<h3><a href="/university/learn/{course.slug}">{course.title}</a></h3>
								<p>{course.description}</p>
								<div class="study-meta">
									<span
										>{course.lessons.length} урока · {course.lessons.filter((l) => done.has(l.id))
											.length} зачтено</span
									><a class="study-link" href={continueUrl(course, data.dashboard.attempts)}
										>{done.size ? 'Продолжить' : 'Начать курс'}</a
									>
								</div>
							</div>
						</article>{/each}
				</div>
			</section>{/each}
	</div></Shell
>
